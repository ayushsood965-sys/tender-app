const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Term = require("../models/Term");
const Tender = require("../models/Tender");
const Annexure = require("../models/Annexure");

router.get("/dashboard-data", async (req, res) => {
    try {
        const categories = await Category.find();
        const terms = await Term.find();
        const annexures = await Annexure.find().sort({ id: 1 });
        const tenders = await Tender.find().sort({ createdAt: -1 });
        res.json({ categories, terms, annexures, tenders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
