const express = require("express");
const router = express.Router();
const SavedDocument = require("../models/SavedDocument");
const { optionalAuth } = require("../middleware/auth");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Save a new document version
router.post("/", optionalAuth, async (req, res) => {
    try {
        const docData = {
            ...req.body,
            id: Date.now(),
            userId: req.user ? req.user.id : null,
            createdByName: req.user ? req.user.fullName : "User",
        };
        const newDoc = new SavedDocument(docData);
        await newDoc.save();
        res.json(newDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific saved document
router.get("/:id", optionalAuth, async (req, res) => {
    try {
        const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
        if (!doc) return res.status(404).json({ error: "Document not found" });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an existing saved document (Creator or Superadmin)
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
        if (!doc) return res.status(404).json({ error: "Document not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";
        if (req.user && !isSuperAdmin && doc.userId && doc.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only edit your own saved versions." });
        }

        const updatedDoc = await SavedDocument.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(updatedDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export document as high-fidelity Word DOCX
router.get("/:id/docx", async (req, res) => {
    try {
        const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
        if (!doc) return res.status(404).json({ error: "Document not found" });

        const orderedPages = Object.keys(doc.pages || {})
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(k => doc.pages[k]);

        if (orderedPages.length === 0) {
            return res.status(400).json({ error: "No pages found in this document" });
        }

        const tempDir = os.tmpdir();
        const jsonPath = path.join(tempDir, `doc_${doc.id}_${Date.now()}.json`);
        const docxPath = path.join(tempDir, `doc_${doc.id}_${Date.now()}.docx`);

        fs.writeFileSync(jsonPath, JSON.stringify({
            name: doc.name || "Tender_Document",
            pages: orderedPages
        }), "utf-8");

        const pyScript = path.join(__dirname, "..", "docx_generator.py");

        execFile("python", [pyScript, jsonPath, docxPath], (err, stdout, stderr) => {
            if (err) {
                console.error("Python docx generator error:", err, stderr);
                return res.status(500).json({ error: "Failed to generate DOCX: " + stderr });
            }

            const cleanName = (doc.name || "Tender_Document").replace(/[/\\?%*:|"<>]/g, "_").trim();
            const filename = `${cleanName}.docx`;

            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

            res.download(docxPath, filename, () => {
                try {
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
                } catch (e) {}
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a saved document (Creator or Superadmin)
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
        if (!doc) return res.status(404).json({ error: "Document not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";
        if (req.user && !isSuperAdmin && doc.userId && doc.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own saved versions." });
        }

        await SavedDocument.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
