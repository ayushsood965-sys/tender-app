const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { optionalAuth } = require("../middleware/auth");

// Get all Categories (Shared Central Repository)
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ id: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Category in Shared Repository
router.post("/", optionalAuth, async (req, res) => {
    try {
        const isSuperAdmin = req.user && req.user.role === "superadmin";
        const newCat = new Category({
            ...req.body,
            id: Date.now(),
            userId: req.user ? req.user.id : null,
            createdByName: req.user ? req.user.fullName : "System Master",
            isMaster: isSuperAdmin ? (req.body.isMaster !== undefined ? req.body.isMaster : false) : false,
        });
        await newCat.save();
        res.json(newCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Category (Creator or Superadmin only)
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const category = await Category.findOne({ id: parseInt(req.params.id) });
        if (!category) return res.status(404).json({ error: "Category not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";

        if (category.isMaster && !isSuperAdmin) {
            return res.status(403).json({ error: "Master Categories can only be edited by Super Administrator." });
        }

        if (req.user && !isSuperAdmin && category.userId && category.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only edit categories created by yourself." });
        }

        const updated = await Category.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Category (Creator or Superadmin only; Master categories protected)
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const category = await Category.findOne({ id: parseInt(req.params.id) });
        if (!category) return res.status(404).json({ error: "Category not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";

        if (category.isMaster && !isSuperAdmin) {
            return res.status(403).json({ error: "Master Categories cannot be deleted by standard users." });
        }

        if (req.user && !isSuperAdmin && category.userId && category.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only delete categories created by yourself." });
        }

        await Category.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
