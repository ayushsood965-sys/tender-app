import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardData, fetchTenders } from "../services/api";
import {
    FilePlus2,
    FileText,
    FolderKanban,
    ScrollText,
    Shield,
    TrendingUp,
    Download,
    ArrowRight,
    Eye,
    Plus,
    Building2,
    Layers,
    Sparkles,
    CheckCircle2,
    Clock,
    Edit3,
} from "lucide-react";

export default function DashboardOverview() {
    const { user, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalTenders: 0,
        totalCategories: 0,
        totalTerms: 0,
        myTenders: 0,
    });
    const [recentTenders, setRecentTenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const [dashData, tendersList] = await Promise.all([
                    fetchDashboardData().catch(() => ({})),
                    fetchTenders().catch(() => []),
                ]);

                const safeTenders = Array.isArray(tendersList) ? tendersList : [];
                const safeCategories = Array.isArray(dashData?.categories) ? dashData.categories : [];
                const safeTerms = Array.isArray(dashData?.terms) ? dashData.terms : [];

                setStats({
                    totalTenders: safeTenders.length,
                    totalCategories: safeCategories.length,
                    totalTerms: safeTerms.length,
                    myTenders: safeTenders.length,
                });
                setRecentTenders(safeTenders.slice(0, 5));
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, []);

    const formatCurrency = (val) => {
        if (!val) return "₹ 0";
        return `₹ ${Number(val).toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* 1. Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 p-6 lg:p-8 shadow-xl shadow-purple-900/10 text-white">
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Welcome to HPU Tender Studio</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                            Hello, {user?.fullName || "Faculty Member"}
                        </h1>
                        <p className="text-purple-100 text-sm max-w-xl font-medium">
                            {user?.designation} • {user?.departmentName}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/create-tender"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 font-bold text-sm shadow-lg shadow-black/10 transition-all transform active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-purple-700" />
                            <span>Create New Tender</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-white border border-purple-100/80 rounded-3xl p-5 shadow-lg shadow-purple-900/5 relative overflow-hidden group hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {isSuperAdmin ? "Total University Tenders" : "My Active Tenders"}
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {loading ? "..." : stats.totalTenders}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for export (DOCX/PDF)</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-purple-100/80 rounded-3xl p-5 shadow-lg shadow-purple-900/5 relative overflow-hidden group hover:border-violet-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Master Clauses Available
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {loading ? "..." : stats.totalTerms}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 group-hover:scale-110 transition-transform">
                            <ScrollText className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-violet-700 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Central Shared Repository</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-purple-100/80 rounded-3xl p-5 shadow-lg shadow-purple-900/5 relative overflow-hidden group hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Standard Categories
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {loading ? "..." : stats.totalCategories}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 group-hover:scale-110 transition-transform">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>From University Guidelines</span>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white border border-purple-100/80 rounded-3xl p-5 shadow-lg shadow-purple-900/5 relative overflow-hidden group hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Supported Document Formats
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                3 Formats
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Limited, GeM ATC, e-Tender</span>
                    </div>
                </div>
            </div>

            {/* 3. Quick Action Launchpads */}
            <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">Quick Creation Launchpad</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Launchpad 1: Limited Tender */}
                    <div
                        onClick={() => navigate("/create-tender?type=limited")}
                        className="bg-white border border-purple-100 hover:border-purple-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                            Limited Tender Document
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Formal quotation letter with 2-cover system, dynamic approximate cost, and Annexure-A items schedule.
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700">
                            <span>Create Notice Now</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Launchpad 2: GeM ATC */}
                    <div
                        onClick={() => navigate("/create-tender?type=gem")}
                        className="bg-white border border-purple-100 hover:border-violet-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/10 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 mb-4 group-hover:scale-110 transition-transform">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                            GeM ATC Document
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Full GeM Additional Terms & Conditions with emblem cover page, 10-point summary table, and mapped clauses.
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-violet-700">
                            <span>Create GeM Document</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Launchpad 3: Master Clauses */}
                    <div
                        onClick={() => navigate("/master-repository")}
                        className="bg-white border border-purple-100 hover:border-indigo-400 p-6 rounded-3xl cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/10 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 mb-4 group-hover:scale-110 transition-transform">
                            <ScrollText className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                            Master Clauses Repository
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Browse, search, or add custom university clauses shared across departments.
                        </p>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-700">
                            <span>Browse Master Clauses</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Recent Tenders Table */}
            <div className="bg-white border border-purple-100/80 rounded-3xl p-6 shadow-xl shadow-purple-900/5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Recent Tenders</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Quickly access or preview your created documents</p>
                    </div>
                    <Link
                        to="/my-tenders"
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                        <span>View All Tenders</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        Loading recent tenders...
                    </div>
                ) : recentTenders.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                        No tenders created yet. Click "Create New Tender" to get started!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-purple-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <th className="pb-3 px-3">Tender Name & Ref</th>
                                    <th className="pb-3 px-3">Type</th>
                                    <th className="pb-3 px-3">Department</th>
                                    <th className="pb-3 px-3">Est. Cost</th>
                                    <th className="pb-3 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {recentTenders.map((t) => (
                                    <tr key={t.id} className="hover:bg-purple-50/40 transition-colors">
                                        <td className="py-4 px-3">
                                            <p className="font-bold text-slate-900 text-sm line-clamp-1">{t.tenderName}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Ref: {t.tenderNo || "N/A"}</p>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                                                t.documentType === "Limited Tender Document"
                                                    ? "bg-purple-50 text-purple-800 border-purple-200"
                                                    : "bg-indigo-50 text-indigo-800 border-indigo-200"
                                            }`}>
                                                {t.documentType || "GeM ATC"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-3 text-xs text-slate-600">
                                            {t.departmentName}
                                        </td>
                                        <td className="py-4 px-3 text-xs font-bold text-slate-900">
                                            {formatCurrency(t.estimatedCost)}
                                        </td>
                                        <td className="py-4 px-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/preview/${t.id}`)}
                                                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Preview</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit-tender/${t.id}`)}
                                                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    title="Edit Tender Form"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Edit Form</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
