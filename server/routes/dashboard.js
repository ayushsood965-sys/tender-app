const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Term = require("../models/Term");
const Tender = require("../models/Tender");

router.get("/dashboard-data", async (req, res) => {
    try {
        const categories = await Category.find();
        const terms = await Term.find();
        const tenders = await Tender.find().sort({ createdAt: -1 });
        res.json({ categories, terms, tenders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
