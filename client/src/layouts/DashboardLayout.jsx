import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Menu, Shield, Calendar, Sparkles } from "lucide-react";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isSuperAdmin } = useAuth();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/" || path === "/dashboard") return "Dashboard Overview";
        if (path.startsWith("/create-tender")) return "Create Tender Document";
        if (path.startsWith("/my-tenders")) return "My Tenders & Saved Versions";
        if (path.startsWith("/master-repository")) return "Master Terms & Clauses Repository";
        if (path.startsWith("/admin-console")) return "Super Administrator Console";
        if (path.startsWith("/preview")) return "Tender Live Editor & Preview";
        return "Tender Portal";
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-purple-600 selection:text-white">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Area */}
            <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
                {/* Top Ambient Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-purple-100/80 px-4 lg:px-8 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {getPageTitle()}
                                {isSuperAdmin && (
                                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                        <Shield className="w-2.5 h-2.5" /> SUPER ADMIN
                                    </span>
                                )}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-100 text-xs font-semibold text-purple-800">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span>
                                {new Date().toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 text-xs font-bold text-purple-900">
                            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">
                                {user?.departmentName || "HPU Shimla"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
