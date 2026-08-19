import React from "react";

export default function BrandLogo({ size = "default", showText = true, className = "" }) {
    // Sizes: "sm" | "default" | "lg" | "xl"
    const sizeConfig = {
        sm: { icon: "w-8 h-8", text: "text-xs", sub: "text-[9px]" },
        default: { icon: "w-10 h-10", text: "text-sm", sub: "text-[10.5px]" },
        lg: { icon: "w-12 h-12", text: "text-base", sub: "text-xs" },
        xl: { icon: "w-16 h-16", text: "text-xl", sub: "text-sm" },
    };

    const cfg = sizeConfig[size] || sizeConfig.default;

    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* SVG Crest Emblem */}
            <div className={`${cfg.icon} relative flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105`}>
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                    <defs>
                        <linearGradient id="blShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#312e81" />
                            <stop offset="50%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="blGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                    </defs>

                    {/* Shield Base */}
                    <path
                        d="M32 3 L54 11 C54 28 46 47 32 59 C18 47 10 28 10 11 Z"
                        fill="url(#blShieldGrad)"
                        stroke="#818cf8"
                        strokeWidth="1.5"
                    />

                    {/* Inner Golden Dotted Ring */}
                    <path
                        d="M32 8 L49 14.5 C49 28 42.5 43.5 32 53.5 C21.5 43.5 15 28 15 14.5 Z"
                        fill="none"
                        stroke="url(#blGoldGrad)"
                        strokeWidth="1"
                        opacity="0.75"
                        strokeDasharray="2 1.5"
                    />

                    {/* Pediment & Dome */}
                    <path d="M32 15 L43 21 L21 21 Z" fill="url(#blGoldGrad)" />
                    <rect x="22" y="22" width="20" height="2" rx="0.8" fill="#ffffff" />

                    {/* Classical Pillars */}
                    <rect x="24.5" y="25" width="2.5" height="11" rx="0.5" fill="#ffffff" opacity="0.95" />
                    <rect x="30.75" y="25" width="2.5" height="11" rx="0.5" fill="#ffffff" opacity="0.95" />
                    <rect x="37" y="25" width="2.5" height="11" rx="0.5" fill="#ffffff" opacity="0.95" />
                    <rect x="22" y="37" width="20" height="2" rx="0.8" fill="#ffffff" />

                    {/* Document & Seal */}
                    <g transform="translate(24, 39) scale(0.65)">
                        <rect x="2" y="3" width="18" height="22" rx="2.5" fill="#ffffff" stroke="#e0e7ff" strokeWidth="1" />
                        <line x1="6" y1="8" x2="16" y2="8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="6" y1="12" x2="16" y2="12" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="16" cy="18" r="3.5" fill="url(#blGoldGrad)" />
                        <path d="M14.5 18 L15.5 19 L17.5 17" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                    </g>

                    {/* Top Star */}
                    <circle cx="32" cy="10.5" r="1.2" fill="#fbbf24" />
                </svg>
            </div>

            {/* Typography */}
            {showText && (
                <div className="overflow-hidden leading-tight">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-indigo-600 truncate">
                        H.P. University
                    </span>
                    <h1 className={`font-black text-slate-900 tracking-tight flex items-center gap-1 ${cfg.text}`}>
                        Tender<span className="text-indigo-600">Portal</span>
                    </h1>
                </div>
            )}
        </div>
    );
}
