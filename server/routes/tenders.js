const express = require("express");
const router = express.Router();
const Tender = require("../models/Tender");
const { optionalAuth, authenticateUser } = require("../middleware/auth");

// Get All Tenders (with role/user filter & search)
router.get("/", optionalAuth, async (req, res) => {
    try {
        const { searchUserId, search, docType } = req.query;
        let query = {};

        // If user is logged in
        if (req.user) {
            if (req.user.role === "superadmin") {
                // Superadmin can see all tenders or filter by specific user
                if (searchUserId) {
                    query.userId = parseInt(searchUserId);
                }
            } else {
                // Normal user only sees their own tenders
                query.userId = req.user.id;
            }
        }

        if (docType) {
            query.documentType = docType;
        }

        if (search) {
            query.$or = [
                { tenderName: { $regex: search, $options: "i" } },
                { tenderNo: { $regex: search, $options: "i" } },
                { departmentName: { $regex: search, $options: "i" } },
            ];
        }

        const tenders = await Tender.find(query).sort({ createdAt: -1 });
        res.json(tenders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Tender by ID
router.get("/:id", optionalAuth, async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: parseInt(req.params.id) });
        if (!tender) {
            return res.status(404).json({ error: "Tender not found" });
        }
        res.json(tender);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Tender
router.post("/", optionalAuth, async (req, res) => {
    try {
        const tenderData = {
            ...req.body,
            id: Date.now(),
        };

        if (req.user) {
            tenderData.userId = req.user.id;
            tenderData.createdBy = {
                id: req.user.id,
                fullName: req.user.fullName,
                email: req.user.email,
                departmentName: req.user.departmentName,
                designation: req.user.designation,
            };
        }

        const newTender = new Tender(tenderData);
        await newTender.save();
        res.json(newTender);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Tender (Creator or Superadmin only)
router.put("/:id", optionalAuth, async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: parseInt(req.params.id) });
        if (!tender) return res.status(404).json({ error: "Tender not found" });

        // Permission check
        if (req.user && req.user.role !== "superadmin" && tender.userId && tender.userId !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to edit this tender." });
        }

        const updatedTender = await Tender.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(updatedTender);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Tender (Creator or Superadmin only)
router.delete("/:id", optionalAuth, async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: parseInt(req.params.id) });
        if (!tender) return res.status(404).json({ error: "Tender not found" });

        // Permission check
        if (req.user && req.user.role !== "superadmin" && tender.userId && tender.userId !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to delete this tender." });
        }

        await Tender.findOneAndDelete({ id: parseInt(req.params.id) });
        res.json({ message: "Tender deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
