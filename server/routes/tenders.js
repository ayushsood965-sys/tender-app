const express = require("express");
const router = express.Router();
const Tender = require("../models/Tender");

// Get Tender by ID
router.get("/:id", async (req, res) => {
    try {
        console.log(`[API] Fetching tender with ID: ${req.params.id}`);
        const tender = await Tender.findOne({ id: parseInt(req.params.id) });
        if (!tender) {
            console.log(`[API] Tender not found for ID: ${req.params.id}`);
            return res.status(404).json({ error: "Tender not found" });
        }
        console.log(`[API] Found tender: ${tender.tenderName}`);
        res.json(tender);
    } catch (err) {
        console.error(`[API] Error fetching tender: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Create Tender
router.post("/", async (req, res) => {
    try {
        const newTender = new Tender({ ...req.body, id: Date.now() });
        await newTender.save();
        res.json(newTender);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Tender
router.put("/:id", async (req, res) => {
    try {
        const updatedTender = await Tender.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true }
        );
        if (!updatedTender) return res.status(404).json({ error: "Tender not found" });
        res.json(updatedTender);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Tender
router.delete("/:id", async (req, res) => {
    try {
        const result = await Tender.findOneAndDelete({ id: parseInt(req.params.id) });
        if (!result) return res.status(404).json({ error: "Tender not found" });
        res.json({ message: "Tender deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
