const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");
const Term = require("./models/Term");
const Tender = require("./models/Tender");

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const categories = [
  { id: 1, name: "Instructions for Bidders", description: "General instructions and guidelines for participating bidders including submission rules and documentation requirements." },
  { id: 2, name: "General Conditions", description: "Standard terms governing scope of work, purchaser rights, and compliance obligations." },
  { id: 3, name: "Eligibility Criteria", description: "Minimum qualifications, experience, and financial capacity requirements for bidders." },
  { id: 4, name: "Earnest Money Deposit (EMD)", description: "Rules for EMD submission, forms, refund, and forfeiture conditions." },
  { id: 5, name: "Performance Security", description: "Performance Bank Guarantee requirements, validity, forfeiture, and release terms." },
  { id: 6, name: "Technical Specifications", description: "Detailed technical requirements and specifications for the procurement." },
  { id: 7, name: "Bid Evaluation", description: "Evaluation methodology, responsive bid criteria, and award process." },
  { id: 8, name: "Signing of Contract", description: "Contract formalization procedures and timelines." },
  { id: 9, name: "Prices", description: "Pricing guidelines including currency, inclusions, and price variation rules." },
  { id: 10, name: "Delivery, Installation & Commissioning", description: "Delivery timelines, late delivery penalties, and training requirements." },
  { id: 11, name: "Inspection and Tests", description: "Inspection rights, rejection procedures, and final acceptance criteria." },
  { id: 12, name: "Technical Documentation", description: "Requirements for manuals, documentation, and technical literature." },
  { id: 13, name: "Warranty", description: "Warranty period, coverage, charges, and replacement terms." },
  { id: 14, name: "After-Sales Service & Maintenance", description: "Service level agreements, response times, uptime guarantees, and penalties." },
  { id: 15, name: "Spare Parts Availability", description: "Spare parts availability undertaking requirements." },
  { id: 16, name: "Packing and Marking", description: "Packing standards, protection, and labelling requirements." },
  { id: 17, name: "Payment Terms", description: "Payment schedule and conditions for release." },
  { id: 18, name: "Arbitration and Jurisdiction", description: "Dispute resolution and court jurisdiction clauses." },
];

const terms = [
  // Category 1: Instructions for Bidders
  { id: 1, categoryId: 1, title: "Bid Submission", description: "Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal (gem.gov.in) before the specified deadline. Physical or offline bids will not be accepted." },
  { id: 2, categoryId: 1, title: "Governing Terms", description: "This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict, the terms specified in this document will prevail." },
  { id: 3, categoryId: 1, title: "Digital Signature", description: "Bids must be digitally signed by an authorized representative of the bidding firm using a valid Class-II or Class-III Digital Signature Certificate (DSC)." },
  { id: 4, categoryId: 1, title: "Documentation", description: "Bidders are required to upload scanned copies of all necessary documents as specified in this bid document. All uploaded documents must be clear, legible, and duly signed and stamped by the authorized signatory." },

  // Category 2: General Conditions
  { id: 5, categoryId: 2, title: "Scope of Work", description: "The scope shall include Supply, Installation, Commissioning, & Satisfactory Demonstration of {{scope_of_work}}. This will also include testing, packing, transportation, transit insurance, delivery at the site, unloading, and any other services associated with the delivery of the equipment." },
  { id: 6, categoryId: 2, title: "No Gratification Clause", description: "The bidder must provide an undertaking that they will not attempt to gratify any person or use any unfair means to influence the purchase process. Any such action will debar the company from participating in this and future tenders." },
  { id: 7, categoryId: 2, title: "No Cartel Formation", description: "Bidders shall not form a cartel or submit supporting quotations for other companies. Evidence of such practices will lead to disqualification." },
  { id: 8, categoryId: 2, title: "Purchaser's Right to Vary Quantities", description: "The Purchaser reserves the right to increase or decrease the quantity to be ordered at the time of placement of the contract. The purchaser also reserves the right to place a repeat order during the currency of the contract at the contracted rates." },
  { id: 9, categoryId: 2, title: "Purchaser's Right to Accept or Reject Bids", description: "The Purchaser reserves the right to accept or reject any bid, and to annul the bidding process and reject all bids at any time prior to the award of contract, without thereby incurring any liability to the affected bidder(s)." },

  // Category 3: Eligibility Criteria
  { id: 10, categoryId: 3, title: "Bidder Status", description: "The bidder shall be an OEM Manufacturer, Direct Importer, or Authorized Dealer/Distributor of the OEM. Authorized Dealers/Distributors must submit a current, bid-specific Manufacturer's Authorization Form (MAF)." },
  { id: 11, categoryId: 3, title: "Experience", description: "The bidder must have a minimum of {{experience_years}} years' experience in India in supply, installation, and commissioning of similar scientific test and measurement equipment. Supporting documents shall include Purchase Orders and corresponding CRACs for last three financial years i.e. {{financial_years}}." },
  { id: 12, categoryId: 3, title: "Past Performance", description: "The Bidder or its OEM should have supplied same or similar Category Products for {{past_performance_percentage}}% of bid quantity, in at least one of the last three financial years before the bid opening date to any Central / State Govt Organization / PSU." },
  { id: 13, categoryId: 3, title: "Financial Capacity", description: "The bidder must have a minimum average annual turnover of {{min_turnover}} over the last three financial years. The turnover must be certified by a Chartered Accountant." },
  { id: 14, categoryId: 3, title: "Tax and Registration Compliance", description: "The bidder must hold valid PAN and GST Registration, and be registered on the GeM portal." },
  { id: 15, categoryId: 3, title: "Blacklisting Declaration", description: "A notarized self-declaration on non-judicial stamp paper must be submitted, confirming that the firm has not been blacklisted/debarred by any Central/State Government Department, PSU, or Government organization." },

  // Category 4: EMD
  { id: 16, categoryId: 4, title: "EMD Requirement", description: "The bidder shall submit an Earnest Money Deposit (EMD) of {{emd_amount}} ({{emd_amount_words}}) along with the bid. The EMD shall be submitted as FDR or BG from a nationalized bank, pledged in the name of {{emd_pledge_officer}}." },
  { id: 17, categoryId: 4, title: "Submission of Original EMD Instrument", description: "The original EMD instrument must be physically submitted to the office of {{submission_officer}} before or within {{emd_submission_days}} working days after the last date of bid submission on the GeM portal." },
  { id: 18, categoryId: 4, title: "Refund of EMD", description: "EMD of unsuccessful bidders shall be refunded after finalization of the tender and within 30 days from the award of contract. EMD of the successful bidder shall be refunded upon submission of Performance Security." },
  { id: 19, categoryId: 4, title: "Forfeiture of EMD", description: "The EMD shall be forfeited if: the bidder withdraws or modifies the bid during validity period; the successful bidder fails to sign the contract or submit Performance Security; any submitted document is found false or misleading." },

  // Category 5: Performance Security
  { id: 20, categoryId: 5, title: "PBG Requirement", description: "The successful bidder shall furnish a Performance Bank Guarantee (PBG) of {{pbg_percentage}}% of the total contract value within {{pbg_submission_days}} days from the date of issuance of the LOI/award of contract." },
  { id: 21, categoryId: 5, title: "Form of Guarantee", description: "The PBG shall be in the form of an unconditional FDR or bank guarantee issued by a Nationalized Bank in favour of {{emd_pledge_officer}}. The PBG shall remain valid for at least {{pbg_validity_period}} months beyond the completion of the contract." },
  { id: 22, categoryId: 5, title: "PBG Forfeiture", description: "In the event of breach of contract or failure to deliver within the stipulated time, the PBG shall be forfeited in part or in full, as determined by the Purchaser." },

  // Category 6: Technical Specifications
  { id: 23, categoryId: 6, title: "Technical Specifications", description: "The detailed technical specifications of the {{scope_of_work}} are provided in {{annexure_ref}}. The specifications mentioned in this document will prevail over the specification mentioned in GeM bid document in case of any conflict." },

  // Category 7: Bid Evaluation
  { id: 24, categoryId: 7, title: "Evaluation Process", description: "Bids will be evaluated by a Technical Evaluation Committee. The committee will examine technical bids for completeness, responsiveness, and conformity to all terms and specifications." },
  { id: 25, categoryId: 7, title: "Award Criteria", description: "The contract will be awarded to the bidder who is technically qualified and quotes the lowest price (L1) as per GeM evaluation rules." },

  // Category 8: Signing of Contract
  { id: 26, categoryId: 8, title: "Agreement", description: "The successful bidder shall execute an agreement on a non-judicial stamp paper of Rs. {{stamp_paper_value}} with the University within {{contract_signing_days}} days of the issue of the purchase order." },

  // Category 9: Prices
  { id: 27, categoryId: 9, title: "Currency", description: "Prices must be quoted in Indian Rupees (INR) only, on the GeM portal." },
  { id: 28, categoryId: 9, title: "All-Inclusive Pricing", description: "The quoted price must be all-inclusive (FOR destination) covering basic price, packing, forwarding, freight, transit insurance, all applicable taxes (GST), duties, and any other charges for delivery and installation at the designated site." },
  { id: 29, categoryId: 9, title: "No Price Variation", description: "No price variation, escalation, or additional claims on account of market fluctuations will be permitted after the submission of the bid." },

  // Category 10: Delivery
  { id: 30, categoryId: 10, title: "Delivery Timeline", description: "The equipment must be delivered, installed, tested, and commissioned within {{delivery_days}} days from the date of issue of the supply order." },
  { id: 31, categoryId: 10, title: "Late Delivery Penalty", description: "A penalty of {{penalty_rate}}% of the total contract value per week of delay will be imposed for delays in delivery/installation, up to a maximum of {{max_penalty}}% of the contract value." },
  { id: 32, categoryId: 10, title: "Failure to Deliver", description: "If the delay exceeds {{max_delay_weeks}} weeks, the University reserves the right to cancel the purchase order, forfeit the Performance Security, and blacklist the firm." },
  { id: 33, categoryId: 10, title: "Training", description: "The supplier shall provide comprehensive training on the operation, maintenance, and basic troubleshooting of the equipment to faculty/staff at no extra cost." },

  // Category 11: Inspection
  { id: 34, categoryId: 11, title: "Inspection Rights", description: "The Purchaser shall have the right to inspect and/or test the equipment to confirm conformity to contract specifications at no extra cost. Third-Party Inspection (TPI) may also be opted for." },
  { id: 35, categoryId: 11, title: "Rejection", description: "Should any inspected equipment fail to conform to specifications, the Purchaser may reject it, and the supplier shall replace or make necessary alterations free of cost." },

  // Category 12: Documentation
  { id: 36, categoryId: 12, title: "Manuals", description: "The bidder shall supply one complete set of technical documentation including detailed Operations, Installation, and Maintenance manuals in English." },

  // Category 13: Warranty
  { id: 37, categoryId: 13, title: "Warranty Period", description: "The equipment must be covered under a comprehensive on-site warranty for a minimum period of {{warranty_years}} years from the date of successful installation and commissioning." },
  { id: 38, categoryId: 13, title: "Warranty Charges", description: "Warranty charges shall not be quoted separately; they must be included in the price of the equipment. Offers with separate warranty charges will be rejected." },
  { id: 39, categoryId: 13, title: "Replacement", description: "If the performance of the equipment is not satisfactory during warranty, it shall be replaced free of cost. The warranty period for replaced parts shall be extended equal to the downtime." },

  // Category 14: After-Sales Service
  { id: 40, categoryId: 14, title: "Service Level", description: "During the warranty period, the bidder must provide technical assistance within {{response_time_hours}} hours of a ticket being raised. The firm must provide an uptime guarantee of {{uptime_guarantee}}%." },
  { id: 41, categoryId: 14, title: "Penalty for Service Delay", description: "Failure to provide service within the stipulated time will attract a penalty of {{service_penalty_1}} per day up to first week, and {{service_penalty_2}} per day thereafter." },

  // Category 15: Spare Parts
  { id: 42, categoryId: 15, title: "Spare Parts Availability", description: "The bidder must provide a self-declaration that it will provide/keep spare parts for at least {{spare_parts_years}} years after the completion of the warranty period." },

  // Category 16: Packing
  { id: 43, categoryId: 16, title: "Packing Standards", description: "All packing must be strong enough to withstand rough handling during transit. Fragile articles must bear markings like 'FRAGILE', 'HANDLE WITH CARE', and 'THIS SIDE UP'." },

  // Category 17: Payment
  { id: 44, categoryId: 17, title: "Payment", description: "100% payment will be released after successful delivery, installation, commissioning, and acceptance of the equipment by the designated committee." },

  // Category 18: Arbitration
  { id: 45, categoryId: 18, title: "Arbitration", description: "Any disputes arising out of this contract shall be subjected to the sole arbitration of the {{arbitrator_authority}}, whose decision shall be final and binding on both parties." },
  { id: 46, categoryId: 18, title: "Jurisdiction", description: "The Courts at {{court_jurisdiction}} shall have exclusive jurisdiction to try any matter, dispute, or reference arising out of this contract." },
];

// Sample tender with pre-selected terms and filled variables
const sampleTender = {
  id: Date.now(),
  departmentName: "Department of Physics, H.P. University",
  departmentEmail: "physicshpu@gmail.com",
  tenderInvitingAuthority: "Chairperson, Department of Physics",
  tenderCategory: "product",
  tenderType: "gem",
  tenderName: "Procurement of High-Performance Spectrophotometer with Accessories",
  tenderNo: "HPU/PHY/2026/SP-001",
  estimatedCost: 2500000,
  itemQuantity: "1 Unit",
  bidValidity: 90,
  emdRequired: "50000",
  pbgRequired: "3%",
  emdPledgeOfficer: "Finance Officer, Himachal Pradesh University, Summerhill, Shimla - 171005",
  bidStartDate: new Date("2026-07-01T10:00:00"),
  bidEndDate: new Date("2026-07-21T17:00:00"),
  publishDate: new Date("2026-06-25T10:00:00"),
  offlineSubmissionDate: new Date("2026-07-25T17:00:00"),
  techEvalDate: new Date("2026-07-28T11:00:00"),
  isPreBidRequired: "yes",
  preBidDate: new Date("2026-07-10T14:00:00"),
  selectedTermIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
  variables: {
    scope_of_work: "High-Performance UV-Vis Spectrophotometer with Double Beam Optics",
    experience_years: "5",
    financial_years: "2023-24, 2024-25, 2025-26",
    past_performance_percentage: "50",
    min_turnover: "Rs. 50,00,000 (Fifty Lakhs)",
    emd_amount: "Rs. 50,000",
    emd_amount_words: "Rupees Fifty Thousand Only",
    emd_pledge_officer: "Finance Officer, HPU Shimla",
    submission_officer: "Chairperson, Department of Physics",
    emd_submission_days: "5",
    pbg_percentage: "3",
    pbg_submission_days: "15",
    pbg_validity_period: "24",
    annexure_ref: "Annexure-A",
    stamp_paper_value: "100",
    contract_signing_days: "15",
    delivery_days: "60",
    penalty_rate: "0.5",
    max_penalty: "10",
    max_delay_weeks: "20",
    warranty_years: "3",
    response_time_hours: "48",
    uptime_guarantee: "95",
    service_penalty_1: "Rs. 500",
    service_penalty_2: "Rs. 1000",
    max_service_delay_days: "30",
    spare_parts_years: "10",
    arbitrator_authority: "Vice Chancellor, Himachal Pradesh University",
    court_jurisdiction: "Shimla, Himachal Pradesh",
  },
  createdAt: new Date(),
};

const seedDatabase = async () => {
  try {
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    await Term.deleteMany({});
    await Tender.deleteMany({});

    console.log("🌱 Seeding Categories...");
    await Category.insertMany(categories);
    console.log(`   ✅ ${categories.length} categories created`);

    console.log("🌱 Seeding Terms (Clauses)...");
    await Term.insertMany(terms);
    console.log(`   ✅ ${terms.length} terms/clauses created`);

    console.log("🌱 Seeding Sample Tender...");
    await Tender.create(sampleTender);
    console.log(`   ✅ 1 sample tender created`);

    console.log("\n🎉 Seeding Complete!");
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Terms/Clauses: ${terms.length}`);
    console.log(`   Sample Tenders: 1`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDatabase();
