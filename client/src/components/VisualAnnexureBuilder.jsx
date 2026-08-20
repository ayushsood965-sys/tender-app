import React, { useState, useEffect, useRef } from "react";
import {
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Layers,
    Table,
    FileText,
    Shield,
    PenTool,
    Save,
    X,
    Eye,
    Sparkles,
    Check,
    HelpCircle,
    LayoutGrid,
    ListFilter,
    Code,
    Sliders,
    Type,
    Copy,
} from "lucide-react";
import SearchableSelect from "./SearchableSelect";

const VisualAnnexureBuilder = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [editorMode, setEditorMode] = useState("blocks"); // "blocks" | "html"
    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [category, setCategory] = useState("general");
    const [applicableDocTypes, setApplicableDocTypes] = useState(["all"]);
    const [description, setDescription] = useState("");
    const [changelog, setChangelog] = useState("");
    const [htmlContent, setHtmlContent] = useState("");

    // Initial blocks
    const [blocks, setBlocks] = useState([]);
    const htmlTextareaRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setCode(initialData.code || "");
            setCategory(initialData.category || "general");
            setApplicableDocTypes(initialData.applicableDocTypes || ["all"]);
            setDescription(initialData.description || "");
            setHtmlContent(initialData.contentTemplate || "");

            // If initialData has blocks, load them, otherwise initialize default blocks
            if (initialData.blocks && Array.isArray(initialData.blocks) && initialData.blocks.length > 0) {
                setBlocks(initialData.blocks);
                setEditorMode("blocks");
            } else {
                // If it has HTML content template (e.g. seeded annexures), default to HTML Proforma Editor
                setEditorMode("html");
                setBlocks([
                    {
                        id: 1,
                        type: "header",
                        annexNumber: initialData.title?.split(":")[0]?.trim() || "Annexure",
                        heading: initialData.title?.split(":")[1]?.trim() || initialData.title || "PROFORMA OF DECLARATION / UNDERTAKING",
                        subtext: "(To be submitted on Bidder's Official Letterhead)",
                    },
                    {
                        id: 2,
                        type: "recipient",
                        authority: "{{tenderInvitingAuthority}}",
                        department: "{{departmentName}}",
                        university: "Himachal Pradesh University, Summer Hill, Shimla - 171005",
                        subject: `Regarding ${initialData.title || "{{tenderName}}"} (Tender No. {{tenderNo}})`,
                    },
                    {
                        id: 3,
                        type: "paragraph",
                        text: "I/We, the undersigned, hereby declare that our firm has carefully examined the tender specifications and terms for {{tenderName}} under Tender Ref. {{tenderNo}} and agree to abide by all requirements unconditionally.",
                    },
                    {
                        id: 4,
                        type: "signatures",
                        leftTitle: "Date & Place",
                        rightTitle: "Authorized Signatory with Official Seal",
                    }
                ]);
            }
        } else {
            setTitle("");
            setCode(`ANNEX_${Date.now()}`);
            setCategory("general");
            setApplicableDocTypes(["all"]);
            setDescription("");
            setEditorMode("blocks");
            const defaultBlocks = [
                {
                    id: 1,
                    type: "header",
                    annexNumber: "Annexure",
                    heading: "PROFORMA OF DECLARATION / UNDERTAKING",
                    subtext: "(To be submitted on Bidder's Official Letterhead)",
                },
                {
                    id: 2,
                    type: "recipient",
                    authority: "{{tenderInvitingAuthority}}",
                    department: "{{departmentName}}",
                    university: "Himachal Pradesh University, Summer Hill, Shimla - 171005",
                    subject: "Submission of Tender Documents for {{tenderName}} (Tender No. {{tenderNo}})",
                },
                {
                    id: 3,
                    type: "paragraph",
                    text: "I/We, the undersigned, hereby declare that our firm has carefully examined the tender specifications for {{tenderName}} under Tender Ref. {{tenderNo}} and accept all terms without any reservations.",
                },
                {
                    id: 4,
                    type: "signatures",
                    leftTitle: "Date & Place",
                    rightTitle: "Authorized Signatory with Official Seal",
                }
            ];
            setBlocks(defaultBlocks);
            setHtmlContent("");
        }
    }, [initialData, isOpen]);

    const [customVarInput, setCustomVarInput] = useState("");

    const VARIABLE_CHIPS = [
        { label: "Tender Name", token: "{{tenderName}}" },
        { label: "Tender No", token: "{{tenderNo}}" },
        { label: "Department", token: "{{departmentName}}" },
        { label: "Inviting Authority", token: "{{tenderInvitingAuthority}}" },
        { label: "EMD Amount", token: "{{emdAmount}}" },
        { label: "PBG Amount", token: "{{pbgAmount}}" },
        { label: "Bid Validity", token: "{{bidValidity}}" },
        { label: "Delivery Days", token: "{{deliveryDays}}" },
        { label: "Delivery Location", token: "{{delivery_location}}" },
        { label: "Warranty Years", token: "{{warranty_years}}" },
        { label: "Jurisdiction", token: "{{courtJurisdiction}}" },
    ];

    const addBlock = (type) => {
        const newId = Date.now();
        if (type === "header") {
            setBlocks([...blocks, { id: newId, type: "header", annexNumber: "Annexure", heading: "PROFORMA TITLE", subtext: "(To be submitted on Official Letterhead)" }]);
        } else if (type === "recipient") {
            setBlocks([...blocks, {
                id: newId,
                type: "recipient",
                authority: "{{tenderInvitingAuthority}}",
                department: "{{departmentName}}",
                university: "Himachal Pradesh University, Summer Hill, Shimla - 171005",
                subject: "Regarding {{tenderName}} (Tender Ref: {{tenderNo}})"
            }]);
        } else if (type === "paragraph") {
            setBlocks([...blocks, { id: newId, type: "paragraph", text: "Enter your legal clause text here..." }]);
        } else if (type === "placeholder_box") {
            setBlocks([...blocks, { id: newId, type: "placeholder_box", text: "please add the technical specs table here" }]);
        } else if (type === "stamp_box") {
            setBlocks([...blocks, { id: newId, type: "stamp_box", value: "50", text: "On ₹ 50/- Non-Judicial Stamp Paper Duly Notarized" }]);
        } else if (type === "key_values") {
            setBlocks([...blocks, {
                id: newId,
                type: "key_values",
                title: "Bidder Organizational Profile Details",
                items: [
                    { label: "Name of the Bidder / Firm", value: "___________________________" },
                    { label: "Complete Registered Office Address", value: "___________________________" },
                    { label: "Name & Mobile of Authorized Signatory", value: "___________________________" },
                    { label: "Official Email Address", value: "___________________________" },
                    { label: "GSTIN Registration Number", value: "___________________________" },
                    { label: "Permanent Account Number (PAN)", value: "___________________________" },
                    { label: "Bank Account No & IFSC Code", value: "___________________________" },
                ]
            }]);
        } else if (type === "table") {
            setBlocks([...blocks, {
                id: newId,
                type: "table",
                columns: ["Sr. No.", "Item Specification / Requirement", "Offered Parameter", "Compliance (Yes/No)"],
                rows: [
                    ["1.", "Standard Technical Specifications as per Schedule", "", "Yes"],
                    ["2.", "Complete On-site Warranty (3 Years)", "", "Yes"],
                ]
            }]);
        } else if (type === "signatures") {
            setBlocks([...blocks, { id: newId, type: "signatures", leftTitle: "Date & Place", rightTitle: "Authorized Signatory with Official Seal" }]);
        }
    };

    const updateBlock = (id, field, value) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index, direction) => {
        const newBlocks = [...blocks];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[targetIndex];
        newBlocks[targetIndex] = temp;
        setBlocks(newBlocks);
    };

    const insertTokenIntoHtml = (token) => {
        if (editorMode === "html") {
            const textarea = htmlTextareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart || 0;
                const end = textarea.selectionEnd || 0;
                const newText = htmlContent.substring(0, start) + token + htmlContent.substring(end);
                setHtmlContent(newText);
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + token.length, start + token.length);
                }, 10);
            } else {
                setHtmlContent(prev => prev + " " + token);
            }
        }
    };

    // Compile Blocks to Standard Clean HTML
    const compileToHtml = () => {
        let html = `<div style="font-size: 10.5pt; line-height: 1.5; color: #000; text-align: justify;">\n`;

        blocks.forEach(b => {
            if (b.type === "header") {
                html += `  <div style="text-align: center; margin-bottom: 14px;">\n`;
                if (b.annexNumber) html += `    <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin-bottom: 3px;">${b.annexNumber}</h2>\n`;
                if (b.heading) html += `    <h3 style="font-size: 15px; font-weight: bold; text-transform: uppercase;">${b.heading}</h3>\n`;
                if (b.subtext) html += `    <p style="font-size: 9.5pt; color: #475569; margin-top: 3px;">${b.subtext}</p>\n`;
                html += `  </div>\n`;
            } else if (b.type === "recipient") {
                html += `  <div style="margin-bottom: 12px; text-align: left;">\n`;
                html += `    <p style="margin-bottom: 2px; font-weight: bold;">To</p>\n`;
                html += `    <div style="margin-left: 28px; text-align: left;">\n`;
                html += `      <p style="margin-bottom: 2px;">The ${b.authority || "{{tenderInvitingAuthority}}" },</p>\n`;
                html += `      <p style="margin-bottom: 2px;">${b.department || "{{departmentName}}"},</p>\n`;
                html += `      <p style="margin-bottom: 2px;">${b.university || "Himachal Pradesh University, Summer Hill, Shimla - 171005"}.</p>\n`;
                html += `    </div>\n`;
                html += `  </div>\n`;
                if (b.subject) html += `  <p style="margin-bottom: 10px; text-align: left;"><strong>Subject:</strong> ${b.subject}</p>\n`;
                html += `  <p style="margin-bottom: 10px; text-align: left;">Sir/Madam,</p>\n`;
            } else if (b.type === "paragraph") {
                html += `  <p style="margin-bottom: 10px;">${b.text}</p>\n`;
            } else if (b.type === "placeholder_box") {
                html += `  <div style="padding: 24px; border: 1.5px dashed #94a3b8; border-radius: 8px; text-align: center; margin-top: 20px; margin-bottom: 24px; background: #f8fafc;">\n    <p style="font-size: 11pt; font-weight: bold; color: #334155; margin: 0;">${b.text}</p>\n  </div>\n`;
            } else if (b.type === "stamp_box") {
                html += `  <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 10px; text-align: center; margin-bottom: 14px; font-weight: bold; font-size: 9.5pt; color: #334155;">[ ${b.text} ]</div>\n`;
            } else if (b.type === "key_values") {
                html += `  <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;">\n`;
                if (b.title) {
                    html += `    <thead><tr><th colspan="2" style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; text-align: left; font-weight: bold;">${b.title}</th></tr></thead>\n`;
                }
                html += `    <tbody>\n`;
                (b.items || []).forEach(item => {
                    html += `      <tr><td style="border: 1px solid black; padding: 6px 8px; width: 40%; font-weight: 600;">${item.label}</td><td style="border: 1px solid black; padding: 6px 8px;">${item.value}</td></tr>\n`;
                });
                html += `    </tbody>\n  </table>\n`;
            } else if (b.type === "table") {
                html += `  <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt;">\n    <thead>\n      <tr>\n`;
                (b.columns || []).forEach(col => {
                    html += `        <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; font-weight: bold;">${col}</th>\n`;
                });
                html += `      </tr>\n    </thead>\n    <tbody>\n`;
                (b.rows || []).forEach(row => {
                    html += `      <tr>\n`;
                    row.forEach(cell => {
                        html += `        <td style="border: 1px solid black; padding: 6px 8px;">${cell}</td>\n`;
                    });
                    html += `      </tr>\n`;
                });
                html += `    </tbody>\n  </table>\n`;
            } else if (b.type === "signatures") {
                html += `  <div style="display: flex; justify-content: space-between; margin-top: 32px; font-size: 9.5pt;">\n`;
                html += `    <div><p><strong>Date:</strong> _ _ / _ _ / 2026<br/><strong>Place:</strong> ______________</p></div>\n`;
                html += `    <div style="text-align: right;"><p style="margin-bottom: 22px;"><strong>Authorized Signatory:</strong> ___________________________</p><p><strong>${b.rightTitle || "Name & Official Seal"}:</strong> _________________________</p></div>\n`;
                html += `  </div>\n`;
            }
        });

        html += `</div>`;
        return html;
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Please enter a title for the Annexure.");
            return;
        }

        const finalHtml = editorMode === "html" ? (htmlContent || compileToHtml()) : compileToHtml();
        const payload = {
            id: initialData?.id || Date.now(),
            title: title,
            code: code || `ANNEX_${Date.now()}`,
            category: category,
            applicableDocTypes: applicableDocTypes,
            description: description || `Visual Proforma Annexure format: ${title}`,
            contentTemplate: finalHtml,
            blocks: editorMode === "blocks" ? blocks : (initialData?.blocks || []),
            changelog: changelog || "Updated via Annexure Builder / Editor",
            isMaster: initialData?.isMaster !== undefined ? initialData.isMaster : false,
        };

        onSave(payload);
    };

    if (!isOpen) return null;

    const SAMPLE_PREVIEW_MAP = {
        tenderName: "High Resolution Analytical Equipment",
        tenderNo: "No. 1-5/2026/HPU/SPS",
        departmentName: "Department of Physics",
        departmentEmail: "physicshpu@gmail.com",
        tenderInvitingAuthority: "Store Purchase Officer",
        estimatedCost: "2,29,000",
        emdAmount: "5,000",
        pbgAmount: "10,000",
        bidValidity: "90 Days",
        deliveryDays: "15 Days",
        delivery_location: "Science Workshop, HPU Campus, Shimla-171005",
        warranty_years: "3 Years",
        courtJurisdiction: "Courts in Shimla Urban",
    };

    const getRenderedPreviewHtml = () => {
        let previewHtml = editorMode === "html" ? (htmlContent || "<p class='text-slate-400 italic text-center py-10'>No content template yet.</p>") : compileToHtml();
        Object.entries(SAMPLE_PREVIEW_MAP).forEach(([key, val]) => {
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
            previewHtml = previewHtml.replace(regex, `<span style="background-color: #fef3c7; color: #78350f; font-weight: 600; padding: 1px 4px; border-radius: 4px; border: 1px solid #fde68a;">${val}</span>`);
        });
        // For any remaining custom {{tokens}}, highlight them gracefully so user sees the dynamic token name
        previewHtml = previewHtml.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, token) => {
            const label = token.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return `<span style="background-color: #ede9fe; color: #5b21b6; font-family: monospace; font-size: 8.5pt; font-weight: bold; padding: 1px 5px; border-radius: 4px; border: 1px solid #ddd6fe;">[${label}]</span>`;
        });
        return previewHtml;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                            <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {initialData ? `Edit Annexure: ${initialData.title}` : "Design New Annexure"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Customize and edit proforma templates, {"{{variables}}"}, tables, and layouts.
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300">
                            <button
                                type="button"
                                onClick={() => {
                                    if (editorMode === "html" && blocks.length === 0) {
                                        // create initial blocks
                                        setBlocks([
                                            {
                                                id: 1,
                                                type: "header",
                                                annexNumber: title?.split(":")[0]?.trim() || "Annexure",
                                                heading: title?.split(":")[1]?.trim() || title || "PROFORMA OF DECLARATION",
                                                subtext: "(To be submitted on Bidder's Official Letterhead)",
                                            },
                                            {
                                                id: 2,
                                                type: "recipient",
                                                authority: "{{tenderInvitingAuthority}}",
                                                department: "{{departmentName}}",
                                                university: "Himachal Pradesh University, Summer Hill, Shimla - 171005",
                                                subject: `Regarding ${title || "{{tenderName}}"} (Tender No. {{tenderNo}})`,
                                            },
                                            {
                                                id: 3,
                                                type: "paragraph",
                                                text: "I/We, the undersigned, hereby declare that our firm has carefully examined the tender specifications for {{tenderName}} under Tender Ref. {{tenderNo}} and accept all terms unconditionally.",
                                            },
                                            {
                                                id: 4,
                                                type: "signatures",
                                                leftTitle: "Date & Place",
                                                rightTitle: "Authorized Signatory with Official Seal",
                                            }
                                        ]);
                                    }
                                    setEditorMode("blocks");
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    editorMode === "blocks" ? "bg-white text-purple-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Sliders size={13} /> Modular Blocks
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (editorMode === "blocks" && !htmlContent) {
                                        setHtmlContent(compileToHtml());
                                    }
                                    setEditorMode("html");
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    editorMode === "html" ? "bg-white text-purple-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Code size={13} /> Proforma HTML Code
                            </button>
                        </div>

                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body: 2 Columns (Editor Left, Live Preview Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
                    {/* Left: Controls & Configuration */}
                    <div className="lg:col-span-6 p-6 overflow-y-auto space-y-5 border-r border-slate-200">
                        {/* Meta Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Annexure Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Annexure-XI: Declaration of Ethical Standards"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <SearchableSelect
                                    label="Category"
                                    options={[
                                        { value: "general", label: "General", badge: "Standard" },
                                        { value: "undertaking", label: "Undertaking / Declaration", badge: "Legal" },
                                        { value: "eligibility", label: "Eligibility / MAF", badge: "Technical" },
                                        { value: "financial", label: "Financial", badge: "Commercial" },
                                        { value: "technical", label: "Technical", badge: "Specs" },
                                        { value: "custom", label: "Custom", badge: "Department" },
                                    ]}
                                    value={category}
                                    onChange={(val) => setCategory(val || "general")}
                                    placeholder="Select Category..."
                                    searchPlaceholder="Search category..."
                                />
                            </div>
                            <div>
                                <SearchableSelect
                                    label="Applicable Document Types"
                                    options={[
                                        { value: "all", label: "All Document Types", badge: "Universal" },
                                        { value: "Limited Tender Document", label: "Limited Tender Document", badge: "Sealed Quotations" },
                                        { value: "GeM ATC Document", label: "GeM ATC Document", badge: "GeM Portal" },
                                        { value: "e-tender Document", label: "e-tender Document", badge: "e-Procurement" },
                                    ]}
                                    value={applicableDocTypes[0] || "all"}
                                    onChange={(val) => setApplicableDocTypes([val || "all"])}
                                    placeholder="Select format..."
                                    searchPlaceholder="Search format..."
                                />
                            </div>
                        </div>

                        {/* Variables Injection Chips Bar */}
                        <div className="bg-purple-50/70 border border-purple-200/80 p-3.5 rounded-2xl space-y-2">
                            <span className="block text-[10.5px] font-bold text-purple-900 uppercase tracking-wider">
                                Click Token to Insert Variable
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {VARIABLE_CHIPS.map(chip => (
                                    <button
                                        key={chip.token}
                                        type="button"
                                        onClick={() => insertTokenIntoHtml(chip.token)}
                                        className="text-[10px] font-mono font-bold bg-white text-purple-800 border border-purple-200 hover:bg-purple-600 hover:text-white px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs"
                                        title={`Insert ${chip.token}`}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MODE 1: PROFORMA HTML CODE EDITOR */}
                        {editorMode === "html" && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                        <Code size={14} className="text-purple-600" />
                                        <span>Proforma HTML Template Code</span>
                                    </label>
                                    <span className="text-[10.5px] text-slate-400 font-mono font-medium">
                                        {htmlContent.length} characters
                                    </span>
                                </div>
                                <textarea
                                    ref={htmlTextareaRef}
                                    rows={18}
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    placeholder="Enter proforma HTML template with standard styling and {{variables}}..."
                                    className="w-full p-3.5 font-mono text-xs text-slate-800 bg-slate-950/5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed resize-y"
                                />
                            </div>
                        )}

                        {/* MODE 2: MODULAR BUILDING BLOCKS */}
                        {editorMode === "blocks" && (
                            <div className="space-y-4">
                                {/* Add Blocks Toolbar */}
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Add Building Blocks</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => addBlock("header")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Plus size={13} /> Header
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("recipient")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Plus size={13} /> Letter To
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("paragraph")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Plus size={13} /> Paragraph
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("placeholder_box")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Sparkles size={13} /> Placeholder Box
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("key_values")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <LayoutGrid size={13} /> Profile Grid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("stamp_box")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Shield size={13} /> Stamp Box
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("table")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Table size={13} /> Table
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => addBlock("signatures")}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                        >
                                            <Plus size={13} /> Signatures
                                        </button>
                                    </div>
                                </div>

                                {/* Blocks Stack */}
                                <div className="space-y-4">
                                    {blocks.map((block, idx) => (
                                        <div key={block.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative group">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] flex items-center justify-center font-black">{idx + 1}</span>
                                                    {block.type.replace("_", " ")} Block
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(idx, -1)}
                                                        disabled={idx === 0}
                                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <MoveUp size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(idx, 1)}
                                                        disabled={idx === blocks.length - 1}
                                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <MoveDown size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBlock(block.id)}
                                                        className="p-1 text-red-400 hover:text-red-600 cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Header Block Inputs */}
                                            {block.type === "header" && (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={block.annexNumber}
                                                        onChange={(e) => updateBlock(block.id, "annexNumber", e.target.value)}
                                                        placeholder="Annexure Number (e.g. Annexure-XI)"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={block.heading}
                                                        onChange={(e) => updateBlock(block.id, "heading", e.target.value)}
                                                        placeholder="Main Heading Title"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold uppercase"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={block.subtext}
                                                        onChange={(e) => updateBlock(block.id, "subtext", e.target.value)}
                                                        placeholder="Subtext e.g. (To be submitted on Official Letterhead)"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-500"
                                                    />
                                                </div>
                                            )}

                                            {/* Recipient / Letter To Block */}
                                            {block.type === "recipient" && (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={block.authority}
                                                            onChange={(e) => updateBlock(block.id, "authority", e.target.value)}
                                                            placeholder="Authority (e.g. {{tenderInvitingAuthority}})"
                                                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={block.department}
                                                            onChange={(e) => updateBlock(block.id, "department", e.target.value)}
                                                            placeholder="Department (e.g. {{departmentName}})"
                                                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={block.university}
                                                        onChange={(e) => updateBlock(block.id, "university", e.target.value)}
                                                        placeholder="University Address (e.g. Himachal Pradesh University, Shimla)"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={block.subject}
                                                        onChange={(e) => updateBlock(block.id, "subject", e.target.value)}
                                                        placeholder="Subject Line"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                                                    />
                                                </div>
                                            )}

                                            {/* Paragraph Block */}
                                            {block.type === "paragraph" && (
                                                <div className="space-y-1.5">
                                                    <textarea
                                                        rows={3}
                                                        value={block.text}
                                                        onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                                                    />
                                                </div>
                                            )}

                                            {/* Placeholder Box */}
                                            {block.type === "placeholder_box" && (
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={block.text}
                                                        onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                                                    />
                                                </div>
                                            )}

                                            {/* Key Values Profile */}
                                            {block.type === "key_values" && (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={block.title}
                                                        onChange={(e) => updateBlock(block.id, "title", e.target.value)}
                                                        placeholder="Table Title"
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                                                    />
                                                    {(block.items || []).map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={item.label}
                                                                onChange={(e) => {
                                                                    const newItems = [...block.items];
                                                                    newItems[itemIdx].label = e.target.value;
                                                                    updateBlock(block.id, "items", newItems);
                                                                }}
                                                                className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={item.value}
                                                                onChange={(e) => {
                                                                    const newItems = [...block.items];
                                                                    newItems[itemIdx].value = e.target.value;
                                                                    updateBlock(block.id, "items", newItems);
                                                                }}
                                                                className="w-1/2 px-2 py-1 border border-slate-300 rounded text-xs"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Stamp block */}
                                            {block.type === "stamp_box" && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500">Stamp Paper Notice Text</label>
                                                    <input
                                                        type="text"
                                                        value={block.text}
                                                        onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                    />
                                                </div>
                                            )}

                                            {/* Signatures block */}
                                            {block.type === "signatures" && (
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500">Left Column</label>
                                                        <input
                                                            type="text"
                                                            value={block.leftTitle}
                                                            onChange={(e) => updateBlock(block.id, "leftTitle", e.target.value)}
                                                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500">Right Column</label>
                                                        <input
                                                            type="text"
                                                            value={block.rightTitle}
                                                            onChange={(e) => updateBlock(block.id, "rightTitle", e.target.value)}
                                                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Live A4 Visual Preview */}
                    <div className="lg:col-span-6 p-6 bg-slate-100/70 overflow-y-auto flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Eye size={14} /> Live Document Preview
                        </span>
                        <div className="w-full max-w-[480px] bg-white p-6 rounded shadow-lg border-2 border-emerald-800 text-xs text-slate-900 leading-relaxed font-sans min-h-[500px]">
                            <div dangerouslySetInnerHTML={{ __html: getRenderedPreviewHtml() }} />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                    >
                        <Save size={15} /> Save to Annexures Master
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualAnnexureBuilder;
