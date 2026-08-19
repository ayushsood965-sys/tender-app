const mongoose = require("mongoose");

const AnnexureSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    code: { type: String, default: "" },
    category: {
        type: String,
        enum: ["financial", "eligibility", "undertaking", "technical", "general", "custom"],
        default: "general",
    },
    applicableDocTypes: {
        type: [String],
        default: ["all"], // ["Limited Tender Document", "GeM ATC Document", "e-tender Document"] or ["all"]
    },
    description: { type: String, default: "" },
    contentTemplate: { type: String, required: true }, // Formatted HTML with {{variable}} placeholders
    isTable: { type: Boolean, default: false },
    tableColumns: [
        {
            key: String,
            label: String,
            width: String,
            align: { type: String, default: "left" },
        }
    ],
    sampleTableData: [mongoose.Schema.Types.Mixed],
    linkedTermId: { type: Number, default: null },
    isCustomUploaded: { type: Boolean, default: false },
    uploadedOriginalFileName: { type: String, default: null },
    isMaster: { type: Boolean, default: true },
    userId: { type: Number, default: null },
    createdByName: { type: String, default: "System Master" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Annexure", AnnexureSchema);
