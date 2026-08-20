const mongoose = require("mongoose");

const TermSchema = new mongoose.Schema({
    id: Number,
    categoryId: Number,
    code: String,
    title: { type: String, required: true },
    description: String,
    mandatory: { type: Boolean, default: false },
    isMandatory: { type: Boolean, default: false },
    isDocumentRequired: { type: Boolean, default: false },
    documentProofName: { type: String, default: "" },
    isMaster: { type: Boolean, default: false },
    hasAnnexure: { type: Boolean, default: false },
    annexureId: { type: Number, default: null },
    annexureTitle: { type: String, default: null },
    linkedAnnexureId: { type: Number, default: null },
    linkedAnnexureTitle: { type: String, default: null },
    userId: { type: Number, default: null },
    createdByName: { type: String, default: "System Master" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Term", TermSchema);
