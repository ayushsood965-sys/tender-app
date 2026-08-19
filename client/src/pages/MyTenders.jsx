import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FileText,
    Calendar,
    DollarSign,
    Trash2,
    Edit2,
    Eye,
    RefreshCw,
    Plus,
    Copy,
} from "lucide-react";
import { fetchDashboardData, deleteTender, duplicateTender } from "../services/api";

const MyTenders = () => {
    const navigate = useNavigate();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tenderToDelete, setTenderToDelete] = useState(null);

    useEffect(() => {
        loadTenders();
    }, []);

    const loadTenders = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setTenders(data.tenders || []);
        } catch (error) {
            console.error("Failed to load tenders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setTenderToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDuplicate = async (id) => {
        try {
            const cloned = await duplicateTender(id);
            setTenders((prev) => [cloned, ...prev]);
            alert(`Tender duplicated successfully as "${cloned.tenderName}"!`);
        } catch (error) {
            console.error("Failed to duplicate tender", error);
            alert("Failed to duplicate tender: " + error.message);
        }
    };

    const confirmDelete = async () => {
        if (!tenderToDelete) return;
        try {
            await deleteTender(tenderToDelete);
            setTenders((prev) => prev.filter((t) => t.id !== tenderToDelete));
            setDeleteModalOpen(false);
            setTenderToDelete(null);
        } catch (error) {
            console.error("Failed to delete tender", error);
            alert("Failed to delete tender");
        }
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "Not Set";
        return new Date(dateStr).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Tenders</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your created tender documents.
                    </p>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> New Tender
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : tenders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">
                        No tenders found
                    </h3>
                    <p className="text-slate-500 mb-4">
                        Create your first tender document to get started.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Tender
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tenders.map((tender) => (
                        <div
                            key={tender.id}
                            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
                                                {tender.tenderType}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase tracking-wide">
                                                {tender.tenderCategory}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">
                                            ID: {tender.id}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {tender.tenderName}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                                        {tender.departmentName} • {tender.tenderNo}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">
                                                ₹{Number(tender.estimatedCost).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>
                                                Pub: {formatDateDisplay(tender.publishDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>
                                                End: {formatDateDisplay(tender.bidEndDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                                    <Link
                                        to={`/tenders/${tender.id}`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors w-full md:w-auto justify-center"
                                    >
                                        <Eye className="w-4 h-4" /> View
                                    </Link>
                                    <Link
                                        to={`/tenders/${tender.id}/edit`}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors w-full md:w-auto justify-center"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDuplicate(tender.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors w-full md:w-auto justify-center cursor-pointer"
                                        title="Clone as New Tender"
                                    >
                                        <Copy className="w-4 h-4" /> Clone
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(tender.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full md:w-auto justify-center cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Delete Tender?
                            </h3>
                            <p className="text-slate-600 mb-6 text-sm">
                                Are you sure you want to delete this tender? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTenders;
