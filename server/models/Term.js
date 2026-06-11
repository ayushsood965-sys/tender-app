const mongoose = require("mongoose");

const TermSchema = new mongoose.Schema({
    id: Number,
    categoryId: Number,
    title: { type: String, required: true },
    description: String,
});

module.exports = mongoose.model("Term", TermSchema);
