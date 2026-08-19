const mongoose = require("mongoose");

const TermSchema = new mongoose.Schema({
    id: Number,
    categoryId: Number,
    code: String,
    title: { type: String, required: true },
    description: String,
    mandatory: { type: Boolean, default: false },
    isMaster: { type: Boolean, default: false },
    hasAnnexure: { type: Boolean, default: false },
    annexureId: { type: Number, default: null },
    annexureTitle: { type: String, default: null },
    userId: { type: Number, default: null },
    createdByName: { type: String, default: "System Master" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Term", TermSchema);
