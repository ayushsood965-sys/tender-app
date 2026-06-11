const express = require("express");
const router = express.Router();
const Term = require("../models/Term");

// Create Term
router.post("/", async (req, res) => {
    try {
        const newTerm = new Term({ ...req.body, id: Date.now() });
        await newTerm.save();
        res.json(newTerm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Term
router.put("/:id", async (req, res) => {
    try {
        const updatedTerm = await Term.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        res.json(updatedTerm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Term
router.delete("/:id", async (req, res) => {
    try {
        await Term.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
