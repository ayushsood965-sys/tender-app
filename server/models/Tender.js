const mongoose = require("mongoose");

const TenderSchema = new mongoose.Schema({
    id: Number,
    departmentName: String,
    departmentEmail: String,
    tenderInvitingAuthority: String,
    tenderCategory: String,
    tenderType: String,
    tenderName: String,
    tenderNo: String,
    estimatedCost: Number,
    itemQuantity: String,
    bidValidity: Number,
    emdRequired: String,
    pbgRequired: String,
    emdPledgeOfficer: String,
    bidStartDate: Date,
    bidEndDate: Date,
    publishDate: Date,
    offlineSubmissionDate: Date,
    techEvalDate: Date,
    isPreBidRequired: String,
    preBidDate: Date,
    selectedTermIds: [Number],
    variables: Object,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tender", TenderSchema);
