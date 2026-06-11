const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Term = require("../models/Term");

// Create Category
router.post("/", async (req, res) => {
    try {
        const newCat = new Category({ ...req.body, id: Date.now() });
        await newCat.save();
        res.json(newCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Category
router.put("/:id", async (req, res) => {
    try {
        const updatedCat = await Category.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        res.json(updatedCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Category
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Check for associated terms
        const termCount = await Term.countDocuments({ categoryId: id });
        if (termCount > 0) {
            return res.status(400).json({ error: "Cannot delete category with associated terms." });
        }

        await Category.findOneAndDelete({ id: id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
