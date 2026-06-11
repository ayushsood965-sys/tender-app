const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    id: Number,
    name: { type: String, required: true },
    description: String,
});

module.exports = mongoose.model("Category", CategorySchema);
