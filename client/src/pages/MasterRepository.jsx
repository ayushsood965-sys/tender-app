import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardData, createTerm, updateTerm, deleteTerm, createCategory } from "../services/api";
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
} from "lucide-react";

export default function MasterRepository() {
    const { user, isSuperAdmin } = useAuth();

    const [categories, setCategories] = useState([]);
    const [terms, setTerms] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [filterSource, setFilterSource] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [termModal, setTermModal] = useState({ open: false, isEditing: false, data: null });
    const [catModal, setCatModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "" });

    const [termFormData, setTermFormData] = useState({
        categoryId: "",
        title: "",
        description: "",
        code: "",
    });
    const [catFormData, setCatFormData] = useState({
        name: "",
        description: "",
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setCategories(data.categories || []);
            setTerms(data.terms || []);
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

    const filteredTerms = terms.filter((term) => {
        if (selectedCategory !== "all" && term.categoryId !== parseInt(selectedCategory)) {
            return false;
        }

        if (filterSource === "master" && !term.isMaster) return false;
        if (filterSource === "custom" && term.isMaster) return false;
        if (filterSource === "my" && (term.isMaster || term.userId !== user?.id)) return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                (term.title && term.title.toLowerCase().includes(q)) ||
                (term.description && term.description.toLowerCase().includes(q)) ||
                (term.code && term.code.toLowerCase().includes(q))
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
        });
        setTermModal({ open: true, isEditing: false, data: null });
    };

    const handleOpenEditTerm = (term) => {
        setTermFormData({
            categoryId: term.categoryId,
            title: term.title,
            description: term.description || "",
            code: term.code || "",
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

    const handleDeleteTerm = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteTerm(deleteModal.id);
            setTerms((prev) => prev.filter((t) => t.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null, title: "" });
        } catch (err) {
            alert(err.message || "Failed to delete clause");
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
                        <h3 className="text-lg font-black text-slate-900 mb-1">Delete Clause?</h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteModal.title}"</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, id: null, title: "" })}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTerm}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Clause Modal */}
            {termModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white border border-purple-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setTermModal({ open: false, isEditing: false, data: null })}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-black text-slate-900 mb-1">
                            {termModal.isEditing ? "Edit Clause" : "Add New Clause to Shared Repository"}
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">
                            This clause will be immediately available in the central master repository for all departments to use.
                        </p>

                        <form onSubmit={handleSaveTerm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Select Category <span className="text-purple-600">*</span>
                                </label>
                                <select
                                    value={termFormData.categoryId}
                                    onChange={(e) => setTermFormData({ ...termFormData, categoryId: parseInt(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
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
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
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

                            {/* VARIABLE & PLACEHOLDER CRITERIA GUIDE */}
                            <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Dynamic Variables Criteria Guide</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Enclose custom variable names in double curly braces <code className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">{"{{placeholder}}"}</code>. When selected, an input box will automatically be created for tender creators.
                                </p>
                                <div className="pt-0.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Quick Tags:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {[
                                            "value of tender",
                                            "warranty_period",
                                            "delivery_days",
                                            "delivery_location",
                                            "inspection_authority",
                                        ].map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => {
                                                    setTermFormData((prev) => ({
                                                        ...prev,
                                                        description: (prev.description ? prev.description + " " : "") + `{{${tag}}}`,
                                                    }));
                                                }}
                                                className="text-[10px] font-mono bg-white hover:bg-purple-600 hover:text-white px-2 py-0.5 rounded-lg border border-purple-200 text-purple-700 font-semibold transition-all cursor-pointer"
                                            >
                                                + {"{{" + tag + "}}"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Master Clauses & Terms Repository</span>
                        <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {terms.length} Total Clauses
                        </span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Shared central repository for Himachal Pradesh University. All departments can view and insert any clause.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenAddTerm}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all transform active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Clause</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-purple-100/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clause title, text, code..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                </div>

                {/* Source Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                        { key: "all", label: "All Clauses" },
                        { key: "master", label: "System Master" },
                        { key: "custom", label: "User Custom" },
                        { key: "my", label: "My Created Clauses" },
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
            </div>

            {/* Main Content Layout: Categories Sidebar + Clauses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Column */}
                <div className="bg-white border border-purple-100/80 rounded-3xl p-4 lg:p-5 h-fit space-y-2 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Categories ({categories.length})
                        </h3>
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
                                        className="bg-white border border-purple-100/80 hover:border-purple-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {term.isMaster ? (
                                                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            System Master (Protected)
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                                            <User className="w-2.5 h-2.5" />
                                                            Added by: {term.createdByName || "User"}
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
                                                            onClick={() => setDeleteModal({ open: true, id: term.id, title: term.title })}
                                                            className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                                                            title="Delete Clause"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                                        <Lock className="w-3 h-3 text-slate-400" />
                                                        Master Protected
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
    );
}
