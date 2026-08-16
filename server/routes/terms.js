const express = require("express");
const router = express.Router();
const Term = require("../models/Term");
const { optionalAuth } = require("../middleware/auth");

// Get all Terms (Central Shared Repository)
router.get("/", async (req, res) => {
    try {
        const terms = await Term.find().sort({ categoryId: 1, id: 1 });
        res.json(terms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Term in Shared Repository
router.post("/", optionalAuth, async (req, res) => {
    try {
        const isSuperAdmin = req.user && req.user.role === "superadmin";
        const newTerm = new Term({
            ...req.body,
            id: Date.now(),
            userId: req.user ? req.user.id : null,
            createdByName: req.user ? req.user.fullName : "System Master",
            isMaster: isSuperAdmin ? (req.body.isMaster !== undefined ? req.body.isMaster : false) : false,
        });
        await newTerm.save();
        res.json(newTerm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Term (Creator or Superadmin only)
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const term = await Term.findOne({ id: parseInt(req.params.id) });
        if (!term) return res.status(404).json({ error: "Term not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";

        // If master term and not superadmin, block edit
        if (term.isMaster && !isSuperAdmin) {
            return res.status(403).json({ error: "System Master terms can only be edited by a Super Administrator." });
        }

        // If custom term, only creator or superadmin can edit
        if (req.user && !isSuperAdmin && term.userId && term.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only edit terms created by yourself." });
        }

        const updatedTerm = await Term.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true }
        );
        res.json(updatedTerm);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Term (Creator or Superadmin only; Master terms protected)
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const term = await Term.findOne({ id: parseInt(req.params.id) });
        if (!term) return res.status(404).json({ error: "Term not found" });

        const isSuperAdmin = req.user && req.user.role === "superadmin";

        // Master terms can never be deleted by normal users
        if (term.isMaster && !isSuperAdmin) {
            return res.status(403).json({ error: "System Master terms cannot be deleted by users. Contact Super Admin." });
        }

        // Only creator or superadmin can delete custom terms
        if (req.user && !isSuperAdmin && term.userId && term.userId !== req.user.id) {
            return res.status(403).json({ error: "You can only delete terms created by yourself." });
        }

        await Term.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: "Term deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
