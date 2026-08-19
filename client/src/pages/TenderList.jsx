import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchTenders, deleteTender, fetchDocuments, deleteDocument } from "../services/api";
import { downloadDocumentAsPdf, downloadDocumentAsDocx } from "../utils/exportUtils";
import {
    Search,
    Plus,
    FileText,
    Download,
    Eye,
    Trash2,
    Edit3,
    Calendar,
    Building2,
    DollarSign,
    Layers,
    FileDown,
    ChevronDown,
    ChevronUp,
    Shield,
    Sparkles,
} from "lucide-react";

export default function TenderList() {
    const { user, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const [tenders, setTenders] = useState([]);
    const [filteredTenders, setFilteredTenders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDocType, setSelectedDocType] = useState("all");
    const [loading, setLoading] = useState(true);

    const [expandedTenderId, setExpandedTenderId] = useState(null);
    const [tenderDocs, setTenderDocs] = useState({});
    const [loadingDocs, setLoadingDocs] = useState({});
    const [exportingDoc, setExportingDoc] = useState({ id: null, type: null });

    const [deleteModal, setDeleteModal] = useState({ open: false, type: "tender", id: null, title: "" });

    const loadTenders = async () => {
        setLoading(true);
        try {
            const data = await fetchTenders();
            setTenders(data);
            setFilteredTenders(data);
        } catch (err) {
            console.error("Failed to load tenders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTenders();
    }, []);

    useEffect(() => {
        let result = tenders;

        if (selectedDocType !== "all") {
            result = result.filter((t) => t.documentType === selectedDocType);
        }

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(
                (t) =>
                    (t.tenderName && t.tenderName.toLowerCase().includes(lower)) ||
                    (t.tenderNo && t.tenderNo.toLowerCase().includes(lower)) ||
                    (t.departmentName && t.departmentName.toLowerCase().includes(lower))
            );
        }

        setFilteredTenders(result);
    }, [searchTerm, selectedDocType, tenders]);

    const toggleExpandTender = async (tenderId) => {
        if (expandedTenderId === tenderId) {
            setExpandedTenderId(null);
            return;
        }

        setExpandedTenderId(tenderId);

        if (!tenderDocs[tenderId]) {
            setLoadingDocs((prev) => ({ ...prev, [tenderId]: true }));
            try {
                const docs = await fetchDocuments(tenderId);
                setTenderDocs((prev) => ({ ...prev, [tenderId]: docs }));
            } catch (err) {
                console.error("Failed to fetch tender docs:", err);
            } finally {
                setLoadingDocs((prev) => ({ ...prev, [tenderId]: false }));
            }
        }
    };

    const handleDeleteTender = async () => {
        if (!deleteModal.id) return;
        try {
            if (deleteModal.type === "tender") {
                await deleteTender(deleteModal.id);
                setTenders((prev) => prev.filter((t) => t.id !== deleteModal.id));
            } else if (deleteModal.type === "document") {
                await deleteDocument(deleteModal.id);
                if (expandedTenderId) {
                    setTenderDocs((prev) => ({
                        ...prev,
                        [expandedTenderId]: prev[expandedTenderId]?.filter((d) => d.id !== deleteModal.id),
                    }));
                }
            }
        } catch (err) {
            alert(err.message || "Failed to delete");
        } finally {
            setDeleteModal({ open: false, type: "tender", id: null, title: "" });
        }
    };

    const handleExport = async (doc, type) => {
        setExportingDoc({ id: doc.id, type });
        try {
            if (type === "docx") {
                await downloadDocumentAsDocx(doc, doc.name);
            } else {
                await downloadDocumentAsPdf(doc, doc.name);
            }
        } catch (err) {
            alert(`Export failed: ${err.message}`);
        } finally {
            setExportingDoc({ id: null, type: null });
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
                        <h3 className="text-lg font-black text-slate-900 mb-1">Confirm Deletion</h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteModal.title}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, type: "tender", id: null, title: "" })}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTender}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Search & Create button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                        {isSuperAdmin ? "All University Tenders" : "My Tenders"}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {isSuperAdmin
                            ? "Global tender records across all university departments"
                            : "Manage your tenders, saved versions, and export high-fidelity documents"}
                    </p>
                </div>

                <Link
                    to="/create-tender"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all transform active:scale-95 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New Tender</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-purple-100/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tender name, ref no..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                </div>

                {/* Doc Type Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {[
                        { key: "all", label: "All Formats" },
                        { key: "Limited Tender Document", label: "Limited Tender" },
                        { key: "GeM ATC Document", label: "GeM ATC" },
                        { key: "e-tender Document", label: "e-Tender" },
                    ].map((type) => (
                        <button
                            key={type.key}
                            onClick={() => setSelectedDocType(type.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                selectedDocType === type.key
                                    ? "bg-purple-100 text-purple-800 border border-purple-300 shadow-xs"
                                    : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/60 border border-transparent"
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tenders Grid / Cards */}
            {loading ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                    Loading tenders...
                </div>
            ) : filteredTenders.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl py-16 text-center shadow-xs">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No Tenders Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No tender records match your filter criteria. Create a new tender or clear filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTenders.map((tender) => {
                        const isExpanded = expandedTenderId === tender.id;
                        const docs = tenderDocs[tender.id] || [];
                        const isOwner = !tender.userId || tender.userId === user?.id || isSuperAdmin;

                        return (
                            <div
                                key={tender.id}
                                className="bg-white border border-purple-100/80 hover:border-purple-300 rounded-3xl p-5 lg:p-6 shadow-md shadow-purple-900/5 transition-all duration-200"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                                tender.documentType === "Limited Tender Document"
                                                    ? "bg-purple-50 text-purple-800 border-purple-200"
                                                    : "bg-indigo-50 text-indigo-800 border-indigo-200"
                                            }`}>
                                                {tender.documentType || "GeM ATC"}
                                            </span>

                                            <span className="text-xs font-semibold text-slate-500">
                                                Ref: <strong className="text-slate-800">{tender.tenderNo || "N/A"}</strong>
                                            </span>

                                            {tender.createdBy && isSuperAdmin && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                                                    <Shield className="w-2.5 h-2.5 text-purple-600" />
                                                    {tender.createdBy.fullName} ({tender.createdBy.departmentName})
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                                            {tender.tenderName}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{tender.departmentName}</span>
                                            </div>
                                            {tender.estimatedCost && (
                                                <div className="flex items-center gap-1 font-bold text-slate-900">
                                                    <span>₹ {Number(tender.estimatedCost).toLocaleString("en-IN")}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{tender.createdAt ? new Date(tender.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                        <button
                                            onClick={() => navigate(`/preview/${tender.id}`)}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Preview & Edit</span>
                                        </button>

                                        <button
                                            onClick={() => toggleExpandTender(tender.id)}
                                            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <FileDown className="w-3.5 h-3.5 text-purple-700" />
                                            <span>Saved Versions</span>
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>

                                        {isOwner && (
                                            <button
                                                onClick={() => setDeleteModal({ open: true, type: "tender", id: tender.id, title: tender.tenderName })}
                                                className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                                                title="Delete Tender"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Saved Versions Drawer */}
                                {isExpanded && (
                                    <div className="mt-5 pt-4 border-t border-purple-100 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                                                Saved Document Versions ({docs.length})
                                            </h4>
                                        </div>

                                        {loadingDocs[tender.id] ? (
                                            <p className="text-xs text-slate-400 py-2">Loading saved versions...</p>
                                        ) : docs.length === 0 ? (
                                            <div className="py-4 text-center text-xs text-slate-500 bg-purple-50/40 rounded-2xl border border-purple-100">
                                                No saved snapshots yet. Open "Preview & Edit" and click "Save Version" to generate versions.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {docs.map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-purple-100/80 hover:border-purple-200"
                                                    >
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                                Saved on: {new Date(doc.createdAt).toLocaleString("en-IN")} • {Object.keys(doc.pages || {}).length} pages
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleExport(doc, "docx")}
                                                                disabled={exportingDoc.id === doc.id}
                                                                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>{exportingDoc.id === doc.id && exportingDoc.type === "docx" ? "..." : "Word DOCX"}</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleExport(doc, "pdf")}
                                                                disabled={exportingDoc.id === doc.id}
                                                                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>{exportingDoc.id === doc.id && exportingDoc.type === "pdf" ? "..." : "PDF"}</span>
                                                            </button>

                                                            {isOwner && (
                                                                <button
                                                                    onClick={() => setDeleteModal({ open: true, type: "document", id: doc.id, title: doc.name })}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
