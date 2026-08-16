import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import CreateTender from "./pages/CreateTender";
import TenderList from "./pages/TenderList";
import MasterRepository from "./pages/MasterRepository";
import AdminConsole from "./pages/AdminConsole";
import TenderPreview from "./pages/TenderPreview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

// Dynamic Root Component (Landing Page for guests, Dashboard for logged-in users)
function RootRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-emerald-400 font-sans">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Loading HPU Portal...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    return (
        <DashboardLayout>
            <DashboardOverview />
        </DashboardLayout>
    );
}

// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-emerald-400 font-sans">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Authenticating session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/landing" replace />;
    }

    return children;
}

// Superadmin Route Component
function SuperAdminRoute({ children }) {
    const { isAuthenticated, isSuperAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-amber-400 font-sans">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-300">Verifying administrator rights...</p>
            </div>
        );
    }

    if (!isAuthenticated || !isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Dynamic Home Route */}
                <Route path="/" element={<RootRoute />} />
                
                {/* Full-screen Standalone Landing Page */}
                <Route path="/landing" element={<LandingPage />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Dashboard Shell Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardOverview />} />
                    <Route path="/create-tender" element={<CreateTender />} />
                    <Route path="/my-tenders" element={<TenderList />} />
                    <Route path="/master-repository" element={<MasterRepository />} />
                    
                    {/* Super Admin Console */}
                    <Route
                        path="/admin-console"
                        element={
                            <SuperAdminRoute>
                                <AdminConsole />
                            </SuperAdminRoute>
                        }
                    />
                </Route>

                {/* Standalone Live Tender Preview & Editor */}
                <Route
                    path="/preview/:id"
                    element={
                        <ProtectedRoute>
                            <TenderPreview />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tender-preview/:id"
                    element={
                        <ProtectedRoute>
                            <TenderPreview />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}
