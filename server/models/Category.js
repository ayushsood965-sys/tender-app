const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    id: Number,
    name: { type: String, required: true },
    description: String,
    isMaster: { type: Boolean, default: false },
    userId: { type: Number, default: null },
    createdByName: { type: String, default: "System Master" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", CategorySchema);
