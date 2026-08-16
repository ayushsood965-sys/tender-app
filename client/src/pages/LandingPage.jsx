import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import lottie from "lottie-web";
import tenderLottie from "../assets/tender_lottie.json";
import {
    Sparkles,
    ArrowRight,
    UserPlus,
    LogIn,
    ShieldCheck,
    FileCheck2,
    CheckCircle2,
    ScrollText,
    Layers,
} from "lucide-react";

export default function LandingPage() {
    const lottieContainer = useRef(null);

    useEffect(() => {
        if (!lottieContainer.current) return;
        lottieContainer.current.innerHTML = "";

        const anim = lottie.loadAnimation({
            container: lottieContainer.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: tenderLottie,
        });

        return () => {
            anim.destroy();
        };
    }, []);

    return (
        <div className="h-screen w-screen bg-white text-slate-900 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-4 relative overflow-hidden font-sans select-none antialiased">
            {/* Subtle Minimal Ambient Lighting */}
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Viewport Container */}
            <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto">
                
                {/* LEFT: Clean, Spacious, Minimalist Hero Content */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    
                    {/* 1. Subtle Institutional Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100/80 shadow-xs">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg"
                            alt="HPU"
                            className="w-4 h-4 object-contain"
                        />
                        <span className="text-xs font-semibold text-purple-900 tracking-wide">
                            Himachal Pradesh University • Procurement Portal
                        </span>
                    </div>

                    {/* 2. Clear, Uncluttered, Elegant Title */}
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                            Smart Tender Documentation, <br />
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Built for Government.
                            </span>
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 max-w-xl font-normal leading-relaxed">
                            Generate compliant Limited Tenders, GeM ATC, and e-Procurement documents with automated university master clauses and instant DOCX/PDF export.
                        </p>
                    </div>

                    {/* 3. Three Clean Feature Highlights (Minimal Pills with Breathing Room) */}
                    <div className="flex flex-wrap gap-2.5 pt-1 justify-center lg:justify-start">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                            <FileCheck2 className="w-4 h-4 text-purple-600" />
                            <span>Limited & GeM ATC Formats</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                            <ScrollText className="w-4 h-4 text-purple-600" />
                            <span>96+ University Master Clauses</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>HPFR 2009 Compliant</span>
                        </div>
                    </div>

                    {/* 4. Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        {/* Sign In Button */}
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-7 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
                        >
                            <span>Sign In to Portal</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Create Account Button */}
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 text-slate-500" />
                            <span>Create Faculty Account</span>
                        </Link>
                    </div>

                    {/* 5. Minimalist Trust Footnote */}
                    <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Designed exclusively for university departments and authorized officers.</span>
                    </div>
                </div>

                {/* RIGHT: Minimalist, Airy Lottie Showcase Card */}
                <div className="lg:col-span-5 flex justify-center items-center">
                    <div className="w-full max-w-sm bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-purple-900/5 relative flex flex-col items-center">
                        
                        {/* Minimalist Top Indicator */}
                        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/60 mb-2">
                            <span className="text-[11px] font-semibold text-slate-400">Automated Document Studio</span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
                                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                                Active
                            </span>
                        </div>

                        {/* Lottie Animation Display */}
                        <div
                            ref={lottieContainer}
                            className="w-full h-64 flex items-center justify-center relative overflow-hidden my-2"
                        />

                        {/* Bottom Clean Meta */}
                        <div className="w-full pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>DOCX • PDF High Fidelity</span>
                            <span className="text-purple-700 font-bold">HPU Shimla</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
