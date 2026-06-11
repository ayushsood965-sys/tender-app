const express = require("express");
const router = express.Router();
const SavedDocument = require("../models/SavedDocument");

// Save a new document version
router.post("/", async (req, res) => {
    try {
        const newDoc = new SavedDocument({ ...req.body, id: Date.now() });
        await newDoc.save();
        res.json(newDoc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific saved document
router.get("/:id", async (req, res) => {
    try {
        const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
        if (!doc) return res.status(404).json({ error: "Document not found" });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a saved document
router.delete("/:id", async (req, res) => {
    try {
        const result = await SavedDocument.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!result) return res.status(404).json({ error: "Document not found" });
        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
