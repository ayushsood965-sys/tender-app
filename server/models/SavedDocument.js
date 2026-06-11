const mongoose = require("mongoose");

const SavedDocumentSchema = new mongoose.Schema({
    id: Number,
    tenderId: Number,
    name: String,
    pages: Object, // Map of pageNumber -> htmlString
    extraPages: Array, // Array of extra page objects
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SavedDocument", SavedDocumentSchema);
