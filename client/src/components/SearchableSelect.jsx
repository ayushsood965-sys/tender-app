import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Sparkles } from "lucide-react";

/**
 * Modern Searchable Select Dropdown with instant live search, highlighting, and keyboard navigation.
 */
export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    searchPlaceholder = "Type to search live...",
    disabled = false,
    required = false,
    allowCustom = false,
    className = "",
    label = "",
    icon: Icon = null,
    clearable = true,
    name = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    // Normalize options to { value, label, sublabel, badge }
    const normalizedOptions = options.map((opt) => {
        if (typeof opt === "object" && opt !== null) {
            return {
                value: opt.value !== undefined ? opt.value : opt.id,
                label: opt.label || opt.name || opt.title || String(opt.value || opt.id || ""),
                sublabel: opt.sublabel || opt.description || "",
                badge: opt.badge || opt.category || "",
                icon: opt.icon || null,
            };
        }
        return {
            value: opt,
            label: String(opt),
            sublabel: "",
            badge: "",
            icon: null,
        };
    });

    // Find current selected option
    const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value)) || (
        value ? { value, label: String(value), sublabel: "", badge: "" } : null
    );

    // Live search filtering
    const filteredOptions = normalizedOptions.filter((opt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            opt.label.toLowerCase().includes(q) ||
            (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
            (opt.badge && opt.badge.toLowerCase().includes(q)) ||
            String(opt.value).toLowerCase().includes(q)
        );
    });

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-focus search input on dropdown open
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setHighlightedIndex(0);
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 50);
        }
    }, [isOpen]);

    // Handle Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex]);
            } else if (allowCustom && searchQuery.trim()) {
                handleSelect({ value: searchQuery.trim(), label: searchQuery.trim() });
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
        }
    };

    const handleSelect = (option) => {
        if (onChange) {
            // Support both direct value and standard synthetic event object
            onChange(option.value, option);
        }
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) {
            onChange("", null);
        }
    };

    return (
        <div className={`relative w-full text-left font-sans ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>
                        {label} {required && <span className="text-purple-600">*</span>}
                    </span>
                    {selectedOption && (
                        <span className="text-[10px] text-purple-600 font-semibold lowercase">
                            selected
                        </span>
                    )}
                </label>
            )}

            {/* Dropdown Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border rounded-xl text-xs text-left flex items-center justify-between gap-2 transition-all shadow-xs outline-none cursor-pointer ${
                    isOpen
                        ? "border-purple-500 ring-2 ring-purple-100 bg-white"
                        : "border-slate-200 hover:border-purple-300"
                } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-slate-900 truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold shrink-0">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-slate-400 font-medium truncate">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {clearable && selectedOption && !disabled && (
                        <span
                            role="button"
                            onClick={handleClear}
                            className="p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Clear selection"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-purple-600" : ""
                        }`}
                    />
                </div>
            </button>

            {/* Hidden native input for form compatibility */}
            <input type="hidden" name={name} value={value || ""} required={required} />

            {/* Floating Dropdown Menu with Live Search */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-2xl shadow-purple-900/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Live Search Input Bar */}
                    <div className="p-2.5 border-b border-purple-50 bg-slate-50/70">
                        <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-purple-500 absolute left-3 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-7 py-1.5 bg-white border border-purple-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-medium transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div
                        ref={listRef}
                        className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y-0 divide-purple-50"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(value);
                                const isHighlighted = idx === highlightedIndex;

                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        className={`px-3 py-2 rounded-xl text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                            isSelected
                                                ? "bg-purple-600 text-white font-bold"
                                                : isHighlighted
                                                ? "bg-purple-50 text-purple-900 font-semibold"
                                                : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{opt.label}</span>
                                                {opt.badge && (
                                                    <span
                                                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                                            isSelected
                                                                ? "bg-purple-700 text-purple-100"
                                                                : "bg-purple-100 text-purple-800"
                                                        }`}
                                                    >
                                                        {opt.badge}
                                                    </span>
                                                )}
                                            </div>
                                            {opt.sublabel && (
                                                <p
                                                    className={`text-[11px] truncate mt-0.5 ${
                                                        isSelected ? "text-purple-200" : "text-slate-400"
                                                    }`}
                                                >
                                                    {opt.sublabel}
                                                </p>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="w-4 h-4 text-white shrink-0" />
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-6 px-4 text-center">
                                <p className="text-xs text-slate-500 font-medium">
                                    No matches found for "{searchQuery}"
                                </p>
                                {allowCustom && searchQuery.trim() && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSelect({
                                                value: searchQuery.trim(),
                                                label: searchQuery.trim(),
                                            })
                                        }
                                        className="mt-2.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Use "{searchQuery.trim()}"</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
