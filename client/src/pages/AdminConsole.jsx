import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAdminUsers, fetchTenders, deleteTender } from "../services/api";
import {
    ShieldAlert,
    Search,
    User,
    Building2,
    Calendar,
    FolderKanban,
    Eye,
    Trash2,
    CheckCircle2,
    Lock,
    Sparkles,
    Filter,
    Layers,
    Phone,
    Mail,
    Briefcase,
} from "lucide-react";

export default function AdminConsole() {
    const { isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [selectedUserFilter, setSelectedUserFilter] = useState("all");
    const [searchUserQuery, setSearchUserQuery] = useState("");
    const [searchTenderQuery, setSearchTenderQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: "" });

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [usersData, tendersData] = await Promise.all([
                fetchAdminUsers(),
                fetchTenders(),
            ]);
            setUsers(usersData || []);
            setTenders(tendersData || []);
        } catch (err) {
            console.error("Admin data load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSuperAdmin) {
            navigate("/");
            return;
        }
        loadAdminData();
    }, [isSuperAdmin]);

    const filteredUsers = users.filter((u) => {
        if (!searchUserQuery.trim()) return true;
        const q = searchUserQuery.toLowerCase();
        return (
            u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.departmentName?.toLowerCase().includes(q) ||
            u.designation?.toLowerCase().includes(q)
        );
    });

    const filteredTenders = tenders.filter((t) => {
        if (selectedUserFilter !== "all" && t.userId !== parseInt(selectedUserFilter)) {
            return false;
        }
        if (searchTenderQuery.trim()) {
            const q = searchTenderQuery.toLowerCase();
            return (
                t.tenderName?.toLowerCase().includes(q) ||
                t.tenderNo?.toLowerCase().includes(q) ||
                t.departmentName?.toLowerCase().includes(q) ||
                t.createdBy?.fullName?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const handleDeleteTender = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteTender(deleteModal.id);
            setTenders((prev) => prev.filter((t) => t.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null, title: "" });
        } catch (err) {
            alert(err.message || "Failed to delete tender");
        }
    };

    const formatCurrency = (val) => {
        if (!val) return "₹ 0";
        return `₹ ${Number(val).toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Super Admin Deletion</h3>
                        <p className="text-xs text-slate-500 mb-6">
                            As Super Admin, you are about to permanently delete tender <span className="text-slate-900 font-bold">"{deleteModal.title}"</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, id: null, title: "" })}
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

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 p-6 lg:p-8 shadow-xl shadow-purple-900/10 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black text-white shadow-sm">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Super Administrator Central Oversight Console</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            University User Directory & Global Tender Manager
                        </h1>
                        <p className="text-xs text-purple-100 max-w-xl font-medium">
                            Search and inspect tenders created by any faculty member or department. Edit, delete, or manage university master terms.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 1: User Directory & Tender Filter */}
            <div className="bg-white border border-purple-100/80 rounded-3xl p-6 shadow-md shadow-purple-900/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-700" />
                            <span>Registered University Users ({users.length})</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Filter tenders by selecting a user below</p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchUserQuery}
                            onChange={(e) => setSearchUserQuery(e.target.value)}
                            placeholder="Search user by name, email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {filteredUsers.map((u) => {
                        const isSelected = selectedUserFilter === u.id.toString();
                        return (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUserFilter(isSelected ? "all" : u.id.toString())}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                                    isSelected
                                        ? "bg-purple-50 border-purple-300 shadow-md shadow-purple-900/5"
                                        : "bg-slate-50 border-slate-200 hover:border-purple-200"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-black text-purple-800 shrink-0">
                                            {u.fullName?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <h4 className="text-xs font-black text-slate-900 truncate">{u.fullName}</h4>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                                        {u.tenderCount || 0} Tenders
                                    </span>
                                </div>

                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{u.departmentName}</span>
                                </p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{u.email}</span>
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section 2: Global Tenders Table */}
            <div className="bg-white border border-purple-100/80 rounded-3xl p-6 shadow-md shadow-purple-900/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-purple-700" />
                            <span>
                                {selectedUserFilter === "all"
                                    ? `All University Tenders (${filteredTenders.length})`
                                    : `Filtered Tenders for Selected User (${filteredTenders.length})`}
                            </span>
                        </h3>
                        {selectedUserFilter !== "all" && (
                            <button
                                onClick={() => setSelectedUserFilter("all")}
                                className="text-xs font-bold text-purple-700 hover:underline mt-0.5 inline-block"
                            >
                                Clear User Filter (Show All Tenders)
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchTenderQuery}
                            onChange={(e) => setSearchTenderQuery(e.target.value)}
                            placeholder="Search tender name, department..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        Loading tenders...
                    </div>
                ) : filteredTenders.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">
                        No tenders found matching search/filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-purple-100 uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="pb-3 px-3">Tender Name & Ref</th>
                                    <th className="pb-3 px-3">Format Type</th>
                                    <th className="pb-3 px-3">Created By</th>
                                    <th className="pb-3 px-3">Department</th>
                                    <th className="pb-3 px-3">Est. Cost</th>
                                    <th className="pb-3 px-3 text-right">Super Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-50">
                                {filteredTenders.map((t) => (
                                    <tr key={t.id} className="hover:bg-purple-50/40 transition-colors">
                                        <td className="py-3 px-3">
                                            <p className="font-black text-slate-900 text-xs line-clamp-1">{t.tenderName}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Ref: {t.tenderNo || "N/A"}</p>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                t.documentType === "Limited Tender Document"
                                                    ? "bg-purple-50 text-purple-800 border-purple-200"
                                                    : "bg-indigo-50 text-indigo-800 border-indigo-200"
                                            }`}>
                                                {t.documentType || "GeM ATC"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-slate-700">
                                            <span className="font-bold">{t.createdBy?.fullName || "System Admin"}</span>
                                            <p className="text-[10.5px] text-slate-500">{t.createdBy?.designation || ""}</p>
                                        </td>
                                        <td className="py-3 px-3 text-slate-600">
                                            {t.departmentName}
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-900">
                                            {formatCurrency(t.estimatedCost)}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/preview/${t.id}`)}
                                                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>Preview/Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, id: t.id, title: t.tenderName })}
                                                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                                    title="Delete Tender as Super Admin"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
