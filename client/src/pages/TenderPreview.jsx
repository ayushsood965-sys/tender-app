import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { fetchTender, fetchDashboardData, fetchSavedDocument, saveDocument, updateSavedDocument } from '../services/api';

// A4 Page Layout Component with contentEditable support, watermark, and X/Y page numbering
const PageLayout = ({ children, pageNumber, totalPages, contentRef, isFirst }) => (
    <div className={`a4-page ${isFirst ? '' : 'mt-8'}`}>
        <div className="border-outer">
            <div className="border-middle">
                <div className="border-inner">
                    <div className="page-watermark">
                        <img src="/hpu_watermark.png" alt="" aria-hidden="true" />
                    </div>
                    <div
                        ref={contentRef}
                        className="page-content"
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        style={{ outline: 'none', minHeight: '100%' }}
                    >
                        {children}
                    </div>
                    <div className="page-footer">
                        {pageNumber}/{totalPages}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TenderPreview = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const savedId = searchParams.get('savedId');

    const [data, setData] = useState(null);
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSavedDoc, setCurrentSavedDoc] = useState(null);

    // Page management
    const [pages, setPages] = useState([]);
    const pageRefs = useRef({});

    // Save Modal & Status
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error' | null
    const [isSavingDirect, setIsSavingDirect] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("Invalid URL: No Tender ID provided.");
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const tender = await fetchTender(id);
                const dashboardData = await fetchDashboardData();
                const allTerms = dashboardData.terms || [];
                const allCategories = dashboardData.categories || [];

                const selectedTermIds = tender.selectedTermIds || [];
                const selectedTerms = allTerms.filter(term => selectedTermIds.includes(term.id));

                setTerms(selectedTerms);
                setCategories(allCategories);
                setData(tender);

                // If loading a saved document, use its pages
                if (savedId) {
                    const savedDoc = await fetchSavedDocument(savedId);
                    if (savedDoc) {
                        setCurrentSavedDoc(savedDoc);
                        setSaveName(savedDoc.name || `Version ${savedDoc.id}`);
                        if (savedDoc.pages) {
                            const loadedPages = Object.keys(savedDoc.pages)
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map(key => ({ id: key, html: savedDoc.pages[key] }));
                            setPages(loadedPages);
                        }
                    }
                } else {
                    // Generate fresh pages from tender data
                    const generatedPages = generatePages(tender, selectedTerms, allCategories);
                    setPages(generatedPages);
                    setSaveName(`${tender.tenderName || "Tender"} - Draft`);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(`Failed to load data: ${err.message}`);
                setLoading(false);
            }
        };

        loadData();
    }, [id, savedId]);

    // Generate initial page HTML content
    const generatePages = (tender, selectedTerms, allCategories) => {
        const variables = tender.variables || {};
        const isLimited = tender.documentType === "Limited Tender Document" || tender.tenderType === "limited";

        const formatDate = (d) => {
            if (!d) return "__/__/2026";
            const date = new Date(d);
            return isNaN(date.getTime()) ? "__/__/2026" : date.toLocaleDateString("en-IN");
        };

        const replaceVars = (text) => {
            if (!text) return text;
            let result = text;
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                result = result.replace(regex, variables[key] || `{{${key}}}`);
            });
            return result;
        };

        // -------------------------------------------------------------
        // A. LIMITED TENDER DOCUMENT LAYOUT (e.g. Sports Equipment / Local Procurement)
        // -------------------------------------------------------------
        if (isLimited) {
            const items = (tender.itemsList && tender.itemsList.length > 0) ? tender.itemsList : [
                { srNo: 1, name: "Table Tennis Table", specs: "22mm Top with 75mm Wheel Size, TTFI approved", quantity: "3" },
                { srNo: 2, name: "Table Tennis Bat", specs: "Tournament Grade, Flared Grip, Ratings: Speed 70, Spin 70, Control 95", quantity: "12" },
                { srNo: 3, name: "Badminton Racket", specs: "Carbon material, Lightweight design", quantity: "10" },
                { srNo: 4, name: "Carrom Board", specs: "12mm Ply, 35\" Overall frame, 29\" Playing area, 3\" hand rest, with stand", quantity: "5" },
                { srNo: 5, name: "Chess Board", specs: "Foldable 19\"x19\" board with wooden chessmen", quantity: "7" },
                { srNo: 6, name: "Table Tennis Balls", specs: "3-Star standard, Pack of 3", quantity: "4" },
                { srNo: 7, name: "Badminton Shuttle Cock", specs: "Nylon material, Standard tournament grade", quantity: "8" },
                { srNo: 8, name: "Cricket Bat", specs: "Kashmir Willow", quantity: "4" },
                { srNo: 9, name: "Volley Ball", specs: "Leather material", quantity: "2" },
                { srNo: 10, name: "Foot Ball", specs: "Rubberised material, standard match quality", quantity: "2" },
            ];

            const estCostFormatted = tender.estimatedCost ? Number(tender.estimatedCost).toLocaleString("en-IN") : "2,29,000";
            const estCostWords = tender.estimatedCostWords || "Rupees Two Lakh Twenty-Nine Thousand only";
            const emdFormatted = tender.emdAmount ? Number(tender.emdAmount).toLocaleString("en-IN") : (tender.emdRequired || "5,000");
            const emdWords = tender.emdAmountWords || "Rupees Five Thousand Only";
            const pbgFormatted = tender.pbgAmount ? Number(tender.pbgAmount).toLocaleString("en-IN") : (tender.pbgRequired || "10,000");
            const pbgWords = tender.pbgAmountWords || "Rupees Ten Thousand Only";

            // Page 1: Notice Letter & Two-Cover Submission System
            const page1 = `
                <div style="font-size: 11pt; line-height: 1.5; color: #000;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 10pt;">
                        <span><strong>No. ${tender.tenderNo || "1-13/2009-HPU (CW)"}</strong></span>
                        <span><strong>Dated: ${formatDate(tender.publishDate)}</strong></span>
                    </div>
                    <div style="text-align: center; margin-bottom: 16px;">
                        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 2px;">Himachal Pradesh University</h2>
                        <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 2px;">(NAAC Accredited ‘A’ Grade University)</h3>
                        <h3 style="font-size: 15px; font-weight: bold;">“${tender.departmentName || "Store Purchase Office"}”</h3>
                    </div>
                    <div style="margin-bottom: 12px; font-size: 10.5pt;">
                        <p style="margin-bottom: 2px;"><strong>To</strong></p>
                        <p style="padding-left: 24px; color: #333;">_____________________________________</p>
                        <p style="padding-left: 24px; color: #333;">_____________________________________</p>
                        <p style="padding-left: 24px; color: #333;">_____________________________________</p>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <p><strong>Subject:</strong> <span style="font-weight: bold; text-decoration: underline;">Limited Tender/Sealed Quotations for the Purchase of ${tender.tenderName || "Sports Items"} for ${tender.departmentName || "Chief Warden (Boys Hostels)"}.</span></p>
                    </div>
                    <p style="margin-bottom: 8px;"><strong>Sir,</strong></p>
                    <p style="text-align: justify; margin-bottom: 10px;">
                        Sealed quotations are invited from eligible firms for the procurement of <strong>${tender.tenderName || "Equipment"}</strong> for ${tender.procurementLocations || "Tagore Boys Hostel, SBS Tribal Boys Hostel, and Dr. Y.S. Parmar Boys Hostel of H.P. University, Summerhill, Shimla-171005"}.
                    </p>
                    <p style="margin-bottom: 16px;">
                        The approximate value of purchase is <strong>Rs. ${estCostFormatted}/- (${estCostWords})</strong>.
                    </p>
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; text-decoration: underline;">Submission of Bids</h3>
                    <p style="text-align: justify; margin-bottom: 8px;">The bid shall be submitted in separate sealed covers:</p>
                    <div style="padding-left: 12px; margin-bottom: 10px; text-align: justify;">
                        <p style="margin-bottom: 6px;"><strong>Cover 1: Technical Bid.</strong> This cover shall contain all supporting documents pertaining to the technical specifications, EMD, eligibility criteria, and other related requirements. The cover shall be clearly superscribed with the words <strong>"Technical Bid"</strong>.</p>
                        <p style="margin-bottom: 6px;"><strong>Cover 2: Financial Bid.</strong> This cover shall contain the bidder's price quotation in the prescribed format given at <strong>Annexure – ‘A’</strong>. The cover shall be clearly superscribed with the words <strong>"Financial Bid"</strong>.</p>
                    </div>
                    <p style="text-align: justify; margin-bottom: 6px;">Both Cover 1 and Cover 2 shall be placed in a larger, sealed outer envelope. The outer envelope shall be superscribed as:</p>
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #004821; padding: 8px 14px; margin-bottom: 8px;">
                        <p style="font-weight: bold; font-size: 11pt; color: #000;">"Tender for Procurement of ${tender.tenderName || 'Sports Items'} – ${tender.tenderNo || '1-13/2009-HPU (CW)'}"</p>
                        <p style="font-size: 10.5pt; color: #334155; margin-top: 3px;"><strong>Addressed to:</strong> The ${tender.tenderInvitingAuthority || "Store Purchase Officer"}, Himachal Pradesh University, Summer Hill, Shimla 171005.</p>
                    </div>
                </div>
            `;

            // Page 2: Instructions to Bidders, Terms & Conditions & Sign-off
            const page2 = `
                <div style="font-size: 11pt; line-height: 1.5; color: #000; text-align: justify;">
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; text-decoration: underline;">Instructions to Bidders</h3>
                    <p style="margin-bottom: 8px;"><strong>1. Earnest Money Deposit (EMD):</strong> ₹ ${emdFormatted}/- (${emdWords}) in the form of Duly Pledged Fixed Deposit Receipt/Demand Draft or Bank Guarantee from a nationalized bank, drawn in favour of the "<strong>${tender.emdPledgeOfficer || "Finance Officer, H.P. University, Shimla-05"}</strong>" payable at Shimla.</p>
                    <p style="margin-bottom: 8px;"><strong>2. Submission Deadline:</strong> Quotations must reach this office on or before <strong>${formatDate(tender.bidEndDate)} till ${tender.bidEndTime || "5:00 P.M."}</strong>.</p>
                    <p style="margin-bottom: 14px;"><strong>3. Bid Opening:</strong> The technical bids will be opened on <strong>${formatDate(tender.techEvalDate)} at ${tender.techEvalTime || "11:30 A.M."}</strong> in the <strong>${tender.openingVenue || "Store Purchase Office"}</strong> and will be evaluated by the committee concerned.</p>
                    
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; margin-top: 14px; text-decoration: underline;">Additional Terms and Conditions</h3>
                    <p style="margin-bottom: 8px;"><strong>4. Rate Specification:</strong> All rates must be inclusive of applicable taxes (GST), duties, levies, and quoted F.O.R. destination (${tender.procurementLocations || "Hostel Premises / University Campus"}).</p>
                    <p style="margin-bottom: 8px;"><strong>5. Bid Security (EMD):</strong> Bids submitted without the required EMD will be rejected.</p>
                    <p style="margin-bottom: 8px;"><strong>6. Performance Bank Guarantee (PBG):</strong> The successful bidder must submit a Performance Bank Guarantee of ₹ ${pbgFormatted}/- (${pbgWords}) 15 days prior to the issuance of the award letter.</p>
                    <p style="margin-bottom: 8px;"><strong>7. Completion Time:</strong> The successful bidder must complete the supply within <strong>${tender.deliveryDays || 15} days</strong> after issuance of the supply order.</p>
                    <p style="margin-bottom: 8px;"><strong>8. Statutory Documents:</strong> The bidder must attach self-attested valid copies of the PAN Card and GST Registration Certificate along with the Technical Bid.</p>
                    <p style="margin-bottom: 8px;"><strong>9. Non-Blacklisting Declaration:</strong> The bidder must submit an affidavit on a Non-Judicial Stamp Paper of ₹ 50/- duly attested by a Notary Public/Executive Magistrate declaring that the firm has not been blacklisted, debarred, or banned by any Government Department/PSU/Autonomous Body.</p>
                    <p style="margin-bottom: 8px;"><strong>10. Warranty:</strong> The supplier warrants that the supplied articles shall be free from defects in material and workmanship. For durable items (Tables, Boards, Heavy Equipment): <strong>${tender.warrantyDurable || "12 months"}</strong>; for consumable items: <strong>${tender.warrantyConsumable || "6 months"}</strong> from final acceptance.</p>
                    <p style="margin-bottom: 8px;"><strong>11. Payment Release:</strong> Payment will be made following inspection and verification by the concerned committee, confirming that the material is in good condition and meets specifications.</p>
                    <p style="margin-bottom: 8px;"><strong>12. Rejection of Bids:</strong> Late bids, telegraphic bids, or bids sent via email will not be considered.</p>
                    <p style="margin-bottom: 8px;"><strong>13. Jurisdiction:</strong> All disputes arising out of or in connection with this tender shall be subject to the exclusive jurisdiction of the courts in ${tender.courtJurisdiction || "Shimla Urban"}.</p>
                    <p style="margin-bottom: 16px;"><strong>14. Validity:</strong> Rates approved under the purchase order will remain valid for ${tender.bidValidity || 90} days / one year.</p>
                    
                    <div style="margin-top: 24px; text-align: right;">
                        <p style="margin-bottom: 30px;">Yours faithfully,</p>
                        <p style="font-weight: bold; margin-bottom: 2px;">${tender.tenderInvitingAuthority || "Store Purchase Officer"}</p>
                        <p>H.P. University, Shimla-5.</p>
                    </div>
                </div>
            `;

            // Page 3: Annexure-A Financial Bid Submission Form & Schedule Table
            const itemsRowsHtml = items.map((item, idx) => `
                <tr>
                    <td style="border: 1px solid black; padding: 5px 8px; text-align: center;">${idx + 1}.</td>
                    <td style="border: 1px solid black; padding: 5px 8px; font-weight: 600;">${item.name || ""}</td>
                    <td style="border: 1px solid black; padding: 5px 8px;">${item.specs || ""}</td>
                    <td style="border: 1px solid black; padding: 5px 8px; text-align: center; font-weight: 700;">${item.quantity || "1"}</td>
                    <td style="border: 1px solid black; padding: 5px 8px;"></td>
                    <td style="border: 1px solid black; padding: 5px 8px;"></td>
                    <td style="border: 1px solid black; padding: 5px 8px;"></td>
                </tr>
            `).join("");

            const page3 = `
                <div style="font-size: 11pt; line-height: 1.5; color: #000;">
                    <div style="text-align: center; margin-bottom: 14px;">
                        <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin-bottom: 3px;">Annexure-A</h2>
                        <h3 style="font-size: 15px; font-weight: bold;">Financial Bid Submission Form</h3>
                    </div>
                    <div style="margin-bottom: 12px; font-size: 10pt;">
                        <p style="margin-bottom: 4px;"><strong>Name of the Firm:</strong> ______________________________________________________________</p>
                        <p style="margin-bottom: 4px;"><strong>Address:</strong> _______________________________________________________________________</p>
                        <p style="margin-bottom: 10px;"><strong>GST No:</strong> _______________________________________________________________________</p>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 6%; text-align: center;">Sr. No.</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; width: 22%;">Name of Articles</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; width: 30%;">Specification / Dimensions</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 10%; text-align: center;">Total Qty</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 12%; text-align: center;">Base Rate (Excl. Tax)</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 8%; text-align: center;">GST (%)</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 12%; text-align: center;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml}
                            <tr>
                                <td colspan="6" style="border: 1px solid black; padding: 6px 8px; font-weight: bold; text-align: right;">Grand Total (INR)</td>
                                <td style="border: 1px solid black; padding: 6px 8px;"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="font-size: 10pt; text-align: justify; margin-top: 14px;">
                        <p><strong>Declaration:</strong></p>
                        <p style="margin-bottom: 16px;">
                            We undertake that, if our bid is accepted, we will complete the supply within the specified time frame. We hereby accept all terms and conditions given in the tender document and agree to abide by this bid for the validity period specified in the tender document.
                        </p>
                        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                            <div>
                                <p><strong>Date:</strong> _ _ / _ _ / 2026</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin-bottom: 24px;"><strong>Signature of Authorized Person:</strong> ___________________________</p>
                                <p><strong>Seal of the Firm:</strong> _________________________</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return [
                { id: '1', html: page1 },
                { id: '2', html: page2 },
                { id: '3', html: page3 },
            ];
        }

        // -------------------------------------------------------------
        // B. GeM ATC DOCUMENT & e-TENDER DOCUMENT LAYOUT
        // -------------------------------------------------------------
        // Page 1: Cover Page
        const page1 = `
            <div style="height: 100%; display: flex; flex-direction: column; padding-top: 50px; text-align: center;">
                <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">Himachal Pradesh University,</h2>
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">(NAAC Accredited 'A' Grade University)</h3>
                <h3 style="font-size: 16px; font-weight: bold;">"${tender.departmentName || 'N/A'}"</h3>
                <div style="margin: 28px auto; text-align: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg" alt="HPU Logo" style="height: 140px; width: auto;" />
                </div>
                <h1 style="font-size: 21px; font-weight: bold; margin: 20px 24px;">
                    Bid Document for<br/>
                    <span style="font-size: 18px; font-weight: normal; display: block; margin-top: 8px;">${tender.tenderName || 'N/A'}</span>
                    <br/>for<br/>
                    <span style="font-size: 18px; font-weight: normal; display: block; margin-top: 8px;">${tender.departmentName || 'N/A'}</span>
                </h1>
                <div style="margin-top: 28px; font-size: 15px;">
                    <p style="margin-bottom: 6px;"><strong>Website:</strong> <a href="https://www.hpuniv.ac.in" style="color: #1e3a8a; text-decoration: underline;">https://www.hpuniv.ac.in</a></p>
                    <p><strong>E-mail:</strong> ${tender.departmentEmail || 'N/A'}</p>
                </div>
            </div>
        `;

        // Page 2: Summary Table + Section 1
        const page2 = `
            <div>
                <h3 style="font-size: 16px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 14px; text-align: center;">SUMMARY</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 10pt;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid black; padding: 7px 10px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 10%;">Sr. No.</th>
                            <th style="border: 1px solid black; padding: 7px 10px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 30%;">Description</th>
                            <th style="border: 1px solid black; padding: 7px 10px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 60%;">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">1.</td><td style="border: 1px solid black; padding: 7px 10px;">Item Description</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.tenderName || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">2.</td><td style="border: 1px solid black; padding: 7px 10px;">Quantity</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.itemQuantity || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">3.</td><td style="border: 1px solid black; padding: 7px 10px;">Department</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.departmentName || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">4.</td><td style="border: 1px solid black; padding: 7px 10px;">Bid Start Date & Time</td><td style="border: 1px solid black; padding: 7px 10px;">[as mentioned in Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">5.</td><td style="border: 1px solid black; padding: 7px 10px;">Bid End Date & Time</td><td style="border: 1px solid black; padding: 7px 10px;">[as mentioned in Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">6.</td><td style="border: 1px solid black; padding: 7px 10px;">Pre-Bid Meeting</td><td style="border: 1px solid black; padding: 7px 10px;">[as mentioned in Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">7.</td><td style="border: 1px solid black; padding: 7px 10px;">Earnest Money Deposit (EMD)</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.emdRequired || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">8.</td><td style="border: 1px solid black; padding: 7px 10px;">Performance Security</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.pbgRequired || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">9.</td><td style="border: 1px solid black; padding: 7px 10px;">Pledge of EMD / PBG</td><td style="border: 1px solid black; padding: 7px 10px;">EMD and PBG must be pledged in the name of: <strong>${tender.emdPledgeOfficer || 'N/A'}</strong></td></tr>
                        <tr><td style="border: 1px solid black; padding: 7px 10px;">10.</td><td style="border: 1px solid black; padding: 7px 10px;">Bid Validity</td><td style="border: 1px solid black; padding: 7px 10px;">${tender.bidValidity || 'N/A'} days from date of publication</td></tr>
                    </tbody>
                </table>
                <p style="font-weight: bold; font-size: 10pt; border: 1px solid #ccc; padding: 8px; background-color: #f9f9f9; margin-bottom: 16px;"><strong>Note:</strong> The terms and conditions specified in this tender document shall prevail over any portal default conditions in case of any conflict.</p>
                <div>
                    <h3 style="font-size: 16px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 12px; text-align: center;">SECTION 1: INSTRUCTIONS FOR BIDDERS</h3>
                    <div style="text-align: justify; font-size: 11pt; line-height: 1.5;">
                        <p style="margin-bottom: 10px;"><strong>1.1 Bid Submission:</strong> Bidders must be registered on the designated procurement portal. All bids must be submitted exclusively online before the specified deadline.</p>
                        <p><strong>1.2 Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) in addition to the Additional Terms and Conditions (ATC) specified in this document.</p>
                    </div>
                </div>
            </div>
        `;

        // Generate Terms pages
        const termsPages = [];
        const grouped = {};
        selectedTerms.forEach(term => {
            if (!grouped[term.categoryId]) grouped[term.categoryId] = [];
            grouped[term.categoryId].push(term);
        });

        let termsHtml = '';
        termsHtml += `
            <div style="margin-bottom: 24px;">
                <h4 style="font-size: 15px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; margin-top: 16px;">SECTION 2: GENERAL REQUIREMENTS</h4>
                <div style="text-align: justify; font-size: 11pt; line-height: 1.5;">
                    <p style="margin-bottom: 10px;"><strong>2.1 Digital Signature:</strong> <span style="font-weight: normal;">Bids must be digitally signed by an authorized representative using a valid Class-II or Class-III DSC.</span></p>
                    <p style="margin-bottom: 10px;"><strong>2.2 Documentation:</strong> <span style="font-weight: normal;">Bidders are required to upload scanned copies of all necessary documents. All documents must be clear, legible, and duly signed and stamped.</span></p>
                </div>
            </div>
        `;

        allCategories.forEach((cat, catIndex) => {
            const catTerms = grouped[cat.id];
            if (!catTerms || catTerms.length === 0) return;

            termsHtml += `<h4 style="font-size: 15px; font-weight: bold; text-transform: uppercase; margin-bottom: 14px; margin-top: 20px;">SECTION ${catIndex + 3}: ${cat.name.toUpperCase()}</h4>`;

            catTerms.forEach((term, termIndex) => {
                const description = replaceVars(term.description);
                termsHtml += `
                    <div style="margin-bottom: 12px; padding-left: 6px; text-align: justify; line-height: 1.5; font-size: 11pt;">
                        <p><strong>${catIndex + 3}.${termIndex + 1} ${term.title}:</strong> <span style="font-weight: normal;">${description}</span></p>
                    </div>
                `;
            });
        });

        const CHARS_PER_PAGE = 3200;
        if (termsHtml.length <= CHARS_PER_PAGE) {
            termsPages.push(termsHtml);
        } else {
            const sections = termsHtml.split(/<h4/);
            let currentPage = '';
            sections.forEach((section, idx) => {
                const fullSection = idx === 0 ? section : '<h4' + section;
                if ((currentPage + fullSection).length > CHARS_PER_PAGE && currentPage.trim()) {
                    termsPages.push(currentPage);
                    currentPage = fullSection;
                } else {
                    currentPage += fullSection;
                }
            });
            if (currentPage.trim()) {
                termsPages.push(currentPage);
            }
        }

        return [
            { id: '1', html: page1 },
            { id: '2', html: page2 },
            ...termsPages.map((html, idx) => ({ id: `${3 + idx}`, html })),
        ];
    };

    const addNewPage = () => {
        const newId = `${pages.length + 1}`;
        setPages(prev => [
            ...prev,
            {
                id: newId,
                html: `<div style="padding: 12px;"><h3 style="font-size: 16px; font-weight: bold; margin-bottom: 14px; text-decoration: underline;">NEW SECTION / CLAUSE</h3><p style="font-size: 11pt; line-height: 1.5;">Click here to edit and start typing your custom terms, clauses, or additional specifications...</p></div>`
            }
        ]);
    };

    const removePage = (index) => {
        if (pages.length <= 1) return;
        if (window.confirm(`Are you sure you want to delete Page ${index + 1}/${pages.length}?`)) {
            setPages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const getCurrentPageContents = () => {
        const currentPages = {};
        pages.forEach((page, idx) => {
            const ref = pageRefs.current[idx];
            if (ref) {
                currentPages[idx + 1] = ref.innerHTML;
            } else {
                currentPages[idx + 1] = page.html;
            }
        });
        return currentPages;
    };

    // Quick direct save for already saved document
    const handleQuickSave = async () => {
        if (!savedId) {
            setIsSaveModalOpen(true);
            return;
        }

        setIsSavingDirect(true);
        const currentPages = getCurrentPageContents();

        try {
            await updateSavedDocument(savedId, {
                tenderId: parseInt(id),
                name: currentSavedDoc?.name || saveName || "Tender Document",
                pages: currentPages,
            });
            setIsSavingDirect(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (err) {
            console.error("Save error:", err);
            setIsSavingDirect(false);
            alert("Failed to save changes. Please try again.");
        }
    };

    // Save as new version
    const handleSaveNewClick = () => {
        setSaveStatus(null);
        setIsSaveModalOpen(true);
    };

    const confirmSaveNew = async (e) => {
        e.preventDefault();
        if (!saveName.trim()) return;

        setSaveStatus('saving');
        const currentPages = getCurrentPageContents();

        try {
            const newDoc = await saveDocument({
                tenderId: parseInt(id),
                name: saveName,
                pages: currentPages,
                extraPages: [],
            });
            setSaveStatus('saved');
            setCurrentSavedDoc(newDoc);
            setSearchParams({ savedId: newDoc.id });
            setTimeout(() => {
                setIsSaveModalOpen(false);
                setSaveStatus(null);
            }, 1200);
        } catch (err) {
            console.error("Error saving:", err);
            setSaveStatus('error');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading document...</p>
            </div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-600 font-medium">{error}</div>;
    if (!data) return <div className="p-8 text-center">No data found.</div>;

    const totalPages = pages.length;

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center gap-8 doc-font">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
                .doc-font { font-family: 'Montserrat', sans-serif; }
                .a4-page { background-color: white; width: 210mm; min-height: 297mm; padding: 10mm; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); box-sizing: border-box; position: relative; margin: 0 auto; border-radius: 2px; }
                .border-outer { border: 1px solid #006400; height: 100%; min-height: calc(297mm - 20mm); padding: 1px; box-sizing: border-box; }
                .border-middle { border: 3px solid #006400; height: 100%; min-height: calc(297mm - 20mm - 4px); padding: 1px; box-sizing: border-box; }
                .border-inner { border: 1px solid #006400; min-height: calc(297mm - 20mm - 12px); padding: 28px; box-sizing: border-box; position: relative; display: flex; flex-direction: column; }
                .page-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 480px; max-width: 80%; opacity: 0.08; pointer-events: none; user-select: none; z-index: 1; display: flex; align-items: center; justify-content: center; }
                .page-watermark img { width: 100%; height: auto; object-fit: contain; }
                .page-content { flex-grow: 1; font-size: 11pt; line-height: 1.5; color: #000; cursor: text; position: relative; z-index: 2; }
                .page-content:focus { outline: none; background-color: rgba(59, 130, 246, 0.02); }
                .page-content table { border-collapse: collapse; width: 100%; }
                .page-content td, .page-content th { border: 1px solid black; padding: 6px 10px; vertical-align: top; }
                .page-content th { background-color: #f0f0f0; font-weight: 700; text-align: left; }
                .page-footer { text-align: right; font-size: 10pt; font-weight: 700; color: #000; padding-top: 12px; margin-top: auto; letter-spacing: 0.5px; position: relative; z-index: 2; }
                .page-controls { position: absolute; top: -14px; right: 12px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; z-index: 10; }
                .page-wrapper:hover .page-controls { opacity: 1; }
                .page-controls button { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 4px; }
            `}</style>

            {/* Clean Editor Toolbar: Only Save/Edit and Add Page */}
            <div className="flex items-center gap-3 sticky top-4 z-50 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-xl border border-slate-200">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {savedId ? (
                    <>
                        <button
                            onClick={handleQuickSave}
                            disabled={isSavingDirect}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                        >
                            {isSavingDirect ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Save Changes
                        </button>
                        <button
                            onClick={handleSaveNewClick}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            Save as New Version
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleSaveNewClick}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save size={16} /> Save Version
                    </button>
                )}

                <button
                    onClick={addNewPage}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={16} /> Add Page
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {/* Page Indicator */}
                <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-600">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                    </span>
                    {saveStatus === 'saved' && (
                        <span className="text-emerald-600 flex items-center gap-1 text-xs font-semibold animate-in fade-in">
                            <Check size={14} /> Saved
                        </span>
                    )}
                </div>
            </div>

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md font-sans">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Save className="w-5 h-5 text-blue-600" /> Save Document Version
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Enter a descriptive name for this document version to easily recognize it in your saved versions list.
                        </p>
                        {saveStatus === 'saved' ? (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check size={24} />
                                </div>
                                <p className="text-emerald-700 font-semibold">Saved successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={confirmSaveNew}>
                                <input
                                    type="text"
                                    autoFocus
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder="e.g. Draft v1, Final Submission..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    required
                                />
                                {saveStatus === 'error' && (
                                    <p className="text-red-600 text-sm mb-3">Failed to save. Please try again.</p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsSaveModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saveStatus === 'saving'}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {saveStatus === 'saving' && <RefreshCw size={16} className="animate-spin" />}
                                        Save Version
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Document Pages (Directly editable A4 pages with page number 22/33) */}
            {pages.map((page, index) => (
                <div key={page.id} className="page-wrapper relative">
                    {/* Delete page button (visible on hover) */}
                    {pages.length > 1 && (
                        <div className="page-controls">
                            <button
                                onClick={() => removePage(index)}
                                style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                                title="Delete this page"
                            >
                                <Trash2 size={12} /> Delete Page
                            </button>
                        </div>
                    )}
                    <PageLayout
                        pageNumber={index + 1}
                        totalPages={totalPages}
                        contentRef={el => pageRefs.current[index] = el}
                        isFirst={index === 0}
                    >
                        <div dangerouslySetInnerHTML={{ __html: page.html }} />
                    </PageLayout>
                </div>
            ))}

            {/* Add New Page Button at bottom */}
            <div className="pb-12">
                <button
                    onClick={addNewPage}
                    className="flex items-center gap-2 bg-white text-slate-700 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3.5 rounded-2xl transition-all font-sans text-sm font-semibold hover:shadow-lg shadow-sm"
                >
                    <Plus size={18} /> Add New Page
                </button>
            </div>
        </div>
    );
};

export default TenderPreview;
