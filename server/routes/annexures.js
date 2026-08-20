const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const Annexure = require("../models/Annexure");
const Term = require("../models/Term");
const { optionalAuth } = require("../middleware/auth");

// Multer storage for uploaded annexure templates
const uploadDir = path.join(__dirname, "..", "uploads", "annexures");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `annexure-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if ([".docx", ".doc", ".pdf", ".txt", ".md"].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only .docx, .pdf, and .txt files are supported."));
        }
    },
});

// 1. Get all Annexures
router.get("/", async (req, res) => {
    try {
        const { docType, category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        if (docType) {
            query.$or = [
                { applicableDocTypes: "all" },
                { applicableDocTypes: docType }
            ];
        }
        const annexures = await Annexure.find(query).sort({ id: 1 });
        res.json(annexures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get single Annexure
router.get("/:id", async (req, res) => {
    try {
        const annexure = await Annexure.findOne({ id: parseInt(req.params.id) });
        if (!annexure) return res.status(404).json({ error: "Annexure not found" });
        res.json(annexure);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create Annexure manually
router.post("/", optionalAuth, async (req, res) => {
    try {
        const isSuperAdmin = req.user && req.user.role === "superadmin";
        const newAnnexure = new Annexure({
            ...req.body,
            id: req.body.id || Date.now(),
            userId: req.user ? req.user.id : null,
            createdByName: req.user ? req.user.fullName : "System Master",
            isMaster: isSuperAdmin ? (req.body.isMaster !== undefined ? req.body.isMaster : false) : false,
        });
        await newAnnexure.save();

        // If linked to a term, update the term
        if (newAnnexure.linkedTermId) {
            await Term.findOneAndUpdate(
                { id: newAnnexure.linkedTermId },
                {
                    hasAnnexure: true,
                    annexureId: newAnnexure.id,
                    annexureTitle: newAnnexure.title
                }
            );
        }

        res.json(newAnnexure);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Upload and process a document (.docx, .pdf, .txt) into an Annexure template
router.post("/upload", optionalAuth, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No document file uploaded" });
        }

        const filePath = req.file.path;
        const pyScript = path.join(__dirname, "..", "document_parser.py");

        execFile("python", [pyScript, filePath], { maxBuffer: 10 * 1024 * 1024 }, async (err, stdout, stderr) => {
            if (err) {
                console.error("Document parsing error:", err, stderr);
                return res.status(500).json({ error: "Failed to parse document: " + (stderr || err.message) });
            }

            try {
                const parsed = JSON.parse(stdout);
                if (parsed.error) {
                    return res.status(500).json({ error: parsed.error });
                }

                const title = req.body.title || parsed.title || req.file.originalname.replace(/\.[^/.]+$/, "");
                const category = req.body.category || "custom";
                const applicableDocTypes = req.body.applicableDocTypes ? JSON.parse(req.body.applicableDocTypes) : ["all"];
                const linkedTermId = req.body.linkedTermId ? parseInt(req.body.linkedTermId) : null;

                const newAnnexure = new Annexure({
                    id: Date.now(),
                    title: title,
                    code: "CUSTOM_" + Date.now(),
                    category: category,
                    applicableDocTypes: applicableDocTypes,
                    description: `Custom annexure extracted from ${req.file.originalname}`,
                    contentTemplate: parsed.contentTemplate || `<p>${title}</p>`,
                    isTable: parsed.isTable || false,
                    tableColumns: parsed.tableColumns || [],
                    linkedTermId: linkedTermId,
                    isCustomUploaded: true,
                    uploadedOriginalFileName: req.file.originalname,
                    isMaster: false,
                    userId: req.user ? req.user.id : null,
                    createdByName: req.user ? req.user.fullName : "Uploaded Document",
                });

                await newAnnexure.save();

                // If termId was supplied, link this annexure to the term
                if (linkedTermId) {
                    await Term.findOneAndUpdate(
                        { id: linkedTermId },
                        {
                            hasAnnexure: true,
                            annexureId: newAnnexure.id,
                            annexureTitle: newAnnexure.title
                        }
                    );
                }

                res.json(newAnnexure);
            } catch (parseErr) {
                console.error("JSON parse or DB save error:", parseErr);
                res.status(500).json({ error: "Failed to process parsed document output: " + parseErr.message });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update Annexure with Version Tracking
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const annexure = await Annexure.findOne({ id: parseInt(req.params.id) });
        if (!annexure) return res.status(404).json({ error: "Annexure not found" });

        // Allow all users to update and customize master and custom annexures
        const isSuperAdmin = req.user && req.user.role === "superadmin";

        // Archive previous version in history if contentTemplate changed
        const historyEntry = {
            version: annexure.version || 1,
            contentTemplate: annexure.contentTemplate,
            updatedAt: new Date(),
            updatedByName: req.user ? req.user.fullName : "User",
            changelog: req.body.changelog || `Updated on ${new Date().toLocaleDateString()}`,
        };

        const updatedVersion = (annexure.version || 1) + 1;

        const updated = await Annexure.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            {
                ...req.body,
                version: updatedVersion,
                updatedAt: new Date(),
                $push: { history: historyEntry }
            },
            { new: true }
        );

        if (updated.linkedTermId) {
            await Term.findOneAndUpdate(
                { id: updated.linkedTermId },
                {
                    hasAnnexure: true,
                    annexureId: updated.id,
                    annexureTitle: updated.title
                }
            );
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5b. Toggle Deprecate Status
router.patch("/:id/deprecate", optionalAuth, async (req, res) => {
    try {
        const annexure = await Annexure.findOne({ id: parseInt(req.params.id) });
        if (!annexure) return res.status(404).json({ error: "Annexure not found" });

        const newStatus = annexure.status === "deprecated" ? "active" : "deprecated";
        annexure.status = newStatus;
        annexure.updatedAt = new Date();
        await annexure.save();

        res.json({ message: `Annexure status updated to ${newStatus}`, annexure });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5c. Get Version History
router.get("/:id/history", async (req, res) => {
    try {
        const annexure = await Annexure.findOne({ id: parseInt(req.params.id) });
        if (!annexure) return res.status(404).json({ error: "Annexure not found" });

        res.json({
            currentVersion: annexure.version || 1,
            currentTemplate: annexure.contentTemplate,
            history: annexure.history || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Delete Annexure
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const annexure = await Annexure.findOne({ id: parseInt(req.params.id) });
        if (!annexure) return res.status(404).json({ error: "Annexure not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";
        if (annexure.isMaster && !isSuperAdmin) {
            return res.status(403).json({ error: "Master annexures cannot be deleted." });
        }

        if (req.user && !isSuperAdmin && annexure.userId && annexure.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own custom annexures." });
        }

        await Annexure.findOneAndDelete({ id: parseInt(req.params.id) });

        // Unlink from term if any
        if (annexure.linkedTermId) {
            await Term.findOneAndUpdate(
                { annexureId: annexure.id },
                { hasAnnexure: false, annexureId: null, annexureTitle: null }
            );
        }

        res.json({ message: "Annexure deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
