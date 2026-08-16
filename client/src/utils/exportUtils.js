import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Clean up text for filenames
 */
export const sanitizeFilename = (name) => {
    return (name || "Tender_Document")
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_")
        .trim();
};

/**
 * Convert HTML Pages object to ordered array of HTML strings
 */
export const getOrderedPages = (pagesObj) => {
    if (!pagesObj) return [];
    if (Array.isArray(pagesObj)) {
        return pagesObj.map((p) => (typeof p === "string" ? p : p.html || ""));
    }
    return Object.keys(pagesObj)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((k) => pagesObj[k]);
};

/**
 * Export Saved Document as PDF (with triple green border, watermark, and X/Y footers)
 */
export const downloadDocumentAsPdf = async (doc, tender) => {
    try {
        const pages = getOrderedPages(doc.pages);
        if (pages.length === 0) {
            alert("No pages found in this document to export.");
            return;
        }

        const totalPages = pages.length;
        const filename = `${sanitizeFilename(doc.name || tender?.tenderName || "Tender_Document")}.pdf`;

        // Create temporary container for rendering
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.width = "210mm";
        container.style.backgroundColor = "#ffffff";
        container.style.fontFamily = "'Montserrat', Arial, sans-serif";

        let htmlContent = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
                .pdf-page {
                    width: 210mm;
                    height: 296.8mm;
                    padding: 10mm;
                    box-sizing: border-box;
                    background: #ffffff;
                    page-break-after: always;
                    font-family: 'Montserrat', Arial, sans-serif;
                    position: relative;
                }
                .pdf-page:last-child {
                    page-break-after: avoid;
                }
                .pdf-border-outer {
                    border: 1px solid #004821;
                    height: 100%;
                    padding: 1px;
                    box-sizing: border-box;
                }
                .pdf-border-middle {
                    border: 3px solid #004821;
                    height: 100%;
                    padding: 1px;
                    box-sizing: border-box;
                }
                .pdf-border-inner {
                    border: 1px solid #004821;
                    height: 100%;
                    padding: 24px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                }
                .pdf-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 480px;
                    max-width: 80%;
                    opacity: 0.08;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pdf-watermark img {
                    width: 100%;
                    height: auto;
                }
                .pdf-page-content {
                    flex-grow: 1;
                    font-size: 11pt;
                    line-height: 1.5;
                    color: #000000;
                    position: relative;
                    z-index: 2;
                }
                .pdf-page-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 12px;
                }
                .pdf-page-content td, .pdf-page-content th {
                    border: 1px solid #000000;
                    padding: 6px 10px;
                    vertical-align: top;
                    font-size: 10pt;
                }
                .pdf-page-content th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .pdf-footer {
                    text-align: right;
                    font-size: 10pt;
                    font-weight: 700;
                    color: #000000;
                    margin-top: 12px;
                    padding-top: 6px;
                    position: relative;
                    z-index: 2;
                }
            </style>
        `;

        pages.forEach((pageHtml, index) => {
            htmlContent += `
                <div class="pdf-page">
                    <div class="pdf-border-outer">
                        <div class="pdf-border-middle">
                            <div class="pdf-border-inner">
                                <div class="pdf-watermark">
                                    <img src="/hpu_watermark.png" alt="" />
                                </div>
                                <div class="pdf-page-content">
                                    ${pageHtml}
                                </div>
                                <div class="pdf-footer">
                                    ${index + 1}/${totalPages}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        const opt = {
            margin: [0, 0, 0, 0],
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false,
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] },
        };

        await html2pdf().set(opt).from(container).save();
        document.body.removeChild(container);
    } catch (err) {
        console.error("PDF Export Error:", err);
        alert("Failed to generate PDF. Please try again.");
    }
};

/**
 * Export Saved Document as Microsoft Word (.docx) with exact triple borders, watermark, and footer
 */
export const downloadDocumentAsDocx = async (docOrId, tenderOrName) => {
    try {
        const docId = typeof docOrId === "object" && docOrId !== null ? docOrId.id : docOrId;
        const rawName = typeof docOrId === "object" && docOrId !== null 
            ? (docOrId.name || tenderOrName?.tenderName) 
            : (typeof tenderOrName === "string" ? tenderOrName : tenderOrName?.tenderName);
        
        const filename = `${sanitizeFilename(rawName || "Tender_Document")}.docx`;

        if (docId) {
            const token = localStorage.getItem("hpu_token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            const res = await fetch(`${API_URL}/documents/${docId}/docx`, { headers });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server returned ${res.status}: ${errText}`);
            }

            const blob = await res.blob();
            saveAs(blob, filename);
            return;
        }

        // If not saved to DB yet, warn user
        alert("Please save the document version first before downloading DOCX.");
    } catch (err) {
        console.error("DOCX Export Error:", err);
        alert("Failed to generate high-fidelity DOCX: " + (err.message || "Please ensure the backend is running."));
    }
};
