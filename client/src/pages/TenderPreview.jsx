import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer, Save, Plus, Trash2, Download } from 'lucide-react';
import { fetchTender, fetchDashboardData, fetchSavedDocument, saveDocument } from '../services/api';

// A4 Page Layout Component with contentEditable support
const PageLayout = ({ children, pageNumber, totalPages, contentRef, isFirst }) => (
    <div className={`a4-page ${isFirst ? '' : 'mt-8'}`}>
        <div className="border-outer">
            <div className="border-middle">
                <div className="border-inner">
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
    const [searchParams] = useSearchParams();
    const savedId = searchParams.get('savedId');

    const [data, setData] = useState(null);
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Page management
    const [pages, setPages] = useState([]);
    const pageRefs = useRef({});

    // Save Modal State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [saveStatus, setSaveStatus] = useState(null);

    // Helper to group terms by category
    const getTermsByCategory = useCallback(() => {
        const grouped = {};
        terms.forEach(term => {
            if (!grouped[term.categoryId]) {
                grouped[term.categoryId] = [];
            }
            grouped[term.categoryId].push(term);
        });
        return grouped;
    }, [terms]);

    // Replace template variables in text
    const replaceVariables = useCallback((text, variables) => {
        if (!text || !variables) return text;
        let result = text;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            result = result.replace(regex, variables[key] || `{{${key}}}`);
        });
        return result;
    }, []);

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
                    if (savedDoc && savedDoc.pages) {
                        const loadedPages = Object.keys(savedDoc.pages)
                            .sort((a, b) => parseInt(a) - parseInt(b))
                            .map(key => ({ id: key, html: savedDoc.pages[key] }));
                        setPages(loadedPages);
                    }
                } else {
                    // Generate fresh pages from tender data
                    const generatedPages = generatePages(tender, selectedTerms, allCategories);
                    setPages(generatedPages);
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
        const replaceVars = (text) => {
            if (!text) return text;
            let result = text;
            Object.keys(variables).forEach(key => {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                result = result.replace(regex, variables[key] || `{{${key}}}`);
            });
            return result;
        };

        // Page 1: Cover Page
        const page1 = `
            <div style="height: 100%; display: flex; flex-direction: column; padding-top: 60px; text-align: center;">
                <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">Himachal Pradesh University,</h2>
                <h3 style="font-size: 17px; font-weight: bold; margin-bottom: 4px;">(NAAC Accredited 'A' Grade University)</h3>
                <h3 style="font-size: 17px; font-weight: bold;">"${tender.departmentName || 'N/A'}"</h3>
                <div style="margin: 32px auto; text-align: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg" alt="HPU Logo" style="height: 150px; width: auto;" />
                </div>
                <h1 style="font-size: 22px; font-weight: bold; margin: 24px 32px;">
                    Bid Document for<br/>
                    <span style="font-size: 18px; font-weight: normal; display: block; margin-top: 8px;">${tender.tenderName || 'N/A'}</span>
                    <br/>for<br/>
                    <span style="font-size: 18px; font-weight: normal; display: block; margin-top: 8px;">${tender.departmentName || 'N/A'}</span>
                </h1>
                <div style="margin-top: 32px; font-size: 16px;">
                    <p style="margin-bottom: 8px;"><strong>Website:</strong> <a href="https://www.hpuniv.ac.in" style="color: #1e3a8a; text-decoration: underline;">https://www.hpuniv.ac.in</a></p>
                    <p><strong>E-mail:</strong> ${tender.departmentEmail || 'N/A'}</p>
                </div>
            </div>
        `;

        // Page 2: Summary Table + Section 1
        const page2 = `
            <div>
                <h3 style="font-size: 17px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; text-align: center;">SUMMARY</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid black; padding: 8px 12px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 10%;">Sr. No.</th>
                            <th style="border: 1px solid black; padding: 8px 12px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 30%;">Description</th>
                            <th style="border: 1px solid black; padding: 8px 12px; background-color: #f0f0f0; font-weight: 700; text-align: left; width: 60%;">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">1.</td><td style="border: 1px solid black; padding: 8px 12px;">Item Description</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.tenderName || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">2.</td><td style="border: 1px solid black; padding: 8px 12px;">Quantity</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.itemQuantity || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">3.</td><td style="border: 1px solid black; padding: 8px 12px;">Department</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.departmentName || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">4.</td><td style="border: 1px solid black; padding: 8px 12px;">Bid Start Date & Time</td><td style="border: 1px solid black; padding: 8px 12px;">[as mentioned in GeM Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">5.</td><td style="border: 1px solid black; padding: 8px 12px;">Bid End Date & Time</td><td style="border: 1px solid black; padding: 8px 12px;">[as mentioned in GeM Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">6.</td><td style="border: 1px solid black; padding: 8px 12px;">Pre-Bid Meeting</td><td style="border: 1px solid black; padding: 8px 12px;">[as mentioned in GeM Bid Document]</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">7.</td><td style="border: 1px solid black; padding: 8px 12px;">Earnest Money Deposit (EMD)</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.emdRequired || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">8.</td><td style="border: 1px solid black; padding: 8px 12px;">Performance Security</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.pbgRequired || 'N/A'}</td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">9.</td><td style="border: 1px solid black; padding: 8px 12px;">Pledge of EMD / PBG</td><td style="border: 1px solid black; padding: 8px 12px;">EMD and PBG must be pledged in the name of: <strong>${tender.emdPledgeOfficer || 'N/A'}</strong></td></tr>
                        <tr><td style="border: 1px solid black; padding: 8px 12px;">10.</td><td style="border: 1px solid black; padding: 8px 12px;">Bid Validity</td><td style="border: 1px solid black; padding: 8px 12px;">${tender.bidValidity || 'N/A'} days from date of publication</td></tr>
                    </tbody>
                </table>
                <p style="font-weight: bold; font-size: 11px; border: 1px solid #ccc; padding: 8px; background-color: #f9f9f9;"><strong>Note:</strong> The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.</p>
                <div style="margin-top: 32px;">
                    <h3 style="font-size: 17px; font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; text-align: center;">SECTION 1: INSTRUCTIONS FOR BIDDERS</h3>
                    <div style="text-align: justify; font-size: 12pt;">
                        <p style="margin-bottom: 12px;"><strong>1.1 Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids must be submitted exclusively online through the GeM portal before the specified deadline.</p>
                        <p><strong>1.2 Governing Terms:</strong> This bid process will be governed by the GTC of GeM in addition to the ATC specified in this document. In case of any conflict, the terms specified in this document will prevail.</p>
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
            <div style="margin-bottom: 32px;">
                <h4 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; margin-top: 24px;">SECTION 2: GENERAL REQUIREMENTS</h4>
                <div style="text-align: justify; font-size: 12pt; line-height: 1.6;">
                    <p style="margin-bottom: 12px;"><strong>2.1 Digital Signature:</strong> <span style="font-weight: normal;">Bids must be digitally signed by an authorized representative using a valid Class-II or Class-III DSC.</span></p>
                    <p style="margin-bottom: 12px;"><strong>2.2 Documentation:</strong> <span style="font-weight: normal;">Bidders are required to upload scanned copies of all necessary documents. All documents must be clear, legible, and duly signed and stamped.</span></p>
                </div>
            </div>
        `;

        allCategories.forEach((cat, catIndex) => {
            const catTerms = grouped[cat.id];
            if (!catTerms || catTerms.length === 0) return;

            termsHtml += `<h4 style="font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; margin-top: 24px;">SECTION ${catIndex + 3}: ${cat.name.toUpperCase()}</h4>`;

            catTerms.forEach((term, termIndex) => {
                const description = replaceVars(term.description);
                termsHtml += `
                    <div style="margin-bottom: 12px; padding-left: 8px; text-align: justify; line-height: 1.6;">
                        <p><strong>${catIndex + 3}.${termIndex + 1} ${term.title}:</strong> <span style="font-weight: normal;">${description}</span></p>
                    </div>
                `;
            });
        });

        // Split terms into pages (rough estimate ~3000 chars per page)
        const CHARS_PER_PAGE = 3500;
        if (termsHtml.length <= CHARS_PER_PAGE) {
            termsPages.push(termsHtml);
        } else {
            // Split by sections
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

        const allPages = [
            { id: '1', html: page1 },
            { id: '2', html: page2 },
            ...termsPages.map((html, idx) => ({ id: `${3 + idx}`, html })),
        ];

        return allPages;
    };

    const handlePrint = () => {
        window.print();
    };

    const addNewPage = () => {
        const newId = `${pages.length + 1}`;
        setPages(prev => [...prev, {
            id: newId,
            html: `<div style="padding: 16px;"><h3 style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">New Section</h3><p>Start typing your content here...</p></div>`
        }]);
    };

    const removePage = (index) => {
        if (pages.length <= 1) return;
        if (confirm('Are you sure you want to remove this page?')) {
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

    const handleSaveClick = () => {
        setSaveName("");
        setSaveStatus(null);
        setIsSaveModalOpen(true);
    };

    const confirmSave = async (e) => {
        e.preventDefault();
        if (!saveName.trim()) return;

        setSaveStatus('saving');
        const currentPages = getCurrentPageContents();

        try {
            await saveDocument({
                tenderId: parseInt(id),
                name: saveName,
                pages: currentPages,
                extraPages: [],
            });
            setSaveStatus('saved');
            setTimeout(() => {
                setIsSaveModalOpen(false);
                setSaveStatus(null);
            }, 1500);
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
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!data) return <div className="p-8 text-center">No data found.</div>;

    const totalPages = pages.length;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8 doc-font print:bg-white print:p-0 print:gap-0">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
                .doc-font { font-family: 'Montserrat', sans-serif; }
                .a4-page { background-color: white; width: 210mm; min-height: 297mm; padding: 10mm; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12); box-sizing: border-box; position: relative; margin: 0 auto; border-radius: 2px; }
                .border-outer { border: 1px solid #006400; height: 100%; min-height: calc(297mm - 20mm); padding: 1px; box-sizing: border-box; }
                .border-middle { border: 3px solid #006400; height: 100%; min-height: calc(297mm - 20mm - 4px); padding: 1px; box-sizing: border-box; }
                .border-inner { border: 1px solid #006400; min-height: calc(297mm - 20mm - 12px); padding: 32px; box-sizing: border-box; position: relative; display: flex; flex-direction: column; }
                .page-content { flex-grow: 1; font-size: 12pt; line-height: 1.5; color: #000; cursor: text; }
                .page-content:focus { outline: none; background-color: rgba(59, 130, 246, 0.02); }
                .page-content table { border-collapse: collapse; width: 100%; }
                .page-content td, .page-content th { border: 1px solid black; padding: 8px 12px; vertical-align: top; }
                .page-content th { background-color: #f0f0f0; font-weight: 700; text-align: left; }
                .page-footer { text-align: right; font-size: 10pt; font-weight: 600; padding-top: 12px; margin-top: auto; }
                .page-controls { position: absolute; top: -14px; right: 12px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; z-index: 10; }
                .page-wrapper:hover .page-controls { opacity: 1; }
                .page-controls button { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 4px; }
                @media print {
                    @page { size: A4; margin: 0; }
                    body { background-color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .a4-page { box-shadow: none; margin: 0 auto; width: 210mm; height: 297mm; page-break-after: always; padding: 10mm; overflow: hidden; border-radius: 0; min-height: 297mm; }
                    .border-outer, .border-middle, .border-inner { min-height: auto; height: 100%; }
                    .page-controls { display: none !important; }
                }
            `}</style>

            {/* Toolbar */}
            <div className="no-print flex gap-3 sticky top-4 z-50 bg-white/90 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-gray-200/80">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow font-sans text-sm font-medium">
                    <Printer size={18} /> Print / PDF
                </button>
                <button onClick={handleSaveClick} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow font-sans text-sm font-medium">
                    <Save size={18} /> Save Version
                </button>
                <button onClick={addNewPage} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg shadow-sm transition-all font-sans text-sm font-medium">
                    <Plus size={18} /> Add Page
                </button>
                <div className="border-l border-gray-200 mx-1"></div>
                <div className="flex items-center px-3 text-xs text-gray-500 font-sans">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{totalPages} pages</span>
                    <span className="ml-2">• Click anywhere to edit</span>
                </div>
            </div>

            {/* Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm no-print">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md font-sans">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Save className="w-5 h-5 text-indigo-600" /> Save Document Version
                        </h3>
                        {saveStatus === 'saved' ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="text-green-700 font-medium">Saved successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={confirmSave}>
                                <input
                                    type="text"
                                    autoFocus
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder="e.g. Draft v1, Final Copy..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    required
                                />
                                {saveStatus === 'error' && (
                                    <p className="text-red-600 text-sm mb-4">Failed to save. Please try again.</p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                                    <button type="submit" disabled={saveStatus === 'saving'} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70">
                                        {saveStatus === 'saving' ? 'Saving...' : 'Save Version'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Document Pages - All directly editable */}
            {pages.map((page, index) => (
                <div key={page.id} className="page-wrapper relative">
                    {/* Page controls (visible on hover) */}
                    {pages.length > 1 && (
                        <div className="page-controls no-print">
                            <button
                                onClick={() => removePage(index)}
                                style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                                title="Remove this page"
                            >
                                <Trash2 size={12} /> Remove
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

            {/* Add page floating button at bottom */}
            <div className="no-print pb-12">
                <button
                    onClick={addNewPage}
                    className="flex items-center gap-2 bg-white text-gray-600 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600 px-8 py-4 rounded-xl transition-all font-sans text-sm font-medium hover:shadow-md"
                >
                    <Plus size={20} /> Add New Page
                </button>
            </div>
        </div>
    );
};

export default TenderPreview;
