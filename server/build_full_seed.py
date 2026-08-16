import json

# Full Categories List
categories = [
    { "id": 1, "name": "Instructions for Bidders", "description": "General instructions and guidelines for participating bidders including portal rules, two-bid system, digital signature, and submission requirements." },
    { "id": 2, "name": "Notice Inviting Tender & Tender Fee", "description": "Tender notice guidelines, tender fee payment, MSE exemptions, and pre-bid meeting conditions." },
    { "id": 3, "name": "General Conditions of Contract", "description": "Standard terms governing scope of work, code of integrity, quantity variations, intellectual property indemnification, and compliance obligations." },
    { "id": 4, "name": "Eligibility Criteria", "description": "Minimum qualifications, legal status, experience, financial capacity, turnover, statutory registrations, and non-blacklisting criteria." },
    { "id": 5, "name": "Earnest Money Deposit (EMD)", "description": "Rules for EMD submission, acceptable instruments (FDR/BG/DD), pledge details, refund process, and forfeiture conditions." },
    { "id": 6, "name": "Performance Security (PBG)", "description": "Performance Bank Guarantee requirements, submission timeline, validity, forfeiture conditions, and release procedures." },
    { "id": 7, "name": "Technical Specifications & Standards", "description": "Conformity to technical specifications, ISO/CE/NABL quality standards, and compliance sheet requirements." },
    { "id": 8, "name": "Printing Facility & Language Capability", "description": "In-house printing machinery, multi-color offset setups, typesetting expertise in Hindi, Sanskrit, Mathematics, and physical press verification." },
    { "id": 9, "name": "Paper & Production Specifications", "description": "Text paper GSM, brightness, cover art card, thermal lamination, 4-color cover, section-sewn hot melt binding, and typography standards." },
    { "id": 10, "name": "Samples, Proofreading & Dummy Approval", "description": "Submission of dummy sample proofs, multi-stage proofreading by university committee, and formal written print order approval." },
    { "id": 11, "name": "Bid Evaluation & Award Process", "description": "Evaluation methodology, responsiveness check, scoring, financial BOQ evaluation, weighted cost calculation, L1 determination, and price negotiation." },
    { "id": 12, "name": "Signing of Contract & Non-Disclosure", "description": "Contract agreement execution on non-judicial stamp paper, Non-Disclosure Agreement (NDA), and signing timelines." },
    { "id": 13, "name": "Prices & Commercial Terms", "description": "Currency of quote, all-inclusive FOR destination rates, GST verification, firm pricing, and Price Fall Clause." },
    { "id": 14, "name": "Delivery, Phased Schedule & Logistics", "description": "Delivery timelines, phased supply batches for academic sessions, FOR destination delivery, and transit insurance." },
    { "id": 15, "name": "Inspection, Quality Assurance & Testing", "description": "Pre-dispatch and on-site inspection, random sampling, paper GSM/brightness lab testing at Govt approved labs, and acceptance certification." },
    { "id": 16, "name": "Installation, Commissioning & Training", "description": "Equipment site preparation, installation by OEM engineers, operational demonstration, and comprehensive hands-on user training." },
    { "id": 17, "name": "Comprehensive Warranty & Replacement", "description": "Multi-year comprehensive on-site warranty, all-inclusive coverage, free replacement of defective parts, and downtime warranty extension." },
    { "id": 18, "name": "After-Sales Maintenance & SLA", "description": "Response time SLA, uptime guarantee percentage, downtime delay penalty, PBG deduction, and domestic support infrastructure." },
    { "id": 19, "name": "Spare Parts & Consumables Availability", "description": "Long-term guarantee for supply of genuine spare parts and consumables post-warranty at pre-agreed rates." },
    { "id": 20, "name": "Liquidated Damages & Delay Penalties", "description": "Weekly delay penalty rates, maximum penalty cap, contract annulment for excessive delay, and Risk Purchase clause." },
    { "id": 21, "name": "Printing Penalties & Deficiencies", "description": "Penalties for loss of manuscript, errors/misprints, missing pages, substandard paper GSM deductions, and post-supply deficiency deductions." },
    { "id": 22, "name": "Packaging, Marking & Stacking", "description": "Moisture-proof shrink wrapping, 5-ply master corrugated cartons with HDPE strapping, fragile labels, and orderly store stacking." },
    { "id": 23, "name": "Substitution & Change of Model", "description": "Prohibition of unauthorized substitution and requirements for prior written approval for equivalent or upgraded models." },
    { "id": 24, "name": "Payment Terms & Invoicing", "description": "Phased / 100% payment terms upon delivery and acceptance, supporting document checklist, and statutory tax deductions (TDS/GST)." },
    { "id": 25, "name": "Copyright & Return of Material", "description": "University exclusive copyright on content/syllabi, mandatory return of printing plates/positives/digital files, and ban on commercial reprinting." },
    { "id": 26, "name": "Termination of Contract & Debarment", "description": "Termination for default, insolvency, or breach, and debarment/blacklisting procedures." },
    { "id": 27, "name": "Force Majeure", "description": "Events beyond reasonable control, mandatory notification within 48 hours / 14 days, and obligation mitigation." },
    { "id": 28, "name": "Arbitration and Jurisdiction", "description": "Dispute resolution via Sole Arbitrator (Vice Chancellor / Registrar) and exclusive jurisdiction of Shimla Courts." },
    { "id": 29, "name": "Right of Acceptance & University Discretion", "description": "Absolute right of the University to accept or reject any bid, no obligation to award, price negotiation, and right of re-tendering." },
    { "id": 30, "name": "Mandatory Forms & Annexures", "description": "Standardized submission templates: Bid Cover Letter, Machinery Profile, BOQ Form, EMD Exemption, Non-Blacklisting Affidavit, Technical Compliance, and MAF." }
]

terms = [
    # Category 1: Instructions for Bidders
    {
        "id": 101,
        "categoryId": 1,
        "code": "1.1",
        "title": "Online Bid Submission",
        "description": "Bidders must submit bids online through {{portal_name}} (GeM / State Public Procurement Portal https://hptenders.gov.in) before the specified deadline. Physical or offline bids will not be accepted.",
        "mandatory": True
    },
    {
        "id": 102,
        "categoryId": 1,
        "code": "1.2",
        "title": "Two-Bid System",
        "description": "The tender follows a two-bid system comprising Technical Bid and Financial Bid. Technical and financial proposals must be uploaded separately. Any direct or indirect disclosure of financial prices in the Technical Bid shall result in immediate summary rejection.",
        "mandatory": True
    },
    {
        "id": 103,
        "categoryId": 1,
        "code": "1.3",
        "title": "Governing Terms & Precedence",
        "description": "This bid process is governed by the General Terms and Conditions (GTC) in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict or inconsistency, the terms specified in this document shall prevail.",
        "mandatory": True
    },
    {
        "id": 104,
        "categoryId": 1,
        "code": "1.4",
        "title": "Digital Signature Certificate (DSC)",
        "description": "All bids and uploaded documents must be digitally signed by an authorized representative of the bidding entity using a valid Class-II or Class-III Digital Signature Certificate (DSC).",
        "mandatory": True
    },
    {
        "id": 105,
        "categoryId": 1,
        "code": "1.5",
        "title": "Bid Validity Period",
        "description": "Bids shall remain valid for acceptance for a minimum period of {{bid_validity_days}} days from the date of opening of technical bids. A bid valid for a shorter period may be rejected by the University as non-responsive.",
        "mandatory": True
    },

    # Category 2: Notice Inviting Tender & Tender Fee
    {
        "id": 201,
        "categoryId": 2,
        "code": "2.1",
        "title": "Tender Document Fee",
        "description": "A non-refundable Tender Fee of Rs. {{tender_fee}} ({{tender_fee_words}}) must be paid via Demand Draft drawn in favor of {{emd_pledge_officer}} or through the online portal payment gateway.",
        "mandatory": True
    },
    {
        "id": 202,
        "categoryId": 2,
        "code": "2.2",
        "title": "Micro & Small Enterprises (MSE) Exemption",
        "description": "Bidders registered as Micro and Small Enterprises (MSEs) or recognized Startups with valid Udyam Registration Certificate for the tendered category of goods/services are exempt from payment of Tender Fee and EMD as per Government of India / State Government procurement policy.",
        "mandatory": False
    },
    {
        "id": 203,
        "categoryId": 2,
        "code": "2.3",
        "title": "Pre-Bid Meeting & Clarifications",
        "description": "A pre-bid meeting may be convened on the date and time specified in the schedule. Bidders may seek technical or commercial clarifications in writing prior to the meeting. Amendments issued following the pre-bid meeting shall form an integral part of the tender document.",
        "mandatory": False
    },

    # Category 3: General Conditions of Contract
    {
        "id": 301,
        "categoryId": 3,
        "code": "3.1",
        "title": "Scope of Work & Turnkey Responsibility",
        "description": "The scope of work includes Supply, Installation, Commissioning, Demonstration, Printing, or Service of {{scope_of_work}} in complete accordance with technical specifications. The contractor assumes full responsibility for satisfactory execution and delivery at site.",
        "mandatory": True
    },
    {
        "id": 302,
        "categoryId": 3,
        "code": "3.2",
        "title": "No Gratification & Integrity Pact",
        "description": "The bidder must undertake not to indulge in any corrupt, fraudulent, collusive, or coercive practices to influence the procurement process. Any such attempt will lead to immediate disqualification, forfeiture of EMD/PBG, and blacklisting.",
        "mandatory": True
    },
    {
        "id": 303,
        "categoryId": 3,
        "code": "3.3",
        "title": "No Cartel Formation / Collusion",
        "description": "Bidders shall not form a cartel or submit supporting/cover quotations. Any evidence of collusive bidding or price rigging will result in the immediate rejection of all involved bids and debarment.",
        "mandatory": True
    },
    {
        "id": 304,
        "categoryId": 3,
        "code": "3.4",
        "title": "Purchaser's Right to Vary Quantities",
        "description": "The University reserves the right to increase or decrease the tendered quantity by up to +/- 25% at the time of award or during the contract period at contracted rates, without any change in terms and conditions.",
        "mandatory": True
    },
    {
        "id": 305,
        "categoryId": 3,
        "code": "3.5",
        "title": "Patents, Copyrights & Indemnification",
        "description": "The contractor shall indemnify and hold the University harmless from any claims, suits, or damages arising from infringement of patents, trademarks, copyrights, or other intellectual property rights in connection with the supplied goods/materials.",
        "mandatory": True
    },
    {
        "id": 306,
        "categoryId": 3,
        "code": "3.6",
        "title": "Land-Border Country Restrictions",
        "description": "Any bidder from a country sharing a land border with India must be registered with the competent authority (DPIIT) as per Ministry of Finance Department of Expenditure Public Procurement orders. A mandatory certificate must be submitted.",
        "mandatory": True
    },
    {
        "id": 307,
        "categoryId": 3,
        "code": "3.7",
        "title": "Subcontracting Prohibition",
        "description": "The successful bidder shall not assign, transfer, sublet, or subcontract the contract or any part thereof to any third party without prior written authorization from Himachal Pradesh University.",
        "mandatory": True
    },

    # Category 4: Eligibility Criteria
    {
        "id": 401,
        "categoryId": 4,
        "code": "4.1",
        "title": "Bidder Legal Status & Nature of Business",
        "description": "The bidder must be a legally registered Sole Proprietorship, Partnership Firm, Private/Public Limited Company, or OEM/Authorized Distributor/Publisher/Printer with active operations in India for at least {{experience_years}} years.",
        "mandatory": True
    },
    {
        "id": 402,
        "categoryId": 4,
        "code": "4.2",
        "title": "Manufacturer's Authorization Form (MAF)",
        "description": "If the bidder is not the OEM / Mill, a specific and valid Manufacturer's / Mill Authorization Form (MAF) from the principal manufacturer must be submitted along with the technical bid.",
        "mandatory": False
    },
    {
        "id": 403,
        "categoryId": 4,
        "code": "4.3",
        "title": "Minimum Relevant Experience",
        "description": "The bidder must have at least {{experience_years}} years of proven experience in supplying similar items/equipment or printing and supplying educational materials to Central/State Universities, Government Departments, or PSUs.",
        "mandatory": True
    },
    {
        "id": 404,
        "categoryId": 4,
        "code": "4.4",
        "title": "Past Performance Proof",
        "description": "The bidder should have satisfactorily completed orders for same or similar category products/services of at least {{past_performance_percentage}}% of the estimated quantity/value in at least one of the last three financial years ({{financial_years}}). Copies of purchase/work orders and completion certificates must be attached.",
        "mandatory": True
    },
    {
        "id": 405,
        "categoryId": 4,
        "code": "4.5",
        "title": "Minimum Average Annual Turnover",
        "description": "The bidder must have an average annual financial turnover of at least {{min_turnover}} during the last three financial years ({{financial_years}}), duly certified by a practicing Chartered Accountant with a valid UDIN and supported by audited financial statements.",
        "mandatory": True
    },
    {
        "id": 406,
        "categoryId": 4,
        "code": "4.6",
        "title": "Income Tax Returns & Net Worth",
        "description": "The bidder must have a positive net worth and submit Income Tax Returns (ITR) with computation sheets for the financial years {{financial_years}}.",
        "mandatory": True
    },
    {
        "id": 407,
        "categoryId": 4,
        "code": "4.7",
        "title": "Statutory Registrations (PAN / GST / EPF / ESI)",
        "description": "The bidder must possess a valid PAN card, active GST registration certificate, and statutory registrations (such as EPF and ESI registration certificates where applicable).",
        "mandatory": True
    },
    {
        "id": 408,
        "categoryId": 4,
        "code": "4.8",
        "title": "Non-Blacklisting Declaration on Stamp Paper",
        "description": "The bidder must submit an original notarized affidavit on a Rs. {{stamp_paper_value}} Non-Judicial Stamp Paper affirming that the firm/company has never been blacklisted, debarred, or banned by any Central/State Government, Autonomous Institution, or PSU.",
        "mandatory": True
    },

    # Category 5: Earnest Money Deposit (EMD)
    {
        "id": 501,
        "categoryId": 5,
        "code": "5.1",
        "title": "EMD Amount & Acceptable Forms",
        "description": "The bidder must submit an Earnest Money Deposit (EMD) of Rs. {{emd_amount}} ({{emd_amount_words}}) in the form of a Fixed Deposit Receipt (FDR) or Bank Guarantee (BG) from a Nationalized/Scheduled Bank, duly pledged in favor of {{emd_pledge_officer}}.",
        "mandatory": True
    },
    {
        "id": 502,
        "categoryId": 5,
        "code": "5.2",
        "title": "Physical Submission of Original EMD Instrument",
        "description": "The original hard copy of the EMD instrument and non-blacklisting affidavit must be submitted to {{submission_officer}}, {{department_address}}, on or before {{emd_submission_days}} working days from the bid closing date. The sealed envelope must be clearly marked with the Tender Reference Number.",
        "mandatory": True
    },
    {
        "id": 503,
        "categoryId": 5,
        "code": "5.3",
        "title": "Refund of EMD",
        "description": "The EMD of unsuccessful bidders shall be refunded without interest within 30 days of contract award. The EMD of the successful bidder will be refunded upon submission of Performance Security and contract execution.",
        "mandatory": True
    },
    {
        "id": 504,
        "categoryId": 5,
        "code": "5.4",
        "title": "Forfeiture of EMD",
        "description": "The EMD shall be forfeited if the bidder withdraws/modifies its bid during the validity period, fails to execute the contract agreement, fails to furnish Performance Security, or submits false/forged credentials.",
        "mandatory": True
    },

    # Category 6: Performance Security (PBG)
    {
        "id": 601,
        "categoryId": 6,
        "code": "6.1",
        "title": "Performance Security Requirement",
        "description": "The successful bidder must submit a Performance Bank Guarantee (PBG) equal to {{pbg_percentage}}% of the total contract value (or Rs. {{pbg_amount}}) within {{pbg_submission_days}} days from the date of issuance of the Letter of Intent (LOI) / Work Order.",
        "mandatory": True
    },
    {
        "id": 602,
        "categoryId": 6,
        "code": "6.2",
        "title": "Form and Validity of PBG",
        "description": "The PBG must be in the form of an unconditional, irrevocable Bank Guarantee or FDR in favor of {{emd_pledge_officer}}, valid for a period of {{pbg_validity_period}} months beyond the contract/warranty completion period, with an additional 6 months claim period.",
        "mandatory": True
    },
    {
        "id": 603,
        "categoryId": 6,
        "code": "6.3",
        "title": "PBG Forfeiture & Recovery",
        "description": "The PBG shall be liable for forfeiture in part or full in the event of default, breach of contractual obligations, unrectified deficiencies, or failure to fulfill delivery/maintenance SLAs.",
        "mandatory": True
    },
    {
        "id": 604,
        "categoryId": 6,
        "code": "6.4",
        "title": "Release of Performance Security",
        "description": "The PBG shall be released after satisfactory completion of the contract/warranty period upon submission of a written request and a Satisfactory Performance Certificate issued by the Head of Department / Director.",
        "mandatory": True
    },

    # Category 7: Technical Specifications & Standards
    {
        "id": 701,
        "categoryId": 7,
        "code": "7.1",
        "title": "Conformity to Technical Specifications",
        "description": "The supplied items/equipment/materials must strictly conform to the detailed technical specifications listed in {{annexure_ref}}. Any deviation must be explicitly declared in the Technical Compliance Statement.",
        "mandatory": True
    },
    {
        "id": 702,
        "categoryId": 7,
        "code": "7.2",
        "title": "Quality Standards & Certifications",
        "description": "Equipment/products must adhere to national/international quality certifications (ISO, CE, BIS, NABL certified) and operate safely under standard Indian environmental and power conditions.",
        "mandatory": False
    },

    # Category 8: Printing Facility & Language Capability
    {
        "id": 801,
        "categoryId": 8,
        "code": "8.1",
        "title": "Multi-Language Printing Setup",
        "description": "The printing press must possess dedicated infrastructure, typesetting software, fonts, and proofreading experts capable of flawlessly printing in Hindi (Devnagri), Sanskrit, Mathematics (complex equations and symbols), and English.",
        "mandatory": True
    },
    {
        "id": 802,
        "categoryId": 8,
        "code": "8.2",
        "title": "In-House Machinery & Infrastructure",
        "description": "The bidder must own and operate multi-color sheet-fed offset, web offset machines, computer-to-plate (CtP) prepress systems, automatic folding, and heavy-duty perfect binding machines. An infrastructure profile must be submitted.",
        "mandatory": True
    },
    {
        "id": 803,
        "categoryId": 8,
        "code": "8.3",
        "title": "Physical Factory Verification",
        "description": "Himachal Pradesh University reserves the right to depute a technical committee to inspect and physically verify the bidder's printing press, machinery capacity, and quality control systems prior to awarding the contract.",
        "mandatory": False
    },

    # Category 9: Paper & Production Specifications
    {
        "id": 901,
        "categoryId": 9,
        "code": "9.1",
        "title": "Text Paper Quality & Brightness",
        "description": "Inner text pages must be printed on {{paper_gsm}} GSM Maplitho / SS White Paper from 'A' Grade reputed mills with minimum 80% ISO Brightness, uniform texture, and high opacity.",
        "mandatory": True
    },
    {
        "id": 902,
        "categoryId": 9,
        "code": "9.2",
        "title": "Cover Paper & Thermal Lamination",
        "description": "Cover pages must be printed in 4-Color multi-color offset on {{cover_paper_gsm}} GSM Art Card / SBS Board with high-grade thermal gloss / matte lamination, creased and trimmed to exact dimensions.",
        "mandatory": True
    },
    {
        "id": 903,
        "categoryId": 9,
        "code": "9.3",
        "title": "Book Dimensions & Set Area",
        "description": "The standard trimmed size of books shall be {{book_size}} with a text print set area of {{set_area}}, maintaining standard margins, headers, footers, and page numbers.",
        "mandatory": True
    },
    {
        "id": 904,
        "categoryId": 9,
        "code": "9.4",
        "title": "Binding Quality & Standards",
        "description": "Books must be section-sewn and bound with heavy-duty hot-melt glue perfect binding, ensuring spine durability, no loose pages, and long shelf life.",
        "mandatory": True
    },

    # Category 10: Samples, Proofreading & Dummy Approval
    {
        "id": 1001,
        "categoryId": 10,
        "code": "10.1",
        "title": "Sample Dummy Submission",
        "description": "The printer must submit complete dummy sample proofs printed on the approved paper within {{proof_submission_days}} days of receiving manuscript/soft copy for proofreading and verification.",
        "mandatory": True
    },
    {
        "id": 1002,
        "categoryId": 10,
        "code": "10.2",
        "title": "Proof Correction & Written Print Order",
        "description": "Bulk printing shall commence strictly after the University editorial committee approves the proofs and issues a formal written Print Order signed by the Director/Designated Officer.",
        "mandatory": True
    },
    {
        "id": 1003,
        "categoryId": 10,
        "code": "10.3",
        "title": "Custody of Manuscripts & Digital Files",
        "description": "The printer is responsible for the safe custody of all manuscripts, master copies, CRC, and digital files entrusted to them. Any loss or unauthorized disclosure will attract severe penalties.",
        "mandatory": True
    },

    # Category 11: Bid Evaluation & Award Process
    {
        "id": 1101,
        "categoryId": 11,
        "code": "11.1",
        "title": "Technical Bid Evaluation Methodology",
        "description": "Bids will be examined for responsiveness and compliance with all technical, financial, and eligibility requirements. Only substantially responsive bidders will be qualified for financial bid opening.",
        "mandatory": True
    },
    {
        "id": 1102,
        "categoryId": 11,
        "code": "11.2",
        "title": "Financial Evaluation & L1 Determination",
        "description": "Financial bids will be evaluated on the total cost / weighted cost formula as specified in the BOQ. The responsive bidder offering the lowest evaluated price (L1) shall be considered for award.",
        "mandatory": True
    },
    {
        "id": 1103,
        "categoryId": 11,
        "code": "11.3",
        "title": "Price Negotiation & Counter-Offer",
        "description": "The University reserves the right to negotiate rates with the L1 bidder. In the event L1 refuses or defaults, the University may offer the work to L2 at L1 matched rates, or re-tender the work.",
        "mandatory": False
    },

    # Category 12: Signing of Contract & Non-Disclosure
    {
        "id": 1201,
        "categoryId": 12,
        "code": "12.1",
        "title": "Formal Contract Agreement",
        "description": "The successful bidder must execute a contract agreement on a Non-Judicial Stamp Paper of Rs. {{stamp_paper_value}} within {{contract_signing_days}} days of the issue of the Letter of Intent (LOI) / Work Order.",
        "mandatory": True
    },
    {
        "id": 1202,
        "categoryId": 12,
        "code": "12.2",
        "title": "Non-Disclosure Agreement (NDA)",
        "description": "The contractor must execute a Non-Disclosure Agreement (NDA) on Rs. 100 Non-Judicial Stamp Paper guaranteeing strict confidentiality of all data, manuscripts, and proprietary institutional materials.",
        "mandatory": True
    },

    # Category 13: Prices & Commercial Terms
    {
        "id": 1301,
        "categoryId": 13,
        "code": "13.1",
        "title": "Currency & All-Inclusive FOR Pricing",
        "description": "Prices must be quoted in Indian Rupees (INR) and be all-inclusive (FOR Destination), covering basic price, paper, printing, binding, packing, freight, transit insurance, loading/unloading, and applicable GST.",
        "mandatory": True
    },
    {
        "id": 1302,
        "categoryId": 13,
        "code": "13.2",
        "title": "Firm Price & No Escalation",
        "description": "The quoted rates shall remain firm and fixed for the entire contract period (including extensions), except for statutory variations in GST rates officially notified by the Government.",
        "mandatory": True
    },
    {
        "id": 1303,
        "categoryId": 13,
        "code": "13.3",
        "title": "Price Fall Clause",
        "description": "The contractor undertakes that they have not supplied and will not supply identical goods/services to any other Government department/University at a rate lower than the contracted rate. If a lower price is charged elsewhere, the contract rate shall automatically be reduced.",
        "mandatory": True
    },
    {
        "id": 1304,
        "categoryId": 13,
        "code": "13.4",
        "title": "NIL Rates & Unreasonable Quotes",
        "description": "Bids quoting NIL or unreasonably unviable charges will be treated as non-responsive and summarily rejected.",
        "mandatory": True
    },

    # Category 14: Delivery, Phased Schedule & Logistics
    {
        "id": 1401,
        "categoryId": 14,
        "code": "14.1",
        "title": "Delivery Timeline & Phased Batches",
        "description": "Delivery must be completed within {{delivery_days}} days from the date of the work order / approved proof. For educational materials, delivery shall follow a phased schedule as per academic session/semester timelines.",
        "mandatory": True
    },
    {
        "id": 1402,
        "categoryId": 14,
        "code": "14.2",
        "title": "Delivery Location & Stacking",
        "description": "All supplies must be delivered Free On Rail/Road (FOR) Destination at {{delivery_location}}, including unloading and orderly stacking inside university godowns/laboratories.",
        "mandatory": True
    },
    {
        "id": 1403,
        "categoryId": 14,
        "code": "14.3",
        "title": "Transit Insurance",
        "description": "The supplier is responsible for transit insurance covering all risks from warehouse to final delivery site. Any damage, theft, or pilferage in transit shall be borne entirely by the supplier.",
        "mandatory": True
    },

    # Category 15: Inspection, Quality Assurance & Testing
    {
        "id": 1501,
        "categoryId": 15,
        "code": "15.1",
        "title": "Inspection Rights & Third Party Inspection",
        "description": "The University reserves the right to inspect goods at the factory pre-dispatch or at the delivery site. Third-party inspection (TPI) by an authorized agency may be conducted at the University's discretion.",
        "mandatory": True
    },
    {
        "id": 1502,
        "categoryId": 15,
        "code": "15.2",
        "title": "Paper GSM & Quality Lab Testing",
        "description": "Random samples of supplied books/paper will be sent to a Government-approved testing laboratory for verification of GSM, brightness, bursting factor, and ash content. Testing charges shall be borne by the printer.",
        "mandatory": True
    },
    {
        "id": 1503,
        "categoryId": 15,
        "code": "15.3",
        "title": "Rejection of Substandard Consignments",
        "description": "Goods failing to meet specifications will be rejected. The supplier must lift rejected goods at their own risk and cost and supply replacements conforming to standards within 7 days.",
        "mandatory": True
    },

    # Category 16: Installation, Commissioning & Training
    {
        "id": 1601,
        "categoryId": 16,
        "code": "16.1",
        "title": "Site Preparation Guidance",
        "description": "The supplier must provide detailed pre-installation site requirements (civil, electrical, environmental) in advance to enable timely site readiness.",
        "mandatory": False
    },
    {
        "id": 1602,
        "categoryId": 16,
        "code": "16.2",
        "title": "Installation & Commissioning by OEM",
        "description": "Equipment must be installed, calibrated, and commissioned by qualified OEM factory-trained engineers within the agreed schedule at no additional charge.",
        "mandatory": False
    },
    {
        "id": 1603,
        "categoryId": 16,
        "code": "16.3",
        "title": "Comprehensive User Training",
        "description": "The supplier must provide comprehensive hands-on operational and maintenance training to faculty members, research scholars, and technical staff at the installation site.",
        "mandatory": False
    },

    # Category 17: Comprehensive Warranty & Replacement
    {
        "id": 1701,
        "categoryId": 17,
        "code": "17.1",
        "title": "Comprehensive On-Site Warranty",
        "description": "The equipment and all accessories must be covered by a comprehensive on-site warranty for a minimum of {{warranty_years}} years from the date of final acceptance certification.",
        "mandatory": False
    },
    {
        "id": 1702,
        "categoryId": 17,
        "code": "17.2",
        "title": "Free Replacement & Downtime Extension",
        "description": "Defective components must be replaced with new genuine parts free of charge during the warranty period. The warranty period shall automatically be extended by the duration of equipment downtime.",
        "mandatory": False
    },

    # Category 18: After-Sales Maintenance & SLA
    {
        "id": 1801,
        "categoryId": 18,
        "code": "18.1",
        "title": "Response Time & Uptime Guarantee",
        "description": "The vendor must maintain an annual uptime of at least {{uptime_guarantee}}% and ensure an engineer attends to breakdown calls within {{response_time_hours}} hours.",
        "mandatory": False
    },
    {
        "id": 1802,
        "categoryId": 18,
        "code": "18.2",
        "title": "Downtime Penalty & PBG Deduction",
        "description": "Failure to restore equipment within stipulated limits will attract a downtime penalty of {{service_penalty_1}} per day for the first week, and {{service_penalty_2}} per day thereafter, deductible from PBG/bills.",
        "mandatory": False
    },
    {
        "id": 1803,
        "categoryId": 18,
        "code": "18.3",
        "title": "Debarment for Extended Service Delay",
        "description": "Continuous service outage exceeding {{max_service_delay_days}} days shall result in PBG forfeiture, termination, and blacklisting of the firm from future university tenders.",
        "mandatory": False
    },

    # Category 19: Spare Parts & Consumables Availability
    {
        "id": 1901,
        "categoryId": 19,
        "code": "19.1",
        "title": "Long-Term Spare Parts Undertaking",
        "description": "The bidder/OEM must furnish a written undertaking guaranteeing the availability of genuine spare parts and consumables for at least {{spare_parts_years}} years following warranty expiration.",
        "mandatory": False
    },

    # Category 20: Liquidated Damages & Delay Penalties
    {
        "id": 2001,
        "categoryId": 20,
        "code": "20.1",
        "title": "Liquidated Damages for Delayed Delivery",
        "description": "Delay in delivery/installation shall attract liquidated damages at {{penalty_rate}}% per week of delay (or part thereof) on the contract value, up to a maximum penalty of {{max_penalty}}%.",
        "mandatory": True
    },
    {
        "id": 2002,
        "categoryId": 20,
        "code": "20.2",
        "title": "Risk Purchase Clause & Annulment",
        "description": "If delay exceeds {{max_delay_weeks}} weeks, the University reserves the right to cancel the order, forfeit PBG, and procure items from the open market at the defaulting contractor's risk and cost.",
        "mandatory": True
    },

    # Category 21: Printing Penalties & Deficiencies
    {
        "id": 2101,
        "categoryId": 21,
        "code": "21.1",
        "title": "Penalty for Loss of Manuscript / Master Copy",
        "description": "In case of loss or damage of manuscript/master copy/CRC by the printer, a penalty of Rs. {{loss_manuscript_penalty}} per booklet shall be levied in addition to re-creation costs.",
        "mandatory": False
    },
    {
        "id": 2102,
        "categoryId": 21,
        "code": "21.2",
        "title": "Penalty for Misprints, Errors & Blank Pages",
        "description": "A penalty of Rs. {{error_penalty}} per instance shall be charged for errors such as blank pages, illegible text, misprints, or typographical mistakes. The printer must replace erroneous lots free of cost.",
        "mandatory": False
    },
    {
        "id": 2103,
        "categoryId": 21,
        "code": "21.3",
        "title": "Penalty for Missing Pages",
        "description": "If delivered books contain fewer pages than ordered, a penalty of Rs. {{missing_page_penalty}} per missing page per book shall be deducted in addition to the cost of missing pages.",
        "mandatory": False
    },
    {
        "id": 2104,
        "categoryId": 21,
        "code": "21.4",
        "title": "Substandard Paper GSM Penalty",
        "description": "If paper GSM or brightness is found below specified tolerance levels upon laboratory testing, a financial penalty of up to 20% shall be deducted from the total bill, or the lot rejected.",
        "mandatory": False
    },
    {
        "id": 2105,
        "categoryId": 21,
        "code": "21.5",
        "title": "Post-Supply Deficiency Penalty",
        "description": "Deficiencies discovered after delivery (e.g. binding failure, damaged pages, stakeholder complaints) will attract a penalty of 0.5% of total order value per instance.",
        "mandatory": False
    },

    # Category 22: Packaging, Marking & Stacking
    {
        "id": 2201,
        "categoryId": 22,
        "code": "22.1",
        "title": "Standard Packaging & Moisture Protection",
        "description": "Books must be shrink-wrapped in bundles of 10/20 copies and packed in heavy-duty 5-ply corrugated master cartons strapped with HDPE bands. Equipment must be packed in sea/air-worthy wooden boxes.",
        "mandatory": True
    },
    {
        "id": 2202,
        "categoryId": 22,
        "code": "22.2",
        "title": "Carton Marking & Identification",
        "description": "Each outer carton must bear clear stenciled labels displaying Title, Subject, Semester, Course, Quantity, Gross Weight, Consignee Details, and 'FRAGILE / HANDLE WITH CARE' markings.",
        "mandatory": True
    },

    # Category 23: Substitution & Change of Model
    {
        "id": 2301,
        "categoryId": 23,
        "code": "23.1",
        "title": "Prohibition of Unauthorized Substitution",
        "description": "Supplying substitute materials, paper, or models without prior written approval is strictly prohibited and shall lead to immediate rejection at the supplier's risk and expense.",
        "mandatory": True
    },
    {
        "id": 2302,
        "categoryId": 23,
        "code": "23.2",
        "title": "Upgraded Model Acceptance",
        "description": "If an equipment model becomes obsolete during the tender validity, the manufacturer's official successor model with equal or higher specifications may be accepted with prior written University approval at no additional cost.",
        "mandatory": False
    },

    # Category 24: Payment Terms & Invoicing
    {
        "id": 2401,
        "categoryId": 24,
        "code": "24.1",
        "title": "Standard Payment Terms",
        "description": "100% payment will be released through PFMS/electronic transfer within 30 to 45 days after successful delivery, inspection, laboratory test verification, and acceptance certification.",
        "mandatory": True
    },
    {
        "id": 2402,
        "categoryId": 24,
        "code": "24.2",
        "title": "Mandatory Invoice Enclosures",
        "description": "Bills must be submitted in triplicate accompanied by verified Delivery Challans, Stock Entry Certificates, Lab Testing Reports, and GST payment proof.",
        "mandatory": True
    },
    {
        "id": 2403,
        "categoryId": 24,
        "code": "24.3",
        "title": "Statutory Deductions (TDS / GST TDS)",
        "description": "Statutory deductions of Income Tax TDS and GST TDS at applicable rates will be deducted at source from all running and final bills.",
        "mandatory": True
    },

    # Category 25: Copyright & Return of Material
    {
        "id": 2501,
        "categoryId": 25,
        "code": "25.1",
        "title": "Exclusive Institutional Copyright",
        "description": "Himachal Pradesh University holds exclusive copyright and intellectual property rights over all manuscripts, syllabi, study materials, and technical outputs. Commercial dissemination or reprinting is strictly prohibited.",
        "mandatory": True
    },
    {
        "id": 2502,
        "categoryId": 25,
        "code": "25.2",
        "title": "Mandatory Return of Plates, Files & CRC",
        "description": "Upon completion of the printing job, the printer must return all manuscripts, camera-ready copies (CRC), printing plates, films, and editable digital files (soft copies) to the University.",
        "mandatory": True
    },

    # Category 26: Termination of Contract & Debarment
    {
        "id": 2601,
        "categoryId": 26,
        "code": "26.1",
        "title": "Termination for Default",
        "description": "The University may terminate the contract in whole or part if the contractor fails to deliver materials/equipment within the scheduled period or fails to perform any contractual obligation.",
        "mandatory": True
    },
    {
        "id": 2602,
        "categoryId": 26,
        "code": "26.2",
        "title": "Termination for Insolvency & Convenience",
        "description": "The University may terminate the contract at any time if the contractor becomes bankrupt, insolvent, or if the requirement ceases due to administrative exigencies.",
        "mandatory": True
    },

    # Category 27: Force Majeure
    {
        "id": 2701,
        "categoryId": 27,
        "code": "27.1",
        "title": "Force Majeure Definition & Notification",
        "description": "Neither party shall be liable for delay or failure caused by events beyond reasonable control (acts of God, natural calamities, war, pandemic). The affected party must notify the University within 48 hours in writing.",
        "mandatory": True
    },

    # Category 28: Arbitration and Jurisdiction
    {
        "id": 2801,
        "categoryId": 28,
        "code": "28.1",
        "title": "Sole Arbitration",
        "description": "All disputes arising out of this tender/contract shall be referred to the sole arbitration of {{arbitrator_authority}}, whose award shall be final and binding on both parties.",
        "mandatory": True
    },
    {
        "id": 2802,
        "categoryId": 28,
        "code": "28.2",
        "title": "Legal Jurisdiction",
        "description": "The courts situated at {{court_jurisdiction}} alone shall have exclusive jurisdiction over any dispute or matter arising out of this contract.",
        "mandatory": True
    },

    # Category 29: Right of Acceptance & University Discretion
    {
        "id": 2901,
        "categoryId": 29,
        "code": "29.1",
        "title": "University Right to Accept or Reject Bids",
        "description": "Himachal Pradesh University reserves the absolute right to accept or reject any bid (including the lowest L1 quote) or annul the tender process at any stage without assigning any reason or incurring liability.",
        "mandatory": True
    },
    {
        "id": 2902,
        "categoryId": 29,
        "code": "29.2",
        "title": "Rejection of Non-Compliant & Conditional Bids",
        "description": "Incomplete bids, conditional offers, bids with handwritten corrections, or bids without mandatory enclosures shall be summarily rejected.",
        "mandatory": True
    },

    # Category 30: Mandatory Forms & Annexures
    {
        "id": 3001,
        "categoryId": 30,
        "code": "30.1",
        "title": "Annexure-I: Bid Cover Letter & Undertaking",
        "description": "Formal submission letter on company letterhead accepting all tender terms unconditionally without reservations.",
        "mandatory": True
    },
    {
        "id": 3002,
        "categoryId": 30,
        "code": "30.2",
        "title": "Annexure-II: Technical Bid & Infrastructure Profile",
        "description": "Detailed organizational profile, printing machinery/equipment specifications, CtP machines, binding equipment, and staff strength.",
        "mandatory": True
    },
    {
        "id": 3003,
        "categoryId": 30,
        "code": "30.3",
        "title": "Annexure-III: Financial Bid / BOQ Structure",
        "description": "Standardized price quoting schedule for item-wise rates inclusive of taxes, handling, freight, and insurance.",
        "mandatory": True
    },
    {
        "id": 3004,
        "categoryId": 30,
        "code": "30.4",
        "title": "Annexure-IV: EMD Exemption Declaration",
        "description": "Declaration form with supporting MSE / Udyam registration certificates claiming exemption from EMD / tender fee.",
        "mandatory": False
    },
    {
        "id": 3005,
        "categoryId": 30,
        "code": "30.5",
        "title": "Annexure-V: Non-Blacklisting Notarized Affidavit",
        "description": "Sworn affidavit on Rs. 50/100 Non-Judicial Stamp Paper declaring that the bidding entity has never been blacklisted or debarred.",
        "mandatory": True
    },
    {
        "id": 3006,
        "categoryId": 30,
        "code": "30.6",
        "title": "Annexure-VI: Technical Specification Compliance Sheet",
        "description": "Point-by-point compliance table verifying adherence to each parameter of the technical specifications.",
        "mandatory": True
    }
]

print(f"Total Categories: {len(categories)}")
print(f"Total Terms: {len(terms)}")

with open("full_terms.json", "w", encoding="utf-8") as f:
    json.dump({"categories": categories, "terms": terms}, f, indent=2)
