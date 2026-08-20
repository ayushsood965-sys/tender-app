const express = require("express");
const router = express.Router();
const SavedDocument = require("../models/SavedDocument");
const { optionalAuth } = require("../middleware/auth");
const { exec } = require("child_process");
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

        let orderedPages = Object.keys(doc.pages || {})
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(k => doc.pages[k]);

        if (orderedPages.length === 0) {
            return res.status(400).json({ error: "No pages found in this document" });
        }

        // Clean any legacy Annexure-A or unreplaced tokens from saved pages before generating DOCX
        orderedPages = orderedPages.map(p => {
            if (!p) return "";
            return p
                .replace(/format given at <strong>Annexure\s*[-–—]?\s*[‘'"]?A[’'"]?<\/strong>/gi, "format given at <strong>Annexure-II</strong> (Financial Bid Submission Form & Items Schedule Table)")
                .replace(/Annexure\s*[-–—]?\s*[‘'"]?A[’'"]?/gi, "Annexure-II");
        });

        const tempDir = os.tmpdir();
        const jsonPath = path.join(tempDir, `doc_${doc.id}_${Date.now()}.json`);
        const docxPath = path.join(tempDir, `doc_${doc.id}_${Date.now()}.docx`);

        fs.writeFileSync(jsonPath, JSON.stringify({
            name: doc.name || "Tender_Document",
            pages: orderedPages
        }), "utf-8");

        const pyScript = path.join(__dirname, "..", "docx_generator.py");
        const cmd = `python "${pyScript}" "${jsonPath}" "${docxPath}"`;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error("Python docx generator error:", err, stderr);
                try { if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath); } catch (e) {}
                return res.status(500).json({ error: "Failed to generate DOCX: " + (stderr || err.message) });
            }

            const cleanName = (doc.name || "Tender_Document").replace(/[/\\?%*:|"<>]/g, "_").trim();
            const filename = `${cleanName}.docx`;

            res.download(docxPath, filename, (downloadErr) => {
                try {
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
                } catch (e) {}
                if (downloadErr && !res.headersSent) {
                    res.status(500).json({ error: downloadErr.message });
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export document as Direct PDF
router.get("/:id/pdf", async (req, res) => {
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
        const pdfPath = path.join(tempDir, `doc_${doc.id}_${Date.now()}.pdf`);

        fs.writeFileSync(jsonPath, JSON.stringify({
            name: doc.name || "Tender_Document",
            pages: orderedPages
        }), "utf-8");

        const pyScript = path.join(__dirname, "..", "pdf_generator.py");
        const cmd = `python "${pyScript}" "${jsonPath}" "${pdfPath}"`;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error("Python PDF generator error:", err, stderr);
                try { if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath); } catch (e) {}
                return res.status(500).json({ error: "Failed to generate PDF: " + (stderr || err.message) });
            }

            const cleanName = (doc.name || "Tender_Document").replace(/[/\\?%*:|"<>]/g, "_").trim();
            const filename = `${cleanName}.pdf`;

            res.download(pdfPath, filename, (downloadErr) => {
                try {
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
                } catch (e) {}
                if (downloadErr && !res.headersSent) {
                    res.status(500).json({ error: downloadErr.message });
                }
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export document as Portal ZIP Package (e-Tender Two-Cover vs GeM ATC)
router.get("/:id/export-package", async (req, res) => {
    try {
        const profile = req.query.profile || "two_cover"; // "two_cover" | "gem"
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
        const zipPath = path.join(tempDir, `pkg_${doc.id}_${Date.now()}.zip`);

        fs.writeFileSync(jsonPath, JSON.stringify({
            name: doc.name || "Tender_Document",
            pages: orderedPages
        }), "utf-8");

        const pyScript = path.join(__dirname, "..", "pdf_generator.py");
        const cmd = `python "${pyScript}" "${jsonPath}" "${zipPath}" --package ${profile}`;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error("Python ZIP Packager error:", err, stderr);
                try { if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath); } catch (e) {}
                return res.status(500).json({ error: "Failed to generate portal package: " + (stderr || err.message) });
            }

            const cleanName = (doc.name || "Tender_Package").replace(/[/\\?%*:|"<>]/g, "_").trim();
            const filename = `${cleanName}_${profile === "gem" ? "GeM_ATC" : "TwoCover_Package"}.zip`;

            res.download(zipPath, filename, (downloadErr) => {
                try {
                    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
                    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                } catch (e) {}
                if (downloadErr && !res.headersSent) {
                    res.status(500).json({ error: downloadErr.message });
                }
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
