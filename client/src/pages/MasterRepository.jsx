import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    fetchDashboardData,
    createTerm,
    updateTerm,
    deleteTerm,
    createCategory,
    fetchAnnexures,
    createAnnexure,
    updateAnnexure,
    deleteAnnexure,
} from "../services/api";
import {
    ScrollText,
    Search,
    Plus,
    Shield,
    User,
    Edit3,
    Trash2,
    Lock,
    Sparkles,
    CheckCircle2,
    Filter,
    Layers,
    X,
    Building2,
    FileText,
    Copy,
    Eye,
    CheckSquare,
    FileCheck2,
    FilePlus,
    ExternalLink,
    Paperclip,
} from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";
import VisualAnnexureBuilder from "../components/VisualAnnexureBuilder";

export default function MasterRepository() {
    const { user, isSuperAdmin } = useAuth();

    // Active Main Tab: "terms" or "annexures"
    const [activeMainTab, setActiveMainTab] = useState("terms");

    // Terms State
    const [categories, setCategories] = useState([]);
    const [terms, setTerms] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [filterSource, setFilterSource] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [termModal, setTermModal] = useState({ open: false, isEditing: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "", type: "term" });

    const [termFormData, setTermFormData] = useState({
        categoryId: "",
        title: "",
        description: "",
        code: "",
        isMandatory: false,
        isDocumentRequired: false,
        documentProofName: "",
        hasAnnexure: false,
        annexureId: null,
    });

    // Annexures Master State
    const [annexures, setAnnexures] = useState([]);
    const [annexureSearchQuery, setAnnexureSearchQuery] = useState("");
    const [annexureCategoryFilter, setAnnexureCategoryFilter] = useState("all");
    const [annexureDocTypeFilter, setAnnexureDocTypeFilter] = useState("all");
    const [isVisualBuilderOpen, setIsVisualBuilderOpen] = useState(false);
    const [editingAnnexure, setEditingAnnexure] = useState(null);
    const [previewModalAnnexure, setPreviewModalAnnexure] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [data, annexList] = await Promise.all([
                fetchDashboardData(),
                fetchAnnexures()
            ]);
            setCategories(data.categories || []);
            setTerms(data.terms || []);
            setAnnexures(Array.isArray(annexList) ? annexList : []);
            if (data.categories?.length > 0 && !termFormData.categoryId) {
                setTermFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
            }
        } catch (err) {
            console.error("Failed to load master repository:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtered Terms
    const filteredTerms = terms.filter((term) => {
        if (selectedCategory !== "all" && term.categoryId !== parseInt(selectedCategory)) {
            return false;
        }

        if (filterSource === "master" && !term.isMaster) return false;
        if (filterSource === "custom" && term.isMaster) return false;
        if (filterSource === "my" && (term.isMaster || term.userId !== user?.id)) return false;
        if (filterSource === "docRequired" && !term.isDocumentRequired) return false;
        if (filterSource === "mandatory" && !term.isMandatory && !term.mandatory) return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                (term.title && term.title.toLowerCase().includes(q)) ||
                (term.description && term.description.toLowerCase().includes(q)) ||
                (term.documentProofName && term.documentProofName.toLowerCase().includes(q)) ||
                (term.code && term.code.toLowerCase().includes(q))
            );
        }

        return true;
    });

    // Filtered Annexures
    const filteredAnnexures = annexures.filter((annex) => {
        if (annexureCategoryFilter !== "all" && annex.category !== annexureCategoryFilter) {
            return false;
        }

        if (annexureDocTypeFilter !== "all") {
            const types = annex.applicableDocTypes || ["all"];
            if (!types.includes("all") && !types.includes(annexureDocTypeFilter)) {
                return false;
            }
        }

        if (annexureSearchQuery.trim()) {
            const q = annexureSearchQuery.toLowerCase();
            return (
                (annex.title && annex.title.toLowerCase().includes(q)) ||
                (annex.description && annex.description.toLowerCase().includes(q)) ||
                (annex.code && annex.code.toLowerCase().includes(q))
            );
        }

        return true;
    });

    const handleOpenAddTerm = () => {
        setTermFormData({
            categoryId: categories[0]?.id || 1,
            title: "",
            description: "",
            code: "",
            isMandatory: false,
            isDocumentRequired: false,
            documentProofName: "",
            hasAnnexure: false,
            annexureId: null,
        });
        setTermModal({ open: true, isEditing: false, data: null });
    };

    const handleOpenEditTerm = (term) => {
        setTermFormData({
            categoryId: term.categoryId,
            title: term.title,
            description: term.description || "",
            code: term.code || "",
            isMandatory: term.isMandatory || term.mandatory || false,
            isDocumentRequired: term.isDocumentRequired || false,
            documentProofName: term.documentProofName || "",
            hasAnnexure: term.hasAnnexure || false,
            annexureId: term.annexureId || null,
        });
        setTermModal({ open: true, isEditing: true, data: term });
    };

    const handleSaveTerm = async (e) => {
        e.preventDefault();
        try {
            if (termModal.isEditing) {
                const updated = await updateTerm(termModal.data.id, termFormData);
                setTerms((prev) => prev.map((t) => (t.id === termModal.data.id ? updated : t)));
            } else {
                const created = await createTerm(termFormData);
                setTerms((prev) => [...prev, created]);
            }
            setTermModal({ open: false, isEditing: false, data: null });
        } catch (err) {
            alert(err.message || "Failed to save clause");
        }
    };

    const handleDeleteItem = async () => {
        if (!deleteModal.id) return;
        try {
            if (deleteModal.type === "annexure") {
                await deleteAnnexure(deleteModal.id);
                setAnnexures((prev) => prev.filter((a) => a.id !== deleteModal.id));
            } else {
                await deleteTerm(deleteModal.id);
                setTerms((prev) => prev.filter((t) => t.id !== deleteModal.id));
            }
            setDeleteModal({ open: false, id: null, title: "", type: "term" });
        } catch (err) {
            alert(err.message || "Failed to delete item");
        }
    };

    // Annexure Builder Save Handler
    const handleSaveAnnexureFromBuilder = async (annexData) => {
        try {
            if (editingAnnexure && editingAnnexure.id) {
                const updated = await updateAnnexure(editingAnnexure.id, annexData);
                setAnnexures((prev) => prev.map((a) => (a.id === editingAnnexure.id ? updated : a)));
            } else {
                const created = await createAnnexure(annexData);
                setAnnexures((prev) => [...prev, created]);
            }
            setIsVisualBuilderOpen(false);
            setEditingAnnexure(null);
        } catch (err) {
            alert(err.message || "Failed to save annexure template");
        }
    };

    const handleDuplicateAnnexure = async (annex) => {
        try {
            const duplicatePayload = {
                title: `${annex.title} (Copy)`,
                code: `ANNEX_COPY_${Date.now()}`,
                category: annex.category || "general",
                applicableDocTypes: annex.applicableDocTypes || ["all"],
                description: `Copy of ${annex.title}`,
                contentTemplate: annex.contentTemplate || `<p>${annex.title}</p>`,
                isTable: annex.isTable || false,
                tableColumns: annex.tableColumns || [],
                isMaster: false,
            };
            const created = await createAnnexure(duplicatePayload);
            setAnnexures((prev) => [...prev, created]);
        } catch (err) {
            alert("Failed to duplicate annexure: " + err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">
                            Delete {deleteModal.type === "annexure" ? "Annexure" : "Clause"}?
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteModal.title}"</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, id: null, title: "", type: "term" })}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteItem}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Annexure Builder Modal */}
            <VisualAnnexureBuilder
                isOpen={isVisualBuilderOpen}
                onClose={() => {
                    setIsVisualBuilderOpen(false);
                    setEditingAnnexure(null);
                }}
                onSave={handleSaveAnnexureFromBuilder}
                initialData={editingAnnexure}
            />

            {/* Annexure Preview Modal */}
            {previewModalAnnexure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{previewModalAnnexure.title}</h3>
                                <p className="text-[11px] text-slate-500 font-mono">Code: {previewModalAnnexure.code || "N/A"}</p>
                            </div>
                            <button
                                onClick={() => setPreviewModalAnnexure(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-slate-100/50 flex-1">
                            <div
                                className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto"
                                dangerouslySetInnerHTML={{ __html: previewModalAnnexure.contentTemplate || "<p>No preview available</p>" }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Clause Modal */}
            {termModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
                    <div className="bg-white border border-purple-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative my-8">
                        <button
                            onClick={() => setTermModal({ open: false, isEditing: false, data: null })}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-black text-slate-900 mb-1">
                            {termModal.isEditing ? "Edit Clause" : "Add New Clause to Shared Repository"}
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            This clause will be immediately available in the central master repository for all departments.
                        </p>

                        <form onSubmit={handleSaveTerm} className="space-y-4">
                            <div>
                                <SearchableSelect
                                    label="Select Category"
                                    required
                                    options={categories.map((c) => ({
                                        value: c.id,
                                        label: c.name,
                                        badge: `Cat #${c.id}`,
                                    }))}
                                    value={termFormData.categoryId}
                                    onChange={(val) => setTermFormData({ ...termFormData, categoryId: parseInt(val) })}
                                    placeholder="Search or pick a category..."
                                    searchPlaceholder="Live search category name..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Clause Title <span className="text-purple-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={termFormData.title}
                                    onChange={(e) => setTermFormData({ ...termFormData, title: e.target.value })}
                                    placeholder="e.g. Mandatory On-site Demonstration & Training"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Clause Description / Content <span className="text-purple-600">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={termFormData.description}
                                    onChange={(e) => setTermFormData({ ...termFormData, description: e.target.value })}
                                    placeholder="Enter full clause text. Use {{placeholder}} for dynamic fields..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-normal"
                                />
                            </div>

                            {/* COMPLIANCE & ELIGIBILITY METADATA CHECKBOXES */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                    Compliance & Eligibility Criteria Settings:
                                </span>

                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termFormData.isMandatory}
                                            onChange={(e) => setTermFormData({ ...termFormData, isMandatory: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">Mandatory Clause</span>
                                            <span className="text-[11px] text-slate-500">Always selected by default for new tenders</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termFormData.isDocumentRequired}
                                            onChange={(e) => setTermFormData({ ...termFormData, isDocumentRequired: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 rounded-md border-slate-300 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">Requires Document Proof / Attachment</span>
                                            <span className="text-[11px] text-slate-500">Auto-adds this requirement to Annexure-I Compliance Sheet</span>
                                        </div>
                                    </label>
                                </div>

                                {termFormData.isDocumentRequired && (
                                    <div className="pt-2 border-t border-slate-200 space-y-1.5 animate-in fade-in">
                                        <label className="block text-[11px] font-bold text-slate-700">
                                            Document Proof Name / Description *
                                        </label>
                                        <input
                                            type="text"
                                            value={termFormData.documentProofName}
                                            onChange={(e) => setTermFormData({ ...termFormData, documentProofName: e.target.value })}
                                            placeholder="e.g. Valid PAN Card & GST Registration Certificate"
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {[
                                                "Valid PAN Card & GST Registration Certificate",
                                                "Audited Balance Sheets (Last 3 Years)",
                                                "Copies of Purchase Orders & Completion Certificates",
                                                "Income Tax Returns (ITR for 3 Years)",
                                                "Non-Blacklisting Notarized Affidavit",
                                            ].map((suggest) => (
                                                <button
                                                    key={suggest}
                                                    type="button"
                                                    onClick={() => setTermFormData({ ...termFormData, documentProofName: suggest })}
                                                    className="text-[10px] bg-slate-200/70 hover:bg-purple-100 hover:text-purple-800 px-2 py-0.5 rounded text-slate-700 font-medium transition-colors"
                                                >
                                                    + {suggest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTermModal({ open: false, isEditing: false, data: null })}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                                >
                                    {termModal.isEditing ? "Save Changes" : "Create Clause"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header with Main Tab Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Master Repository Studio</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Centrally managed university repository for Clauses, Terms, and Official Annexure Proformas.
                    </p>
                </div>

                {/* Primary Tab Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setActiveMainTab("terms")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeMainTab === "terms"
                                ? "bg-white text-purple-700 shadow-sm border border-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <ScrollText className="w-4 h-4" />
                        <span>Clauses & Terms ({terms.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveMainTab("annexures")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeMainTab === "annexures"
                                ? "bg-white text-purple-700 shadow-sm border border-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        <span>Annexures Master ({annexures.length})</span>
                    </button>
                </div>
            </div>

            {/* ========================================================= */}
            {/* TAB 1: CLAUSES & TERMS MASTER                             */}
            {/* ========================================================= */}
            {activeMainTab === "terms" && (
                <div className="space-y-4">
                    {/* Filter and Search Bar */}
                    <div className="bg-white border border-purple-100/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clause title, text, code, proof..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                            {[
                                { key: "all", label: "All Clauses" },
                                { key: "docRequired", label: "Doc Proof Required" },
                                { key: "mandatory", label: "Mandatory" },
                                { key: "master", label: "System Master" },
                                { key: "custom", label: "User Custom" },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilterSource(f.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        filterSource === f.key
                                            ? "bg-purple-100 text-purple-800 border border-purple-300 shadow-xs"
                                            : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/60 border border-transparent"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleOpenAddTerm}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Clause</span>
                        </button>
                    </div>

                    {/* Main Content Layout: Categories Sidebar + Clauses Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Categories Column */}
                        <div className="bg-white border border-purple-100/80 rounded-3xl p-4 lg:p-5 h-fit space-y-2 shadow-sm">
                            <div className="pb-2 border-b border-purple-100 space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Categories ({categories.length})
                                </h3>
                                <SearchableSelect
                                    options={[
                                        { value: "all", label: "All Categories", badge: `${terms.length}` },
                                        ...categories.map((c) => ({
                                            value: c.id.toString(),
                                            label: c.name,
                                            badge: `${terms.filter((t) => t.categoryId === c.id).length}`,
                                        }))
                                    ]}
                                    value={selectedCategory}
                                    onChange={(val) => setSelectedCategory(val || "all")}
                                    placeholder="Jump to category..."
                                    searchPlaceholder="Search category..."
                                />
                            </div>

                            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                        selectedCategory === "all"
                                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                                            : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                                    }`}
                                >
                                    <span>All Categories</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                                        {terms.length}
                                    </span>
                                </button>

                                {categories.map((cat) => {
                                    const count = terms.filter((t) => t.categoryId === cat.id).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id.toString())}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                                selectedCategory === cat.id.toString()
                                                    ? "bg-purple-100 text-purple-800 font-bold border border-purple-200"
                                                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                                            }`}
                                        >
                                            <span className="truncate pr-2">{cat.name}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 font-bold">
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Clauses Grid */}
                        <div className="lg:col-span-3 space-y-4">
                            {loading ? (
                                <div className="py-20 text-center text-slate-400 text-sm">
                                    Loading clauses...
                                </div>
                            ) : filteredTerms.length === 0 ? (
                                <div className="bg-white border border-dashed border-slate-300 rounded-3xl py-16 text-center shadow-xs">
                                    <ScrollText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-slate-800">No Clauses Found</h3>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                        No clauses match your filter criteria. Click "Add New Clause" to add one!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredTerms.map((term) => {
                                        const cat = categories.find((c) => c.id === term.categoryId);
                                        const canEditOrDelete = isSuperAdmin || (!term.isMaster && term.userId === user?.id);

                                        return (
                                            <div
                                                key={term.id}
                                                className="bg-white border border-purple-100/80 hover:border-purple-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-2.5"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {term.isMaster ? (
                                                                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                                                                    <Lock className="w-2.5 h-2.5" />
                                                                    System Master
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                                                    <User className="w-2.5 h-2.5" />
                                                                    {term.createdByName || "Custom"}
                                                                </span>
                                                            )}

                                                            {term.isMandatory && (
                                                                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                                    Mandatory
                                                                </span>
                                                            )}

                                                            {term.isDocumentRequired && (
                                                                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                                                    <Paperclip className="w-2.5 h-2.5" />
                                                                    Proof Required
                                                                </span>
                                                            )}

                                                            {cat && (
                                                                <span className="text-[10.5px] font-medium text-slate-500">
                                                                    • {cat.name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="text-sm font-black text-slate-900">
                                                            {term.title}
                                                        </h4>

                                                        <p className="text-xs text-slate-600 leading-relaxed text-justify">
                                                            {term.description}
                                                        </p>

                                                        {term.isDocumentRequired && term.documentProofName && (
                                                            <div className="text-[11px] font-semibold text-amber-900 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 mt-1.5 w-fit">
                                                                <FileCheck2 className="w-3.5 h-3.5 text-amber-700" />
                                                                <span>Required Proof: <strong>{term.documentProofName}</strong></span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                                                        {canEditOrDelete ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOpenEditTerm(term)}
                                                                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors cursor-pointer"
                                                                    title="Edit Clause"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteModal({ open: true, id: term.id, title: term.title, type: "term" })}
                                                                    className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                                                                    title="Delete Clause"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                                                <Lock className="w-3 h-3 text-slate-400" />
                                                                Protected
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: ANNEXURES & PROFORMAS MASTER                       */}
            {/* ========================================================= */}
            {activeMainTab === "annexures" && (
                <div className="space-y-4">
                    {/* Annexure Search & Category Filter Bar */}
                    <div className="bg-white border border-purple-100/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={annexureSearchQuery}
                                onChange={(e) => setAnnexureSearchQuery(e.target.value)}
                                placeholder="Search annexure title, code, description..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                            />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                            {[
                                { key: "all", label: "All Annexures" },
                                { key: "eligibility", label: "Eligibility" },
                                { key: "financial", label: "Financial / EMD" },
                                { key: "undertaking", label: "Undertakings" },
                                { key: "technical", label: "Technical" },
                                { key: "custom", label: "Custom" },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setAnnexureCategoryFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                        annexureCategoryFilter === f.key
                                            ? "bg-purple-100 text-purple-800 border border-purple-300 shadow-xs"
                                            : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/60 border border-transparent"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Create Annexure Button */}
                        <button
                            onClick={() => {
                                setEditingAnnexure(null);
                                setIsVisualBuilderOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Design New Annexure</span>
                        </button>
                    </div>

                    {/* Annexure Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAnnexures.map((annex) => {
                            const canEdit = isSuperAdmin || !annex.isMaster;

                            return (
                                <div
                                    key={annex.id}
                                    className="bg-white border border-purple-100/80 hover:border-purple-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                                {annex.category || "General"}
                                            </span>
                                            {annex.isMaster ? (
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                                                    Master
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                    Custom
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-sm font-black text-slate-900 line-clamp-2">
                                            {annex.title}
                                        </h4>

                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {annex.description || "Official proforma template format for tender bid submission."}
                                        </p>

                                        <div className="pt-2 flex flex-wrap gap-1">
                                            {(annex.applicableDocTypes || ["all"]).map((dtype) => (
                                                <span
                                                    key={dtype}
                                                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                                                >
                                                    {dtype === "all" ? "All Formats" : dtype}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => setPreviewModalAnnexure(annex)}
                                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Preview</span>
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleDuplicateAnnexure(annex)}
                                                className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                                title="Duplicate Annexure"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>

                                            {canEdit && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingAnnexure(annex);
                                                            setIsVisualBuilderOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit in Visual Builder"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, id: annex.id, title: annex.title, type: "annexure" })}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Annexure"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
