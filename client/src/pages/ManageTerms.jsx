import React, { useState, useEffect, useRef } from "react";
import {
    Database,
    Plus,
    Edit2,
    Trash2,
    Save,
    Search,
    Filter,
    RefreshCw,
    Paperclip,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    Eye,
    X,
    Sparkles,
} from "lucide-react";
import {
    fetchDashboardData,
    fetchAnnexures,
    createTerm,
    updateTerm,
    deleteTerm,
    uploadAnnexure,
    createAnnexure,
    updateAnnexure,
    deprecateAnnexure,
    fetchAnnexureHistory,
} from "../services/api";
import VisualAnnexureBuilder from "../components/VisualAnnexureBuilder";

const ManageTerms = () => {
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [annexures, setAnnexures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Annexure Upload & Visual Builder State
    const [annexureMode, setAnnexureMode] = useState("existing"); // 'existing' | 'upload'
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [previewAnnexure, setPreviewAnnexure] = useState(null);
    const [isVisualBuilderOpen, setIsVisualBuilderOpen] = useState(false);
    const [editingAnnexureData, setEditingAnnexureData] = useState(null);

    const handleSaveVisualAnnexure = async (payload) => {
        try {
            let saved;
            if (payload.id && annexures.some(a => a.id === payload.id)) {
                saved = await updateAnnexure(payload.id, payload);
            } else {
                saved = await createAnnexure(payload);
            }
            setIsVisualBuilderOpen(false);
            setEditingAnnexureData(null);
            await loadData();
            setTermForm(prev => ({
                ...prev,
                hasAnnexure: true,
                annexureId: saved.id,
                annexureTitle: saved.title,
            }));
            alert("Annexure saved successfully!");
        } catch (err) {
            console.error("Save annexure error:", err);
            alert("Failed to save annexure: " + err.message);
        }
    };

    const [termForm, setTermForm] = useState({
        id: null,
        categoryId: "",
        title: "",
        description: "",
        hasAnnexure: false,
        annexureId: null,
        annexureTitle: "",
    });

    const formRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setCategories(data.categories || []);
            setTerms(data.terms || []);
            const annexData = await fetchAnnexures();
            setAnnexures(annexData || []);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) =>
        setTermForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAnnexureToggle = (e) => {
        const checked = e.target.checked;
        setTermForm((prev) => ({
            ...prev,
            hasAnnexure: checked,
            annexureId: checked ? prev.annexureId || (annexures[0] ? annexures[0].id : null) : null,
            annexureTitle: checked ? (prev.annexureTitle || (annexures[0] ? annexures[0].title : "")) : "",
        }));
    };

    const handleAnnexureSelect = (e) => {
        const selectedId = Number(e.target.value);
        const selectedAnnexure = annexures.find((a) => a.id === selectedId);
        setTermForm((prev) => ({
            ...prev,
            annexureId: selectedId || null,
            annexureTitle: selectedAnnexure ? selectedAnnexure.title : "",
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDoc(true);
        setUploadSuccess(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", termForm.title ? `Annexure for ${termForm.title}` : file.name.replace(/\.[^/.]+$/, ""));
        formData.append("category", "custom");
        formData.append("applicableDocTypes", JSON.stringify(["all"]));

        try {
            const createdAnnexure = await uploadAnnexure(formData);
            setAnnexures((prev) => [...prev, createdAnnexure]);
            setTermForm((prev) => ({
                ...prev,
                hasAnnexure: true,
                annexureId: createdAnnexure.id,
                annexureTitle: createdAnnexure.title,
            }));
            setUploadSuccess(`Successfully parsed & created "${createdAnnexure.title}"!`);
            setAnnexureMode("existing");
        } catch (err) {
            console.error("File upload error:", err);
            alert("Failed to upload and parse document: " + err.message);
        } finally {
            setUploadingDoc(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termForm.title || !termForm.categoryId) return;

        try {
            const sanitizeDescription = (text) => {
                if (!text) return "";
                return text.replace(/<\/?(b|strong)[^>]*>/gi, "");
            };

            const payload = {
                ...termForm,
                description: sanitizeDescription(termForm.description),
                categoryId: Number(termForm.categoryId),
                hasAnnexure: Boolean(termForm.hasAnnexure),
                annexureId: termForm.hasAnnexure ? Number(termForm.annexureId) : null,
                annexureTitle: termForm.hasAnnexure ? termForm.annexureTitle : null,
            };

            if (termForm.id) {
                // Update
                const updated = await updateTerm(termForm.id, payload);
                setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            } else {
                // Create
                const newTerm = await createTerm(payload);
                setTerms((prev) => [...prev, newTerm]);
            }
            resetForm();
        } catch (err) {
            console.error("Failed to save term", err);
            alert("Failed to save term: " + (err.message || "Unknown error"));
        }
    };

    const handleEdit = (term) => {
        setTermForm({
            id: term.id,
            categoryId: term.categoryId || "",
            title: term.title || "",
            description: term.description || "",
            hasAnnexure: Boolean(term.hasAnnexure),
            annexureId: term.annexureId || null,
            annexureTitle: term.annexureTitle || "",
        });
        setIsEditing(true);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this term?")) return;
        try {
            await deleteTerm(id);
            setTerms((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error("Failed to delete term", err);
            alert("Failed to delete term");
        }
    };

    const resetForm = () => {
        setTermForm({
            id: null,
            categoryId: "",
            title: "",
            description: "",
            hasAnnexure: false,
            annexureId: null,
            annexureTitle: "",
        });
        setIsEditing(false);
        setUploadSuccess(null);
    };

    const filteredTerms = terms.filter((term) => {
        const matchesCategory =
            activeCategoryFilter === null || term.categoryId === activeCategoryFilter;
        const matchesSearch =
            term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (term.annexureTitle && term.annexureTitle.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        T&C & Annexure Master
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Create, link and manage global Terms & Conditions with attached Annexures & Formats.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingAnnexureData(null);
                        setIsVisualBuilderOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <PenTool size={14} /> Visual Proforma Builder
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div
                        ref={formRef}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            {isEditing ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                            {isEditing ? "Edit Term & Annexure" : "Add New Term & Annexure"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="categoryId"
                                    value={termForm.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Title / Clause Heading <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={termForm.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. Non-Blacklisting Declaration"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Description / Clause Content
                                </label>
                                <textarea
                                    name="description"
                                    value={termForm.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-normal"
                                    placeholder="Enter the detailed term text. Use {{placeholder}} to define dynamic fields..."
                                ></textarea>
                            </div>

                            {/* VARIABLE & PLACEHOLDER CRITERIA GUIDE */}
                            <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Dynamic Variables Criteria Guide</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Define dynamic custom variables by enclosing variable names in double curly braces <code className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">{"{{placeholder}}"}</code>. During tender creation, an input field will automatically be populated for each placeholder upon clause selection.
                                </p>
                                <div className="pt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Quick Insert Placeholders:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "value of tender",
                                            "warranty_period",
                                            "delivery_days",
                                            "delivery_location",
                                            "inspection_authority",
                                            "performance_guarantee_percent",
                                        ].map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => {
                                                    setTermForm((prev) => ({
                                                        ...prev,
                                                        description: (prev.description ? prev.description + " " : "") + `{{${tag}}}`,
                                                    }));
                                                }}
                                                className="text-[10.5px] font-mono bg-white hover:bg-indigo-600 hover:text-white px-2 py-0.5 rounded-lg border border-indigo-200 text-indigo-700 font-semibold transition-all cursor-pointer shadow-2xs"
                                                title={`Click to append {{${tag}}}`}
                                            >
                                                + {"{{" + tag + "}}"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ANNEXURE LINKING SECTION */}
                            <div className="border-t border-slate-100 pt-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-4 h-4 text-purple-600" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Annexure Required?</p>
                                            <p className="text-[11px] text-slate-500">Require an attached format/form</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termForm.hasAnnexure}
                                            onChange={handleAnnexureToggle}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                {termForm.hasAnnexure && (
                                    <div className="mt-3 p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAnnexureMode("existing")}
                                                className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all ${
                                                    annexureMode === "existing"
                                                        ? "bg-purple-600 text-white shadow-xs"
                                                        : "bg-white text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                Select Library
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAnnexureMode("upload")}
                                                className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-all ${
                                                    annexureMode === "upload"
                                                        ? "bg-purple-600 text-white shadow-xs"
                                                        : "bg-white text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                <Upload className="w-3 h-3 inline mr-1" /> Upload Doc
                                            </button>
                                        </div>

                                        {annexureMode === "existing" ? (
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                    Attached Annexure Template
                                                </label>
                                                <select
                                                    value={termForm.annexureId || ""}
                                                    onChange={handleAnnexureSelect}
                                                    className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg outline-none text-xs bg-white text-slate-800 font-medium"
                                                >
                                                    <option value="">-- Choose Annexure --</option>
                                                    {annexures.map((a) => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                {termForm.annexureId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const a = annexures.find((x) => x.id === termForm.annexureId);
                                                            if (a) setPreviewAnnexure(a);
                                                        }}
                                                        className="mt-1.5 text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" /> Preview Annexure Template
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                    Upload Document (.docx, .pdf, .txt)
                                                </label>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".docx,.doc,.pdf,.txt"
                                                    onChange={handleFileUpload}
                                                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                                                />
                                                {uploadingDoc && (
                                                    <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold mt-1">
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        Parsing document and converting to template...
                                                    </div>
                                                )}
                                                {uploadSuccess && (
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {uploadSuccess}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing ? "Update Term" : "Save Term"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            <button
                                onClick={() => setActiveCategoryFilter(null)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                    activeCategoryFilter === null
                                        ? "bg-slate-800 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                All Categories ({terms.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                                        activeCategoryFilter === cat.id
                                            ? "bg-purple-600 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search terms or annexures..."
                                className="w-full pl-9 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : filteredTerms.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500 text-sm">No terms found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {filteredTerms.map((term) => {
                                const catName =
                                    categories.find((c) => c.id === term.categoryId)?.name ||
                                    "General";
                                const linkedAnnex = annexures.find((a) => a.id === term.annexureId);

                                return (
                                    <div
                                        key={term.id}
                                        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                                                    {catName}
                                                </span>
                                                {term.mandatory && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                                        Mandatory
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(term)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Term"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(term.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Term"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-bold text-slate-800 mb-1.5">
                                            {term.title}
                                        </h3>
                                        <p className="text-slate-600 text-xs whitespace-pre-wrap leading-relaxed">
                                            {term.description}
                                        </p>

                                        {term.hasAnnexure && (
                                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    <span className="font-bold">Attached Annexure:</span>
                                                    <span>{term.annexureTitle || linkedAnnex?.title || "Custom Annexure"}</span>
                                                </div>
                                                {linkedAnnex && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewAnnexure(linkedAnnex)}
                                                        className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Eye className="w-3 h-3" /> Preview
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ANNEXURE PREVIEW MODAL */}
            {previewAnnexure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div>
                                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {previewAnnexure.category} Annexure
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{previewAnnexure.title}</h3>
                            </div>
                            <button
                                onClick={() => setPreviewAnnexure(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
                            <div
                                className="border border-slate-200 rounded-xl p-6 bg-slate-50/50"
                                dangerouslySetInnerHTML={{ __html: previewAnnexure.contentTemplate }}
                            />
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setPreviewAnnexure(null)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VISUAL ANNEXURE BUILDER MODAL */}
            <VisualAnnexureBuilder
                isOpen={isVisualBuilderOpen}
                onClose={() => {
                    setIsVisualBuilderOpen(false);
                    setEditingAnnexureData(null);
                }}
                onSave={handleSaveVisualAnnexure}
                initialData={editingAnnexureData}
            />
        </div>
    );
};

export default ManageTerms;
