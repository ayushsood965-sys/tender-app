import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const VisualAnnexureBuilder = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [code, setCode] = useState(initialData?.code || "");
    const [category, setCategory] = useState(initialData?.category || "general");
    const [applicableDocTypes, setApplicableDocTypes] = useState(initialData?.applicableDocTypes || ["all"]);
    const [description, setDescription] = useState(initialData?.description || "");
    const [changelog, setChangelog] = useState("");

    // Initial blocks
    const [blocks, setBlocks] = useState([
        {
            id: 1,
            type: "header",
            annexNumber: "Annexure-X",
            heading: "PROFORMA OF DECLARATION / UNDERTAKING",
            subtext: "(To be submitted on Bidder's Official Letterhead)",
        },
        {
            id: 2,
            type: "recipient",
            authority: "{{tenderInvitingAuthority}}",
            department: "{{departmentName}}",
            university: "Himachal Pradesh University, Summer Hill, Shimla - 171005",
            subject: "Undertaking for Tender No. {{tenderNo}} regarding {{tenderName}}",
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
            rightTitle: "Authorized Signatory with Seal",
        }
    ]);

    const VARIABLE_CHIPS = [
        { label: "Tender Name", token: "{{tenderName}}" },
        { label: "Tender No", token: "{{tenderNo}}" },
        { label: "Department", token: "{{departmentName}}" },
        { label: "Inviting Authority", token: "{{tenderInvitingAuthority}}" },
        { label: "EMD Amount", token: "{{emdAmount}}" },
        { label: "PBG Amount", token: "{{pbgAmount}}" },
        { label: "Bid Validity", token: "{{bidValidity}}" },
        { label: "Jurisdiction", token: "{{courtJurisdiction}}" },
    ];

    const addBlock = (type) => {
        const newId = Date.now();
        if (type === "header") {
            setBlocks([...blocks, { id: newId, type: "header", annexNumber: "Annexure", heading: "TITLE", subtext: "" }]);
        } else if (type === "paragraph") {
            setBlocks([...blocks, { id: newId, type: "paragraph", text: "Enter your legal clause text here..." }]);
        } else if (type === "stamp_box") {
            setBlocks([...blocks, { id: newId, type: "stamp_box", value: "50", text: "On ₹ 50/- Non-Judicial Stamp Paper Duly Notarized" }]);
        } else if (type === "table") {
            setBlocks([...blocks, {
                id: newId,
                type: "table",
                columns: ["Sr. No.", "Item Specification / Requirement", "Offered Parameter", "Compliance (Yes/No)"],
                rows: [
                    ["1.", "Standard Parameters as per Scope", "", "Yes"],
                    ["2.", "Warranty Period Compliance", "", "Yes"],
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

    const insertChipIntoBlock = (blockId, token) => {
        setBlocks(blocks.map(b => {
            if (b.id === blockId && b.type === "paragraph") {
                return { ...b, text: b.text + " " + token };
            }
            return b;
        }));
    };

    // Compile Blocks to Standard Clean HTML
    const compileToHtml = () => {
        let html = `<div style="font-size: 11pt; line-height: 1.5; color: #000; text-align: justify;">\n`;

        blocks.forEach(b => {
            if (b.type === "header") {
                html += `  <div style="text-align: center; margin-bottom: 14px;">\n`;
                if (b.annexNumber) html += `    <h2 style="font-size: 17px; font-weight: bold; text-decoration: underline; margin-bottom: 3px;">${b.annexNumber}</h2>\n`;
                if (b.heading) html += `    <h3 style="font-size: 15px; font-weight: bold;">${b.heading}</h3>\n`;
                if (b.subtext) html += `    <p style="font-size: 10pt; color: #555;">${b.subtext}</p>\n`;
                html += `  </div>\n`;
            } else if (b.type === "recipient") {
                html += `  <p style="margin-bottom: 10px;"><strong>To</strong><br/>The ${b.authority || "{{tenderInvitingAuthority}}" },<br/>${b.department || "{{departmentName}}"},<br/>${b.university || "Himachal Pradesh University, Shimla - 171005"}.</p>\n`;
                if (b.subject) html += `  <p style="margin-bottom: 12px;"><strong>Subject:</strong> ${b.subject}</p>\n`;
                html += `  <p style="margin-bottom: 10px;">Sir/Madam,</p>\n`;
            } else if (b.type === "paragraph") {
                html += `  <p style="margin-bottom: 10px;">${b.text}</p>\n`;
            } else if (b.type === "stamp_box") {
                html += `  <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 10px; text-align: center; margin-bottom: 14px; font-weight: bold; font-size: 10pt; color: #334155;">[ ${b.text} ]</div>\n`;
            } else if (b.type === "table") {
                html += `  <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10pt;">\n    <thead>\n      <tr>\n`;
                b.columns.forEach(col => {
                    html += `        <th style="border: 1px solid black; padding: 6px 8px; background: #f0f0f0; font-weight: bold;">${col}</th>\n`;
                });
                html += `      </tr>\n    </thead>\n    <tbody>\n`;
                b.rows.forEach(row => {
                    html += `      <tr>\n`;
                    row.forEach(cell => {
                        html += `        <td style="border: 1px solid black; padding: 6px 8px;">${cell}</td>\n`;
                    });
                    html += `      </tr>\n`;
                });
                html += `    </tbody>\n  </table>\n`;
            } else if (b.type === "signatures") {
                html += `  <div style="display: flex; justify-content: space-between; margin-top: 36px;">\n`;
                html += `    <div><p><strong>Date:</strong> _ _ / _ _ / 2026<br/><strong>Place:</strong> ______________</p></div>\n`;
                html += `    <div style="text-align: right;"><p style="margin-bottom: 24px;"><strong>Authorized Signatory:</strong> ___________________________</p><p><strong>${b.rightTitle || "Name & Seal"}:</strong> _________________________</p></div>\n`;
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

        const generatedHtml = compileToHtml();
        const payload = {
            id: initialData?.id || Date.now(),
            title: title,
            code: code || `ANNEX_${Date.now()}`,
            category: category,
            applicableDocTypes: applicableDocTypes,
            description: description || `Visual Proforma Annexure format: ${title}`,
            contentTemplate: generatedHtml,
            changelog: changelog || "Created via Visual Block Builder",
            isMaster: false,
        };

        onSave(payload);
    };

    if (!isOpen) return null;

    const compiledPreview = compileToHtml();

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
                            <h2 className="text-lg font-bold text-slate-900">Visual Annexure & Proforma Builder</h2>
                            <p className="text-xs text-slate-500">Construct custom proformas using visual blocks without writing HTML code.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body: 2 Columns (Editor Left, Live Preview Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
                    {/* Left: Block Controls & Configuration */}
                    <div className="lg:col-span-6 p-6 overflow-y-auto space-y-6 border-r border-slate-200">
                        {/* Meta Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Annexure Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Annexure-XII: Declaration of Ethical Standards"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="general">General</option>
                                    <option value="undertaking">Undertaking / Declaration</option>
                                    <option value="eligibility">Eligibility / MAF</option>
                                    <option value="financial">Financial</option>
                                    <option value="technical">Technical</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Applicable Document Types</label>
                                <select
                                    value={applicableDocTypes[0] || "all"}
                                    onChange={(e) => setApplicableDocTypes([e.target.value])}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="all">All Document Types</option>
                                    <option value="Limited Tender Document">Limited Tender Document</option>
                                    <option value="GeM ATC Document">GeM ATC Document</option>
                                    <option value="e-tender Document">e-tender Document</option>
                                </select>
                            </div>
                        </div>

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
                                    onClick={() => addBlock("paragraph")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Plus size={13} /> Legal Paragraph
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
                                    <Table size={13} /> Compliance Table
                                </button>
                                <button
                                    type="button"
                                    onClick={() => addBlock("signatures")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Plus size={13} /> Signature Block
                                </button>
                            </div>
                        </div>

                        {/* Blocks Stack */}
                        <div className="space-y-4">
                            {blocks.map((block, idx) => (
                                <div key={block.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                {block.type}
                                            </span>
                                            <span className="text-xs font-bold text-slate-700">Block #{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveBlock(idx, -1)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                                                <MoveUp size={13} />
                                            </button>
                                            <button onClick={() => moveBlock(idx, 1)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                                                <MoveDown size={13} />
                                            </button>
                                            <button onClick={() => removeBlock(block.id)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Header block fields */}
                                    {block.type === "header" && (
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500">Annexure No.</label>
                                                <input
                                                    type="text"
                                                    value={block.annexNumber}
                                                    onChange={(e) => updateBlock(block.id, "annexNumber", e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500">Heading</label>
                                                <input
                                                    type="text"
                                                    value={block.heading}
                                                    onChange={(e) => updateBlock(block.id, "heading", e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Paragraph block */}
                                    {block.type === "paragraph" && (
                                        <div className="space-y-2">
                                            <textarea
                                                rows={3}
                                                value={block.text}
                                                onChange={(e) => updateBlock(block.id, "text", e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[10px] font-bold text-slate-400">Insert Variable:</span>
                                                {VARIABLE_CHIPS.map(chip => (
                                                    <button
                                                        key={chip.token}
                                                        type="button"
                                                        onClick={() => insertChipIntoBlock(block.id, chip.token)}
                                                        className="text-[10px] bg-slate-100 hover:bg-purple-100 text-purple-800 font-medium px-2 py-0.5 rounded cursor-pointer transition-colors"
                                                    >
                                                        {chip.label}
                                                    </button>
                                                ))}
                                            </div>
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

                    {/* Right: Live A4 Visual Preview */}
                    <div className="lg:col-span-6 p-6 bg-slate-100/70 overflow-y-auto flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Eye size={14} /> Live Document Preview
                        </span>
                        <div className="w-full max-w-[480px] bg-white p-6 rounded shadow-lg border-2 border-emerald-800 text-xs text-slate-900 leading-relaxed font-serif min-h-[500px]">
                            <div dangerouslySetInnerHTML={{ __html: compiledPreview }} />
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
                        <Save size={15} /> Save to Annexures Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualAnnexureBuilder;
