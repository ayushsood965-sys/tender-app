const mongoose = require("mongoose");

const SavedDocumentSchema = new mongoose.Schema({
    id: Number,
    tenderId: Number,
    userId: { type: Number, default: null },
    createdByName: String,
    name: String,
    pages: Object, // Map of pageNumber -> htmlString
    extraPages: Array, // Array of extra page objects
    version: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SavedDocument", SavedDocumentSchema);
