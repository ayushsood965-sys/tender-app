import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    FilePlus2,
    FolderKanban,
    ScrollText,
    ShieldAlert,
    LogOut,
    Sparkles,
    User,
    ChevronRight,
    Building2,
    Shield,
} from "lucide-react";

import BrandLogo from "./BrandLogo";

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout, isSuperAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/landing");
    };

    const navItems = [
        {
            name: "Dashboard Overview",
            path: "/dashboard",
            icon: LayoutDashboard,
            description: "Analytics & recent activity",
        },
        {
            name: "Create Tender",
            path: "/create-tender",
            icon: FilePlus2,
            description: "Limited, GeM ATC, e-Tender",
        },
        {
            name: "My Tenders",
            path: "/my-tenders",
            icon: FolderKanban,
            description: "Documents & saved versions",
        },
        {
            name: "Master Terms & Clauses",
            path: "/master-repository",
            icon: ScrollText,
            description: "Shared repository & custom clauses",
        },
    ];

    if (isSuperAdmin) {
        navItems.push({
            name: "Super Admin Console",
            path: "/admin-console",
            icon: ShieldAlert,
            description: "Global search & user oversight",
            badge: "ADMIN",
        });
    }

    const getInitials = (name) => {
        if (!name) return "HP";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-purple-100 shadow-xl shadow-purple-900/5 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* 1. Top Brand Header */}
                <div>
                    <div className="p-4.5 px-5 border-b border-purple-100/80">
                        <BrandLogo size="default" />
                    </div>

                    {/* 2. Navigation Links */}
                    <div className="p-3 space-y-1.5 mt-2">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Workspace Menu
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                                            isActive
                                                ? "bg-gradient-to-r from-purple-50 to-indigo-50/60 text-purple-800 border border-purple-200/80 shadow-md shadow-purple-500/5 font-bold"
                                                : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50 border border-transparent"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon
                                                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                                    isActive ? "text-purple-700" : "text-slate-400 group-hover:text-purple-600"
                                                }`}
                                            />
                                            <div className="flex-1 overflow-hidden text-left">
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate">
                                                        {item.name}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                                                    {item.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-600 to-indigo-600 absolute right-2" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Bottom User Profile & Logout */}
                <div className="p-3 border-t border-purple-100 bg-purple-50/30">
                    <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSuperAdmin 
                                    ? "bg-purple-100 text-purple-800 border border-purple-200" 
                                    : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            }`}>
                                {getInitials(user?.fullName)}
                            </div>
                            <div className="overflow-hidden text-left">
                                <div className="flex items-center gap-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                        {user?.fullName || "Faculty User"}
                                    </p>
                                    {isSuperAdmin && (
                                        <Shield className="w-3 h-3 text-purple-600 shrink-0" />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">
                                    {user?.departmentName || "Department of Physics"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
