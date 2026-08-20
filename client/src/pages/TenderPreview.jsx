import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Check, RefreshCw, Paperclip, Download, FileDown, Package, FileText, Edit3 } from 'lucide-react';
import {
    fetchTender,
    fetchDashboardData,
    fetchAnnexures,
    fetchSavedDocument,
    saveDocument,
    updateSavedDocument,
    API_URL
} from '../services/api';

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
                        Page {pageNumber} of {totalPages}
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
    const [annexures, setAnnexures] = useState([]);
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
                const allAnnexures = await fetchAnnexures();

                const selectedTermIds = (tender.selectedTermIds || []).map(id => Number(id));
                const selectedTerms = allTerms.filter(term => selectedTermIds.includes(Number(term.id)));

                setTerms(selectedTerms);
                setCategories(allCategories);
                setAnnexures(allAnnexures || []);
                setData(tender);

                // If loading a saved document, use its saved pages unless legacy format is detected
                if (savedId) {
                    try {
                        const savedDoc = await fetchSavedDocument(savedId);
                        if (savedDoc && savedDoc.pages && typeof savedDoc.pages === 'object' && Object.keys(savedDoc.pages).length > 0) {
                            setCurrentSavedDoc(savedDoc);
                            setSaveName(savedDoc.name || `Version ${savedDoc.id}`);
                            const pageValues = Object.values(savedDoc.pages).join(" ");
                            const hasOldFormat = pageValues.includes("Annexure-A") || pageValues.includes("Annexure – ‘A’") || !pageValues.includes("Annexure-I");

                            if (hasOldFormat) {
                                console.log("Detected legacy annexure layout in saved document. Auto-upgrading to compliant Annexure-I layout...");
                                const generatedPages = generatePages(tender, selectedTerms, allCategories, allAnnexures);
                                setPages(generatedPages);
                            } else {
                                const loadedPages = Object.keys(savedDoc.pages)
                                    .sort((a, b) => parseInt(a) - parseInt(b))
                                    .map(key => ({ id: key, html: savedDoc.pages[key] }));
                                setPages(loadedPages);
                            }
                        } else {
                            const generatedPages = generatePages(tender, selectedTerms, allCategories, allAnnexures);
                            setPages(generatedPages);
                            setSaveName(`${tender.tenderName || "Tender"} - Draft`);
                        }
                    } catch (docErr) {
                        console.warn("Failed to load saved doc version, falling back to generated pages:", docErr);
                        const generatedPages = generatePages(tender, selectedTerms, allCategories, allAnnexures);
                        setPages(generatedPages);
                        setSaveName(`${tender.tenderName || "Tender"} - Draft`);
                    }
                } else {
                    // Generate fresh pages from tender data
                    const generatedPages = generatePages(tender, selectedTerms, allCategories, allAnnexures);
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
    const generatePages = (tender, selectedTerms, allCategories, allAnnexures = []) => {
        const variables = tender.variables || {};
        const isLimited = tender.documentType === "Limited Tender Document" || tender.tenderType === "limited";
        const isETender = tender.documentType === "e-tender Document" || tender.tenderType === "etender";

        const formatDate = (d) => {
            if (!d) return "__/__/2026";
            const date = new Date(d);
            return isNaN(date.getTime()) ? "__/__/2026" : date.toLocaleDateString("en-IN");
        };

        const estCostFormatted = tender.estimatedCost ? Number(tender.estimatedCost).toLocaleString("en-IN") : "2,29,000";
        const estCostWords = tender.estimatedCostWords || "Rupees Two Lakh Twenty-Nine Thousand only";
        const emdFormatted = tender.emdAmount ? Number(tender.emdAmount).toLocaleString("en-IN") : (tender.emdRequired || "5,000");
        const emdWords = tender.emdAmountWords || "Rupees Five Thousand Only";
        const pbgFormatted = tender.pbgAmount ? Number(tender.pbgAmount).toLocaleString("en-IN") : (tender.pbgRequired || "10,000");
        const pbgWords = tender.pbgAmountWords || "Rupees Ten Thousand Only";

        const items = (tender.itemsList && Array.isArray(tender.itemsList)) ? tender.itemsList.filter(it => it.name && it.name.trim()) : [];

        // Items Table HTML for Financial Bid Annexure
        const itemsRowsHtml = items.length > 0 ? items.map((item, idx) => `
            <tr>
                <td style="border: 1px solid black; padding: 5px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid black; padding: 5px 8px; font-weight: 600;">${item.name || ""}</td>
                <td style="border: 1px solid black; padding: 5px 8px;">${item.specs || ""}</td>
                <td style="border: 1px solid black; padding: 5px 8px; text-align: center; font-weight: 700;">${item.quantity || "1"}</td>
                <td style="border: 1px solid black; padding: 5px 8px;"></td>
                <td style="border: 1px solid black; padding: 5px 8px;"></td>
                <td style="border: 1px solid black; padding: 5px 8px;"></td>
            </tr>
        `).join("") : `
            <tr>
                <td style="border: 1px solid black; padding: 8px; text-align: center;">1.</td>
                <td style="border: 1px solid black; padding: 8px; font-style: italic; color: #555;">As per Detailed Technical Specifications / Scope of Work</td>
                <td style="border: 1px solid black; padding: 8px; font-style: italic; color: #555;">Conforming to required specifications</td>
                <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: 700;">${tender.itemQuantity || "1 Lot"}</td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
            </tr>
        `;

        const generatedItemsTable = `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;">
                <thead>
                    <tr>
                        <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 6%; text-align: center;">Sr. No.</th>
                        <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; width: 22%;">Name of Articles</th>
                        <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; width: 30%;">Specification / Dimensions</th>
                        <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 10%; text-align: center;">Total Qty</th>
                        <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 12%; text-align: center;">Base Rate per Unit (Excl. Tax)</th>
                        <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 8%; text-align: center;">GST (%)</th>
                        <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 12%; text-align: center;">Total Amount (Incl. all Taxes)</th>
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
        `;

        const replaceVars = (text) => {
            if (!text) return text;
            let result = text;

            const map = {
                tenderName: tender.tenderName || "Procurement of Goods",
                tender_name: tender.tenderName || "Procurement of Goods",
                tenderNo: tender.tenderNo || "1-13/2009-HPU",
                tender_no: tender.tenderNo || "1-13/2009-HPU",
                departmentName: tender.departmentName || "Store Purchase Office",
                department_name: tender.departmentName || "Store Purchase Office",
                departmentEmail: tender.departmentEmail || "spo@hpuniv.ac.in",
                department_email: tender.departmentEmail || "spo@hpuniv.ac.in",
                tenderInvitingAuthority: tender.tenderInvitingAuthority || tender.variables?.tenderInvitingAuthority || "Store Purchase Officer",
                tender_inviting_authority: tender.tenderInvitingAuthority || tender.variables?.tenderInvitingAuthority || "Store Purchase Officer",
                estimatedCost: estCostFormatted,
                estimated_cost: estCostFormatted,
                estimatedCostWords: estCostWords,
                estimated_cost_words: estCostWords,
                emdAmount: emdFormatted,
                emd_amount: emdFormatted,
                emdAmountWords: emdWords,
                emd_amount_words: emdWords,
                pbgAmount: pbgFormatted,
                pbg_amount: pbgFormatted,
                pbgAmountWords: pbgWords,
                pbg_amount_words: pbgWords,
                emdPledgeOfficer: tender.emdPledgeOfficer || tender.variables?.emdPledgeOfficer || "Finance Officer, H.P. University, Shimla-05",
                emd_pledge_officer: tender.emdPledgeOfficer || tender.variables?.emdPledgeOfficer || "Finance Officer, H.P. University, Shimla-05",
                bidValidity: tender.bidValidity || "90",
                bid_validity: tender.bidValidity || "90",
                bid_validity_days: tender.bidValidity ? `${tender.bidValidity} days` : "90 days",
                deliveryDays: tender.deliveryDays || "15",
                delivery_days: tender.deliveryDays || "15",
                procurementLocations: tender.procurementLocations || "University Campus, Summer Hill, Shimla-171005",
                procurement_locations: tender.procurementLocations || "University Campus, Summer Hill, Shimla-171005",
                delivery_location: tender.variables?.delivery_location || tender.procurementLocations || "University Campus, Summer Hill, Shimla-171005",
                courtJurisdiction: tender.courtJurisdiction || "Shimla Urban",
                court_jurisdiction: tender.courtJurisdiction || "Shimla Urban",
                scope_of_work: tender.variables?.scope_of_work || tender.tenderName || "Purchase of Goods/Equipment",
                stamp_paper_value: tender.variables?.stamp_paper_value || "50",
                contract_signing_days: tender.variables?.contract_signing_days || "15",
                pbg_submission_days: tender.variables?.pbg_submission_days || "15",
                pbg_validity_period: tender.variables?.pbg_validity_period || "14",
                pbg_percentage: tender.variables?.pbg_percentage || "5",
                penalty_rate: tender.variables?.penalty_rate || "0.5",
                max_penalty: tender.variables?.max_penalty || "10",
                max_delay_weeks: tender.variables?.max_delay_weeks || "10",
                warranty_years: tender.variables?.warranty_years || (tender.warrantyDurable ? tender.warrantyDurable : "1"),
                warranty_durable: tender.warrantyDurable || "12 months",
                warranty_consumable: tender.warrantyConsumable || "6 months",
                experience_years: tender.variables?.experience_years || "3",
                financial_years: tender.variables?.financial_years || "last 3 financial years",
                past_performance_percentage: tender.variables?.past_performance_percentage || "50",
                min_turnover: tender.variables?.min_turnover || "Rs. 10 Lakh",
                submission_officer: tender.variables?.submission_officer || tender.tenderInvitingAuthority || "Store Purchase Officer",
                department_address: tender.variables?.department_address || `${tender.departmentName || "Store Purchase Office"}, H.P. University, Summer Hill, Shimla-171005`,
                emd_submission_days: tender.variables?.emd_submission_days || "5",
                portal_name: tender.variables?.portal_name || (isLimited ? "hpuniv.ac.in" : isETender ? "hptenders.gov.in" : "GeM Portal (gem.gov.in)"),
                tender_fee: tender.variables?.tender_fee || tender.tenderFee || "1,000",
                tender_fee_words: tender.variables?.tender_fee_words || "Rupees One Thousand Only",
                arbitrator_authority: tender.variables?.arbitrator_authority || "Vice-Chancellor, H.P. University, Shimla",
                publishDate: formatDate(tender.publishDate),
                bidEndDate: formatDate(tender.bidEndDate),
                techEvalDate: formatDate(tender.techEvalDate),
                itemsTable: generatedItemsTable,
                items_table: generatedItemsTable,
                ...(tender.variables || {}),
                ...(variables || {}),
            };

            const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            Object.keys(map).forEach(key => {
                const val = map[key];
                if (val !== undefined && val !== null && String(val).trim() !== "") {
                    const escaped = escapeRegExp(key);
                    const regex = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, 'gi');
                    result = result.replace(regex, String(val));
                }
            });
            // Ensure no legacy Annexure-A remains in rendered text
            result = result.replace(/Annexure\s*[-–—]?\s*[‘'"]?A[’'"]?/gi, "Annexure-II");
            return result;
        };

        // Helper function to build cleanly paginated Terms and Conditions pages
        // Populates continuously across sections on the same page, breaking to a new page ONLY when the page is full till the bottom
        const buildTermsPages = (termsList, catsList, startSecNum = 1, prefix = "SECTION") => {
            if (!termsList || termsList.length === 0) return [];

            // Group terms by categoryId (converting categoryId to number for reliable matching)
            const grouped = {};
            termsList.forEach(term => {
                const catId = Number(term.categoryId) || 1;
                if (!grouped[catId]) grouped[catId] = [];
                grouped[catId].push(term);
            });

            // Sort categories by their defined order/id
            const sortedCats = [...(catsList || [])].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

            const pgs = [];
            let currentHtml = "";
            let currentLines = 0;
            const MAX_PAGE_LINES = 47; // Calibrated for full A4 height (~1035px inner printable area at 10.5pt font)

            const flush = () => {
                if (currentHtml.trim()) {
                    pgs.push(currentHtml);
                    currentHtml = "";
                    currentLines = 0;
                }
            };

            // Estimate lines of text for a string given average line length of ~95 chars at 10.5pt
            const estimateLines = (text) => {
                if (!text) return 1;
                const cleanText = text.replace(/<[^>]*>/g, '').trim();
                return Math.max(1, Math.ceil(cleanText.length / 95));
            };

            let secIndex = startSecNum;

            sortedCats.forEach((cat) => {
                const catTerms = grouped[Number(cat.id)];
                if (!catTerms || catTerms.length === 0) return;

                const headerText = `${prefix} ${secIndex}: ${cat.name.toUpperCase()}`;
                const headerLines = 1.8; // Header text + margin + border-bottom

                // If adding header at the bottom with < 2 lines left, push header to next page
                if (currentLines > 0 && currentLines + headerLines + 2 > MAX_PAGE_LINES) {
                    flush();
                }

                const headerHtml = `<h4 style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; margin-top: ${currentLines > 0 ? '14px' : '0px'}; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; color: #0f172a; letter-spacing: 0.3px;">${headerText}</h4>`;
                
                currentHtml += headerHtml;
                currentLines += headerLines;

                catTerms.forEach((term, termIndex) => {
                    const desc = replaceVars(term.description);
                    const titleText = `${secIndex}.${termIndex + 1} ${term.title}:`;
                    const fullClauseText = `${titleText} ${desc}`;
                    const termLines = estimateLines(fullClauseText) + 0.3; // Text lines + compact margin-bottom

                    // If adding this term would overflow the current page, start a new page seamlessly
                    if (currentLines + termLines > MAX_PAGE_LINES) {
                        flush();
                    }

                    const termHtml = `
                        <div style="margin-bottom: 8px; padding-left: 2px; text-align: justify; line-height: 1.45; font-size: 10.5pt; color: #000;">
                            <p style="margin-bottom: 2px;"><strong>${titleText}</strong> <span style="font-weight: normal;">${desc}</span></p>
                        </div>
                    `;

                    currentHtml += termHtml;
                    currentLines += termLines;
                });

                secIndex++;
            });

            flush();
            return pgs;
        };

        const generatedPages = [];

        // -------------------------------------------------------------
        // FORMAT 1: LIMITED TENDER DOCUMENT (Sports / Local Procurement)
        // -------------------------------------------------------------
        if (isLimited) {
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
                        <p style="margin-bottom: 6px;"><strong>Cover 1: Technical Bid.</strong> This cover shall contain all supporting documents pertaining to the technical specifications, EMD, eligibility criteria, and the duly filled & signed Mandatory Compliance Sheet given at <strong>Annexure-I</strong>. The cover shall be clearly superscribed with the words <strong>"Technical Bid"</strong>.</p>
                        <p style="margin-bottom: 6px;"><strong>Cover 2: Financial Bid.</strong> This cover shall contain the bidder's price quotation in the prescribed format given at <strong>Annexure-II</strong> (Financial Bid Submission Form & Items Schedule Table). The cover shall be clearly superscribed with the words <strong>"Financial Bid"</strong>.</p>
                    </div>
                    <p style="text-align: justify; margin-bottom: 6px;">Both Cover 1 and Cover 2 shall be placed in a larger, sealed outer envelope. The outer envelope shall be superscribed as:</p>
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #004821; padding: 8px 14px; margin-bottom: 8px;">
                        <p style="font-weight: bold; font-size: 11pt; color: #000;">"Tender for Procurement of ${tender.tenderName || 'Sports Items'} – ${tender.tenderNo || '1-13/2009-HPU (CW)'}"</p>
                        <p style="font-size: 10.5pt; color: #334155; margin-top: 3px;"><strong>Addressed to:</strong> The ${tender.tenderInvitingAuthority || "Store Purchase Officer"}, Himachal Pradesh University, Summer Hill, Shimla 171005.</p>
                    </div>
                </div>
            `;

            // Page 2: Instructions to Bidders, Additional Terms & Conditions
            const page2 = `
                <div style="font-size: 11pt; line-height: 1.5; color: #000; text-align: justify;">
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; text-decoration: underline;">Instructions to Bidders</h3>
                    <p style="margin-bottom: 8px;"><strong>1. Earnest Money Deposit (EMD):</strong> ₹ ${emdFormatted}/- (${emdWords}) in the form of Duly Pledged Fixed Deposit Receipt/Demand Draft or Bank Guarantee from a nationalized bank, drawn in favour of the "<strong>${tender.emdPledgeOfficer || "Finance Officer, H.P. University, Shimla-05"}</strong>" payable at Shimla.</p>
                    <p style="margin-bottom: 8px;"><strong>2. Submission Deadline:</strong> Quotations must reach this office on or before <strong>${formatDate(tender.bidEndDate)} till ${tender.bidEndTime || "5:00 P.M."}</strong>.</p>
                    <p style="margin-bottom: 14px;"><strong>3. Bid Opening:</strong> The technical bids will be opened on <strong>${formatDate(tender.techEvalDate)} at ${tender.techEvalTime || "11:30 A.M."}</strong> in the <strong>${tender.openingVenue || "Store Purchase Office"}</strong> and will be evaluated by the committee concerned.</p>
                    
                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; margin-top: 14px; text-decoration: underline;">General Bid Conditions</h3>
                    <p style="margin-bottom: 8px;"><strong>4. Rate Specification:</strong> All rates must be inclusive of applicable taxes (GST), duties, levies, and quoted F.O.R. destination (${tender.procurementLocations || "Hostel Premises / University Campus"}).</p>
                    <p style="margin-bottom: 8px;"><strong>5. Bid Security (EMD):</strong> Bids submitted without the required EMD will be rejected.</p>
                    <p style="margin-bottom: 8px;"><strong>6. Performance Bank Guarantee (PBG):</strong> The successful bidder must submit a Performance Bank Guarantee of ₹ ${pbgFormatted}/- (${pbgWords}) 15 days prior to the issuance of the award letter.</p>
                    <p style="margin-bottom: 8px;"><strong>7. Completion Time:</strong> The successful bidder must complete the supply within <strong>${tender.deliveryDays || 15} days</strong> after issuance of the supply order.</p>
                    <p style="margin-bottom: 8px;"><strong>8. Statutory Documents:</strong> The bidder must attach self-attested valid copies of the PAN Card and GST Registration Certificate along with the Technical Bid.</p>
                    <p style="margin-bottom: 8px;"><strong>9. Non-Blacklisting Declaration:</strong> The bidder must submit an affidavit on a Non-Judicial Stamp Paper of ₹ 50/- duly attested by a Notary Public declaring that the firm has not been blacklisted or banned.</p>
                    <p style="margin-bottom: 8px;"><strong>10. Warranty:</strong> For durable items: <strong>${tender.warrantyDurable || "12 months"}</strong>; for consumable items: <strong>${tender.warrantyConsumable || "6 months"}</strong> from final acceptance.</p>
                    <p style="margin-bottom: 8px;"><strong>11. Jurisdiction:</strong> All disputes shall be subject to the exclusive jurisdiction of the courts in ${tender.courtJurisdiction || "Shimla Urban"}.</p>
                    <p style="margin-bottom: 16px;"><strong>12. Validity:</strong> Rates approved will remain valid for ${tender.bidValidity || 90} days.</p>
                    
                    <div style="margin-top: 24px; text-align: right;">
                        <p style="margin-bottom: 30px;">Yours faithfully,</p>
                        <p style="font-weight: bold; margin-bottom: 2px;">${tender.tenderInvitingAuthority || "Store Purchase Officer"}</p>
                        <p>Himachal Pradesh University, Shimla-5.</p>
                    </div>
                </div>
            `;

            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page1 });
            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page2 });

            // Generate Terms pages for Limited Tender if terms are selected
            if (selectedTerms && selectedTerms.length > 0) {
                const termsPages = buildTermsPages(selectedTerms, allCategories, 1, "SECTION");
                termsPages.forEach(p => {
                    generatedPages.push({ id: `${generatedPages.length + 1}`, html: p });
                });
            }
        }

        // -------------------------------------------------------------
        // FORMAT 2: GeM ATC DOCUMENT
        // -------------------------------------------------------------
        else if (!isETender) {
            // Page 1: Cover Page
            const page1 = `
                <div style="height: 100%; display: flex; flex-direction: column; padding-top: 40px; text-align: center;">
                    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">Himachal Pradesh University,</h2>
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">(NAAC Accredited 'A' Grade University)</h3>
                    <h3 style="font-size: 16px; font-weight: bold;">"${tender.departmentName || 'Department of Physics'}"</h3>
                    <div style="margin: 24px auto; text-align: center;">
                        <img src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg" alt="HPU Logo" style="height: 130px; width: auto;" />
                    </div>
                    <h1 style="font-size: 20px; font-weight: bold; margin: 16px 20px;">
                        Bid Document for Procurement of<br/>
                        <span style="font-size: 17px; font-weight: bold; color: #1e3a8a; display: block; margin-top: 6px;">${tender.tenderName || 'Equipment / System'}</span>
                        <br/>on GeM Portal for<br/>
                        <span style="font-size: 17px; font-weight: normal; display: block; margin-top: 6px;">${tender.departmentName || 'Science Central Workshop, Department of Physics'}, Himachal Pradesh University, Shimla-171005</span>
                    </h1>
                    <div style="margin-top: 24px; font-size: 14px;">
                        <p style="margin-bottom: 6px;"><strong>Website:</strong> <a href="https://www.hpuniv.ac.in" style="color: #1e3a8a; text-decoration: underline;">https://www.hpuniv.ac.in</a></p>
                        <p><strong>E-mail:</strong> ${tender.departmentEmail || 'physicshpu@gmail.com'}</p>
                    </div>
                </div>
            `;

            // Page 2: Summary Table + Section 1
            const page2 = `
                <div>
                    <h3 style="font-size: 16px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 12px; text-align: center;">SUMMARY</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 8%;">Sr. No.</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 32%;">Description</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 60%;">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">1.</td><td style="border: 1px solid black; padding: 6px 8px;">Item Description</td><td style="border: 1px solid black; padding: 6px 8px;"><strong>${tender.tenderName || 'Equipment / System'}</strong></td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">2.</td><td style="border: 1px solid black; padding: 6px 8px;">Quantity</td><td style="border: 1px solid black; padding: 6px 8px;">${tender.itemQuantity || '1 Unit'}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">3.</td><td style="border: 1px solid black; padding: 6px 8px;">Department</td><td style="border: 1px solid black; padding: 6px 8px;">${tender.departmentName || 'Department of Physics'}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">4.</td><td style="border: 1px solid black; padding: 6px 8px;">Bid Start Date & Time</td><td style="border: 1px solid black; padding: 6px 8px;">[as mentioned in GeM Bid Document]</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">5.</td><td style="border: 1px solid black; padding: 6px 8px;">Bid End Date & Time</td><td style="border: 1px solid black; padding: 6px 8px;">${formatDate(tender.bidEndDate)} till ${tender.bidEndTime || '5:00 P.M.'}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">6.</td><td style="border: 1px solid black; padding: 6px 8px;">Pre-Bid Meeting</td><td style="border: 1px solid black; padding: 6px 8px;">${tender.isPreBidRequired === 'yes' ? formatDate(tender.preBidDate) : 'Not Applicable'}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">7.</td><td style="border: 1px solid black; padding: 6px 8px;">Earnest Money Deposit (EMD)</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${emdFormatted}/- (${emdWords})</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">8.</td><td style="border: 1px solid black; padding: 6px 8px;">Performance Security (PBG)</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${pbgFormatted}/- (${pbgWords})</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">9.</td><td style="border: 1px solid black; padding: 6px 8px;">Pledge of EMD / PBG</td><td style="border: 1px solid black; padding: 6px 8px;">In favour of: <strong>${tender.emdPledgeOfficer || 'Finance Officer, H.P. University, Shimla-05'}</strong></td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">10.</td><td style="border: 1px solid black; padding: 6px 8px;">Bid Validity</td><td style="border: 1px solid black; padding: 6px 8px;">${tender.bidValidity || '90'} days from date of publication</td></tr>
                        </tbody>
                    </table>
                    <p style="font-weight: bold; font-size: 9.5pt; border: 1px solid #cbd5e1; padding: 7px; background-color: #f8fafc; margin-bottom: 14px;"><strong>Note:</strong> The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.</p>
                    <div>
                        <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 10px; text-align: center;">SECTION I: INSTRUCTIONS FOR BIDDERS</h3>
                        <div style="text-align: justify; font-size: 10.5pt; line-height: 1.5;">
                            <p style="margin-bottom: 8px;"><strong>1.1 Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal before the specified deadline. Physical bids will not be accepted.</p>
                            <p style="margin-bottom: 8px;"><strong>1.2 Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document.</p>
                            <p><strong>1.3 Digital Signature:</strong> Bids must be digitally signed by an authorized representative using a valid Class-II or Class-III Digital Signature Certificate (DSC).</p>
                        </div>
                    </div>
                </div>
            `;

            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page1 });
            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page2 });

            // Generate Terms pages for GeM ATC
            if (selectedTerms && selectedTerms.length > 0) {
                const termsPages = buildTermsPages(selectedTerms, allCategories, 2, "SECTION");
                termsPages.forEach(p => {
                    generatedPages.push({ id: `${generatedPages.length + 1}`, html: p });
                });
            }
        }

        // -------------------------------------------------------------
        // FORMAT 3: e-TENDER DOCUMENT (State/Central e-Procurement Portal)
        // -------------------------------------------------------------
        else {
            // Page 1: e-Tender Cover Page
            const page1 = `
                <div style="height: 100%; display: flex; flex-direction: column; padding-top: 40px; text-align: center;">
                    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">Himachal Pradesh University,</h2>
                    <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">(NAAC Accredited 'A' Grade University)</h3>
                    <h3 style="font-size: 16px; font-weight: bold;">“${tender.departmentName || 'CDOE, H.P.U.'}”</h3>
                    <div style="margin: 26px auto; text-align: center;">
                        <img src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg" alt="HPU Logo" style="height: 130px; width: auto;" />
                    </div>
                    <h1 style="font-size: 20px; font-weight: bold; margin: 18px 20px; text-transform: uppercase;">
                        TENDER DOCUMENT FOR<br/>
                        <span style="font-size: 17px; font-weight: bold; color: #1e3a8a; display: block; margin-top: 6px;">${tender.tenderName || 'PRINTING AND SUPPLY OF SELF LEARNING MATERIAL (SLM)'}</span>
                    </h1>
                    <div style="margin-top: 24px; font-size: 14px;">
                        <p style="margin-bottom: 6px;"><strong>Tender Reference No:</strong> ${tender.tenderNo || 'HPU/CDOE/2026/01'}</p>
                        <p style="margin-bottom: 6px;"><strong>Portal:</strong> <a href="https://hptenders.gov.in" style="color: #1e3a8a; text-decoration: underline;">https://hptenders.gov.in</a></p>
                        <p><strong>E-mail:</strong> ${tender.departmentEmail || 'director.cdoe@hpuniv.ac.in'}</p>
                    </div>
                </div>
            `;

            // Page 2: Schedule of Requirements & Critical Date Sheet
            const page2 = `
                <div>
                    <h3 style="font-size: 15px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 12px; text-align: center;">SCHEDULE OF REQUIREMENTS & CRITICAL DATES</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 8%;">Sr.</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 34%;">Description</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 58%;">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">1.</td><td style="border: 1px solid black; padding: 6px 8px;">Scope of Work</td><td style="border: 1px solid black; padding: 6px 8px;"><strong>${tender.tenderName || 'Printing and Supply Work'}</strong></td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">2.</td><td style="border: 1px solid black; padding: 6px 8px;">Estimated Value</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${estCostFormatted}/- (${estCostWords})</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">3.</td><td style="border: 1px solid black; padding: 6px 8px;">Tender Document Fee</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${tender.tenderFee || '1,000'}/- (Non-refundable)</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">4.</td><td style="border: 1px solid black; padding: 6px 8px;">Earnest Money Deposit (EMD)</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${emdFormatted}/- (${emdWords})</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">5.</td><td style="border: 1px solid black; padding: 6px 8px;">Performance Security (PBG)</td><td style="border: 1px solid black; padding: 6px 8px;">₹ ${pbgFormatted}/- (${pbgWords})</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">6.</td><td style="border: 1px solid black; padding: 6px 8px;">Publish / Notice Date</td><td style="border: 1px solid black; padding: 6px 8px;">${formatDate(tender.publishDate)}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">7.</td><td style="border: 1px solid black; padding: 6px 8px;">Bid Submission Deadline</td><td style="border: 1px solid black; padding: 6px 8px;">${formatDate(tender.bidEndDate)} till ${tender.bidEndTime || '5:00 P.M.'}</td></tr>
                            <tr><td style="border: 1px solid black; padding: 6px 8px;">8.</td><td style="border: 1px solid black; padding: 6px 8px;">Technical Bid Opening Date</td><td style="border: 1px solid black; padding: 6px 8px;">${formatDate(tender.techEvalDate)} at ${tender.techEvalTime || '11:30 A.M.'}</td></tr>
                        </tbody>
                    </table>

                    <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 10px; margin-top: 14px; text-align: center;">SECTION 1: INSTRUCTIONS TO BIDDERS</h3>
                    <div style="text-align: justify; font-size: 10.5pt; line-height: 1.5;">
                        <p style="margin-bottom: 8px;"><strong>1.1 Online Submission:</strong> Bids must be submitted online on the e-Procurement Portal (hptenders.gov.in). The tender shall be processed in Two-Cover System: Cover-1 (Technical Bid & Fee) and Cover-2 (Financial BOQ).</p>
                        <p style="margin-bottom: 8px;"><strong>1.2 Digital Signatures:</strong> Bidders must possess valid Class-III DSC to upload bids and technical schedules.</p>
                        <p><strong>1.3 Validity:</strong> Bids shall remain valid for a period of ${tender.bidValidity || 90} days from the date of technical bid opening.</p>
                    </div>
                </div>
            `;

            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page1 });
            generatedPages.push({ id: `${generatedPages.length + 1}`, html: page2 });

            // Generate Terms pages for e-Tender
            if (selectedTerms && selectedTerms.length > 0) {
                const termsPages = buildTermsPages(selectedTerms, allCategories, 2, "SECTION");
                termsPages.forEach(p => {
                    generatedPages.push({ id: `${generatedPages.length + 1}`, html: p });
                });
            }
        }

        // -------------------------------------------------------------
        // DYNAMIC ANNEXURES RENDERING (MANDATORY ANNEXURE-I COMPLIANCE SHEET + SEQUENTIAL ANNEXURES)
        // -------------------------------------------------------------
        if (tender.isAnnexureRequired !== false) {
            const ROMAN_NUMS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
            const toRoman = (num) => {
                if (num <= ROMAN_NUMS.length) return ROMAN_NUMS[num - 1];
                const lookup = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };
                let roman = '';
                for (let i in lookup) {
                    while (num >= lookup[i]) {
                        roman += i;
                        num -= lookup[i];
                    }
                }
                return roman || `${num}`;
            };

            const selectedAnnexIds = new Set((tender.selectedAnnexureIds || []).map(aId => String(aId)));
            // Ensure any annexures linked to selected terms are also included
            (selectedTerms || []).forEach(term => {
                if (term.hasAnnexure && term.annexureId) {
                    selectedAnnexIds.add(String(term.annexureId));
                }
                if (term.linkedAnnexureId) {
                    selectedAnnexIds.add(String(term.linkedAnnexureId));
                }
            });

            const selectedAnnexList = allAnnexures.filter(a => selectedAnnexIds.has(String(a.id)));

            // Filter out only duplicate templates of the eligibility fact sheet itself so Annexure-I is not duplicated
            let otherAnnexures = selectedAnnexList.filter(a =>
                !a.title.toLowerCase().includes("eligibility fact sheet") &&
                !a.title.toLowerCase().includes("compliance sheet of eligibility") &&
                a.code !== "ANNEX_COMPLIANCE_FACT"
            );

            // For Limited Tender, ensure Financial Bid Submission Form (code: "ANNEX_FIN_BID" or ID: 1) is always placed first in otherAnnexures so it is assigned Annexure-II
            if (isLimited) {
                otherAnnexures.sort((a, b) => {
                    const aIsFin = a.code === "ANNEX_FIN_BID" || Number(a.id) === 1 || a.category === "financial" || a.title.toLowerCase().includes("financial bid");
                    const bIsFin = b.code === "ANNEX_FIN_BID" || Number(b.id) === 1 || b.category === "financial" || b.title.toLowerCase().includes("financial bid");
                    if (aIsFin && !bIsFin) return -1;
                    if (!aIsFin && bIsFin) return 1;
                    return (Number(a.id) || 0) - (Number(b.id) || 0);
                });
            }

            // 1. Gather all Document Proof items from selected terms
            const docProofItems = [];
            const addedProofs = new Set();

            (selectedTerms || []).forEach(term => {
                if (term.isDocumentRequired && term.documentProofName && !addedProofs.has(term.documentProofName.toLowerCase())) {
                    docProofItems.push(term.documentProofName);
                    addedProofs.add(term.documentProofName.toLowerCase());
                } else {
                    const tLow = (term.title || "").toLowerCase();
                    if ((tLow.includes("pan") || tLow.includes("gst")) && !addedProofs.has("pan_gst")) {
                        docProofItems.push("Valid PAN Card & GST Registration Certificate");
                        addedProofs.add("pan_gst");
                    } else if ((tLow.includes("turnover") || tLow.includes("annual turnover")) && !addedProofs.has("turnover")) {
                        docProofItems.push("Audited Balance Sheets / CA Turnover Certificate with UDIN (Last 3 Years)");
                        addedProofs.add("turnover");
                    } else if ((tLow.includes("experience") || tLow.includes("past performance")) && !addedProofs.has("experience")) {
                        docProofItems.push("Copies of Purchase Orders & Satisfactory Performance Certificates");
                        addedProofs.add("experience");
                    } else if ((tLow.includes("income tax") || tLow.includes("itr")) && !addedProofs.has("itr")) {
                        docProofItems.push("Income Tax Returns (ITR) for Last 3 Financial Years");
                        addedProofs.add("itr");
                    } else if ((tLow.includes("earnest money") || tLow.includes("emd")) && !addedProofs.has("emd")) {
                        docProofItems.push("Original EMD Instrument / Valid MSE Exemption Certificate");
                        addedProofs.add("emd");
                    }
                }
            });

            // If no terms provided document proofs, supply standard baseline requirements
            if (docProofItems.length === 0) {
                docProofItems.push("Tender Fee & EMD Deposit Receipt / MSE Exemption Certificate");
                docProofItems.push("Certificate of Incorporation / Registration of Firm");
                docProofItems.push("Valid PAN Card & GSTIN Registration Certificate");
                docProofItems.push("Audited Balance Sheets / CA Turnover Certificate (Last 3 Years)");
                docProofItems.push("Copies of Purchase Orders & Satisfactory Installation / Performance Reports");
            }

            // 2. Build Compliance Sheet Table Rows (Document Proofs + Sequentially Numbered Annexures)
            let complianceRowIdx = 1;
            let complianceRowsHtml = "";

            // First: Document proofs
            docProofItems.forEach(proof => {
                complianceRowsHtml += `
                    <tr>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;">${complianceRowIdx++}.</td>
                        <td style="border: 1px solid black; padding: 6px 8px;">${proof}</td>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;"></td>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;"></td>
                    </tr>
                `;
            });

            // Second: ALL Dynamic Annexure Rows (Numbered Annexure-II, Annexure-III, Annexure-IV, ...)
            otherAnnexures.forEach((annex, idx) => {
                const assignedRoman = toRoman(idx + 2);
                const cleanTitle = annex.title.replace(/^Annexure\s*[-–—]?\s*[A-Z0-9IVXLCDM]+\s*[:–-]?\s*/i, "").trim();
                complianceRowsHtml += `
                    <tr>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;">${complianceRowIdx++}.</td>
                        <td style="border: 1px solid black; padding: 6px 8px; font-weight: 600;">${cleanTitle} – <span style="text-decoration: underline;">Annexure-${assignedRoman}</span></td>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;"></td>
                        <td style="border: 1px solid black; padding: 6px 8px; text-align: center;"></td>
                    </tr>
                `;
            });

            // 3. Assemble Mandatory Annexure-I (Compliance Sheet) HTML
            const annexureIPageHtml = `
                <div style="font-size: 10.5pt; line-height: 1.5; color: #000; text-align: justify;">
                    <div style="text-align: center; margin-bottom: 14px;">
                        <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin-bottom: 3px;">Annexure-I</h2>
                        <h3 style="font-size: 15px; font-weight: bold; text-transform: uppercase;">COMPLIANCE SHEET OF ELIGIBILITY CRITERIA & MANDATORY SUBMISSIONS</h3>
                        <p style="font-size: 9.5pt; color: #475569; margin-top: 3px;">(To be submitted on Bidder's Official Letterhead duly signed and stamped)</p>
                    </div>
                    <p style="margin-bottom: 12px; font-size: 10pt;"><strong>Tender Title:</strong> ${tender.tenderName || "Equipment / Supplies"} | <strong>Tender No:</strong> ${tender.tenderNo || "1-5/2025/HPU"}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 7%; text-align: center;">Sr. No.</th>
                                <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; width: 53%; text-align: left;">Particulars / Required Document Proof & Annexure Reference</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 20%; text-align: center;">Complied (Yes/No)</th>
                                <th style="border: 1px solid black; padding: 6px 6px; background: #f0f0f0; width: 20%; text-align: center;">Page No. in Bid</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${complianceRowsHtml}
                        </tbody>
                    </table>
                    <div style="margin-top: 14px; font-size: 9.5pt; line-height: 1.5; text-align: justify;">
                        <p style="font-weight: bold; text-decoration: underline; margin-bottom: 4px;">DECLARATION & UNDERTAKING</p>
                        <p style="margin-bottom: 6px;">I / We hereby declare that the information and documentary evidences furnished above are true, authentic, and complete. In case any information or certificate submitted is found to be incorrect, forged, or misleading at any stage, our bid shall stand summarily rejected, or if contract has been awarded, the same shall stand terminated with forfeiture of EMD / Performance Bank Guarantee.</p>
                        <p>That our firm has carefully read and understood the entire tender document and unconditionally agrees to all the terms, conditions, and specifications specified therein.</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 24px; font-size: 9.5pt;">
                        <div>
                            <p><strong>Date:</strong> _ _ / _ _ / 2026<br/><strong>Place:</strong> ______________</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin-bottom: 20px;"><strong>Authorized Signatory:</strong> ___________________________</p>
                            <p><strong>Name & Designation:</strong> _________________________<br/><strong>Official Seal:</strong> _________________________</p>
                        </div>
                    </div>
                </div>
            `;

            // Add Annexure-I
            generatedPages.push({
                id: `${generatedPages.length + 1}`,
                html: `<div>${annexureIPageHtml}</div>`,
            });

            // 4. Render all remaining selected Annexures with sequential Roman numerals (Annexure-II, Annexure-III, ...)
            otherAnnexures.forEach((annex, idx) => {
                const assignedRoman = toRoman(idx + 2);
                let renderedTemplate = annex.contentTemplate || `<p>${annex.title}</p>`;

                // Dynamically replace Annexure header Roman numerals and letters in template
                renderedTemplate = renderedTemplate.replace(/(<h[1-3][^>]*>)\s*Annexure\s*[-–—]?\s*[A-Z0-9IVXLCDM]+/gi, `$1Annexure-${assignedRoman}`);
                renderedTemplate = renderedTemplate.replace(/\bAnnexure\s*[-–—]?\s*[A-Z0-9IVXLCDM]+\b/gi, `Annexure-${assignedRoman}`);
                renderedTemplate = renderedTemplate.replace(/Annexure\s*[-–—]?\s*[‘'"]?A[’'"]?/gi, `Annexure-${assignedRoman}`);
                renderedTemplate = replaceVars(renderedTemplate);

                generatedPages.push({
                    id: `${generatedPages.length + 1}`,
                    html: `<div>${renderedTemplate}</div>`,
                });
            });
        }

        return generatedPages;
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
            setTimeout(() => {
                setSaveStatus(null);
                navigate('/my-tenders');
            }, 800);
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
            await saveDocument({
                tenderId: parseInt(id),
                name: saveName.trim(),
                pages: currentPages,
                extraPages: [],
            });
            setSaveStatus('saved');
            setTimeout(() => {
                setIsSaveModalOpen(false);
                setSaveStatus(null);
                navigate('/my-tenders');
            }, 800);
        } catch (err) {
            console.error("Error saving:", err);
            setSaveStatus('error');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Generating document from templates & annexures...</p>
            </div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-600 font-medium">{error}</div>;
    if (!data) return <div className="p-8 text-center">No data found.</div>;

    const effectivePages = (pages && pages.length > 0)
        ? pages
        : generatePages(data, terms, categories, annexures);
    const totalPages = effectivePages.length;

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

            {/* Clean Editor Toolbar: Save/Edit, Add Page, Page Status */}
            <div className="flex items-center gap-3 sticky top-4 z-50 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-xl border border-slate-200">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    title="Back to My Tenders"
                >
                    <ArrowLeft size={16} /> My Tenders
                </button>

                <button
                    onClick={() => navigate(`/edit-tender/${id}`)}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title="Edit Tender Form (Dates, Articles, Terms & Conditions, Annexures)"
                >
                    <Edit3 size={15} className="text-blue-600" /> Edit Form
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {savedId ? (
                    <>
                        <button
                            onClick={handleQuickSave}
                            disabled={isSavingDirect}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl shadow-md shadow-purple-500/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
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
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        >
                            Save as New Version
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleSaveNewClick}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl shadow-md shadow-purple-500/20 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        <Save size={16} /> Save Version
                    </button>
                )}

                <button
                    onClick={addNewPage}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                    <Plus size={16} /> Add Page
                </button>

                <button
                    onClick={() => {
                        if (window.confirm("Regenerate preview pages with the latest Annexure-I and sequential Roman numeral layout? Any unsaved manual text edits on this page will be reset.")) {
                            const gen = generatePages(data, terms, categories, annexures);
                            setPages(gen);
                        }
                    }}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title="Regenerate all document pages to the latest compliant standard layout"
                >
                    <RefreshCw size={14} className="text-amber-600" /> Regenerate Layout
                </button>

                {savedId && (
                    <>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <a
                            href={`${API_URL}/documents/${savedId}/export-package?profile=${isLimited || isETender ? "two_cover" : "gem"}`}
                            download
                            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Export Portal Multi-Cover ZIP Archive"
                        >
                            <Package size={14} /> {isLimited || isETender ? "Two-Cover ZIP" : "GeM ZIP"}
                        </a>
                    </>
                )}

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md font-sans">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Save className="w-5 h-5 text-purple-600" /> Save Document Version
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
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl mb-5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    required
                                />
                                {saveStatus === 'error' && (
                                    <p className="text-red-600 text-sm mb-3">Failed to save. Please try again.</p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsSaveModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saveStatus === 'saving'}
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-md shadow-purple-500/20 transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
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
            {effectivePages.map((page, index) => (
                <div key={page.id || `page-${index}`} className="page-wrapper relative">
                    {/* Delete page button (visible on hover) */}
                    {effectivePages.length > 1 && (
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
                    className="flex items-center gap-2 bg-white text-slate-700 border-2 border-dashed border-slate-300 hover:border-purple-500 hover:text-purple-600 px-8 py-3.5 rounded-2xl transition-all font-sans text-sm font-semibold hover:shadow-lg shadow-xs cursor-pointer"
                >
                    <Plus size={18} /> Add New Page
                </button>
            </div>
        </div>
    );
};

export default TenderPreview;
