import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Building,
    Mail,
    UserCheck,
    Layers,
    Hash,
    DollarSign,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Save,
    CheckSquare,
    Square,
    RefreshCw,
    Plus,
    Trash2,
    FileText,
    Clock,
    MapPin,
    ShieldCheck,
    Paperclip,
    Lock,
    Eye,
    X,
    Sparkles,
    CheckCircle2,
    Search,
    Sliders,
} from "lucide-react";
import {
    fetchDashboardData,
    fetchAnnexures,
    createTender,
    fetchAIRecommendation,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { numberToIndianWords } from "../utils/numberToWords";

const CreateTender = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [terms, setTerms] = useState([]);
    const [annexures, setAnnexures] = useState([]);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
    const [activeAnnexCategoryFilter, setActiveAnnexCategoryFilter] = useState(null);
    const [previewAnnexure, setPreviewAnnexure] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [termSearchQuery, setTermSearchQuery] = useState("");

    const handleAiRecommend = async () => {
        if (!formData.tenderName.trim()) {
            alert("Please enter a Tender / Procurement Title first so the AI can analyze your requirements.");
            return;
        }
        setAiLoading(true);
        try {
            const result = await fetchAIRecommendation({
                tenderName: formData.tenderName,
                documentType: formData.documentType,
                tenderCategory: formData.tenderCategory,
                estimatedCost: formData.estimatedCost,
                departmentName: formData.departmentName,
            });

            setAiRecommendation(result);
            setFormData(prev => {
                const combinedTerms = Array.from(new Set([...prev.selectedTermIds, ...(result.recommendedTermIds || [])]));
                const combinedAnnex = Array.from(new Set([...prev.selectedAnnexureIds, ...(result.recommendedAnnexureIds || [])]));
                return {
                    ...prev,
                    selectedTermIds: combinedTerms,
                    selectedAnnexureIds: combinedAnnex,
                };
            });
        } catch (err) {
            console.error("AI recommendation error:", err);
            alert("AI recommendation failed: " + err.message);
        } finally {
            setAiLoading(false);
        }
    };

    const DOCUMENT_TYPES = [
        {
            id: "Limited Tender Document",
            title: "Limited Tender Document",
            description: "Formal sealed quotation letter format with 2-cover submission and Annexure-A items schedule (e.g. Sports Equipment, Lab Supplies, Local Procurement)",
            badge: "Sealed Quotations"
        },
        {
            id: "GeM ATC Document",
            title: "GeM ATC Document",
            description: "GeM Portal Additional Terms and Conditions with cover page, summary table, and mapped clauses",
            badge: "GeM Portal"
        },
        {
            id: "e-tender Document",
            title: "e-tender Document",
            description: "State/Central e-Procurement Portal tender document format",
            badge: "e-Procurement"
        }
    ];

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const defaultEndDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const defaultTechEvalDate = new Date(today.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        id: null,
        documentType: "Limited Tender Document",
        tenderCategory: "goods",
        tenderType: "limited",
        departmentName: "",
        departmentEmail: "",
        tenderInvitingAuthority: "",
        tenderName: "",
        tenderNo: "",
        procurementLocations: "",
        itemQuantity: "1 Unit",
        estimatedCost: "",
        estimatedCostWords: "",
        bidValidity: "90",
        tenderFee: "1000",
        emdRequired: "",
        emdAmount: "",
        emdAmountWords: "",
        pbgRequired: "",
        pbgAmount: "",
        pbgAmountWords: "",
        emdPledgeOfficer: "Finance Officer, H.P. University, Shimla-05",
        publishDate: formattedToday,
        isPreBidRequired: "no",
        preBidDate: "",
        bidStartDate: formattedToday,
        bidEndDate: defaultEndDate,
        bidEndTime: "5:00 P.M.",
        offlineSubmissionDate: defaultEndDate,
        techEvalDate: defaultTechEvalDate,
        techEvalTime: "11:30 A.M.",
        openingVenue: "Store Purchase Office",
        deliveryDays: "15",
        warrantyDurable: "12 months",
        warrantyConsumable: "6 months",
        courtJurisdiction: "Courts in Shimla Urban",
        selectedTermIds: [],
        isAnnexureRequired: false,
        selectedAnnexureIds: [],
        itemsList: [
            { srNo: 1, name: "", specs: "", quantity: "1" }
        ],
        variables: {},
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                departmentName: user.departmentName || prev.departmentName,
                departmentEmail: user.email || prev.departmentEmail,
                tenderInvitingAuthority: user.designation ? `${user.designation}` : prev.tenderInvitingAuthority,
            }));
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDashboardData();
            setCategories(data.categories || []);
            setTerms(data.terms || []);
            const annexData = await fetchAnnexures();
            setAnnexures(annexData || []);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "estimatedCost") {
            const words = numberToIndianWords(value);
            setFormData((prev) => ({
                ...prev,
                estimatedCost: value,
                estimatedCostWords: words || prev.estimatedCostWords,
            }));
            return;
        }

        if (name === "emdAmount") {
            const words = numberToIndianWords(value);
            setFormData((prev) => ({
                ...prev,
                emdAmount: value,
                emdRequired: value,
                emdAmountWords: words || prev.emdAmountWords,
            }));
            return;
        }

        if (name === "pbgAmount") {
            const words = numberToIndianWords(value);
            setFormData((prev) => ({
                ...prev,
                pbgAmount: value,
                pbgRequired: value,
                pbgAmountWords: words || prev.pbgAmountWords,
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDocTypeSelect = (typeId) => {
        let defaultTenderType = "gem";
        if (typeId === "Limited Tender Document") {
            defaultTenderType = "limited";
        } else if (typeId === "e-tender Document") {
            defaultTenderType = "etender";
        }

        setFormData((prev) => ({
            ...prev,
            documentType: typeId,
            tenderType: defaultTenderType,
        }));
    };

    // Item row management for Limited Tender / Schedule of Items
    const handleItemChange = (index, field, value) => {
        setFormData((prev) => {
            const updated = [...prev.itemsList];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, itemsList: updated };
        });
    };

    const addItemRow = () => {
        setFormData((prev) => ({
            ...prev,
            itemsList: [
                ...prev.itemsList,
                { srNo: prev.itemsList.length + 1, name: "", specs: "", quantity: "1" },
            ],
        }));
    };

    const removeItemRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            itemsList: prev.itemsList
                .filter((_, i) => i !== index)
                .map((item, idx) => ({ ...item, srNo: idx + 1 })),
        }));
    };

    // Terms toggle with automatic Annexure synchronization
    const toggleTermSelection = (termId) => {
        const clickedTerm = terms.find((t) => t.id === termId);
        const hasLinkedAnnex = clickedTerm && clickedTerm.hasAnnexure && clickedTerm.annexureId;

        setFormData((prev) => {
            const currentIds = prev.selectedTermIds || [];
            const isCurrentlySelected = currentIds.includes(termId);
            const newTermIds = isCurrentlySelected
                ? currentIds.filter((id) => id !== termId)
                : [...currentIds, termId];

            let newAnnexureIds = [...(prev.selectedAnnexureIds || [])];

            if (!isCurrentlySelected && hasLinkedAnnex) {
                // If term is newly selected and has an annexure, auto-add annexure
                if (!newAnnexureIds.includes(clickedTerm.annexureId)) {
                    newAnnexureIds.push(clickedTerm.annexureId);
                }
            }

            return {
                ...prev,
                selectedTermIds: newTermIds,
                selectedAnnexureIds: newAnnexureIds,
            };
        });
    };

    // Annexure toggle
    const toggleAnnexureSelection = (annexId) => {
        // Check if mandatory by any selected term
        const isMandatory = terms.some(
            (t) => formData.selectedTermIds.includes(t.id) && t.hasAnnexure && t.annexureId === annexId
        );

        if (isMandatory) {
            alert("This Annexure is mandatorily required because you selected a corresponding Term/Clause above.");
            return;
        }

        setFormData((prev) => {
            const current = prev.selectedAnnexureIds || [];
            if (current.includes(annexId)) {
                return { ...prev, selectedAnnexureIds: current.filter((id) => id !== annexId) };
            } else {
                return { ...prev, selectedAnnexureIds: [...current, annexId] };
            }
        });
    };

    // Get list of mandatory annexure IDs based on selected terms
    const mandatoryAnnexureIds = terms
        .filter((t) => formData.selectedTermIds.includes(t.id) && t.hasAnnexure && t.annexureId)
        .map((t) => t.annexureId);

    // Detect custom dynamic variables / placeholders in selected terms
    const getDetectedPlaceholders = () => {
        const selectedTermsList = terms.filter((t) => (formData.selectedTermIds || []).includes(t.id));
        const placeholderMap = new Map(); // placeholderKey -> array of term titles using it

        selectedTermsList.forEach((term) => {
            const textToScan = `${term.title || ""} ${term.description || ""}`;
            const matches = textToScan.match(/\{\{([^}]+)\}\}/g) || [];
            matches.forEach((m) => {
                const rawKey = m.replace(/^\{\{|\}\}$/g, "").trim();
                // Exclude system global constants
                if (rawKey && rawKey !== "itemsTable") {
                    if (!placeholderMap.has(rawKey)) {
                        placeholderMap.set(rawKey, []);
                    }
                    if (!placeholderMap.get(rawKey).includes(term.title)) {
                        placeholderMap.get(rawKey).push(term.title);
                    }
                }
            });
        });

        return Array.from(placeholderMap.entries()).map(([key, usedInTerms]) => ({
            key,
            usedInTerms,
        }));
    };

    const handleVariableChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            variables: {
                ...prev.variables,
                [key]: value,
            },
        }));
    };

    useEffect(() => {
        const typeParam = searchParams.get("type");
        if (typeParam === "limited") {
            setFormData((prev) => ({
                ...prev,
                documentType: "Limited Tender Document",
                tenderType: "limited",
            }));
        } else if (typeParam === "gem") {
            setFormData((prev) => ({
                ...prev,
                documentType: "GeM ATC Document",
                tenderType: "gem",
            }));
        } else if (typeParam === "etender") {
            setFormData((prev) => ({
                ...prev,
                documentType: "e-tender Document",
                tenderType: "etender",
            }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tenderPayload = {
                ...formData,
                estimatedCost: Number(formData.estimatedCost) || 0,
                emdAmount: Number(formData.emdAmount) || 0,
                pbgAmount: Number(formData.pbgAmount) || 0,
                deliveryDays: Number(formData.deliveryDays) || 15,
                variables: {
                    ...formData.variables,
                    estimated_cost_words: formData.estimatedCostWords,
                    emd_amount_words: formData.emdAmountWords,
                    pbg_amount_words: formData.pbgAmountWords,
                    procurement_locations: formData.procurementLocations,
                    delivery_days: formData.deliveryDays,
                    warranty_durable: formData.warrantyDurable,
                    warranty_consumable: formData.warrantyConsumable,
                    court_jurisdiction: formData.courtJurisdiction,
                },
            };

            const created = await createTender(tenderPayload);
            navigate(`/preview/${created.id}`);
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save tender: " + (err.message || "Please check your inputs."));
        } finally {
            setLoading(false);
        }
    };

    const isLimited = formData.documentType === "Limited Tender Document";
    const isGeM = formData.documentType === "GeM ATC Document";
    const isETender = formData.documentType === "e-tender Document";

    // Filter annexures for display
    const filteredAnnexures = annexures.filter((a) => {
        const matchesCategory =
            activeAnnexCategoryFilter === null || a.category === activeAnnexCategoryFilter;
        const matchesDocType =
            a.applicableDocTypes?.includes("all") ||
            a.applicableDocTypes?.includes(formData.documentType);
        return matchesCategory && matchesDocType;
    });

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Tender Document</h1>
                <p className="text-slate-500 mt-1">Select document type and fill in the required dynamic specifications.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. DOCUMENT TYPE SELECTOR */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" /> Step 1: Select Document Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {DOCUMENT_TYPES.map((type) => {
                            const isSelected = formData.documentType === type.id;
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => handleDocTypeSelect(type.id)}
                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                        isSelected
                                            ? "border-purple-600 bg-purple-50/60 shadow-md shadow-purple-500/10 scale-[1.01]"
                                            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                    isSelected ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {type.badge}
                                            </span>
                                            {isSelected && <CheckSquare className="w-5 h-5 text-purple-600" />}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-base mb-1">{type.title}</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">{type.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. BASIC TENDER DETAILS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                        <Building className="w-5 h-5 text-purple-600" />
                        {isLimited
                            ? "Limited Tender / Notice Details"
                            : isGeM
                            ? "GeM Additional Terms & Conditions (ATC) Information"
                            : "e-Tender Document Information"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                {isLimited
                                    ? "Subject / Procurement Title"
                                    : isGeM
                                    ? "Equipment / Item Name (as per GeM Bid)"
                                    : "Tender Name / Scope of Work"} *
                            </label>
                            <input
                                type="text"
                                name="tenderName"
                                value={formData.tenderName}
                                onChange={handleChange}
                                placeholder={
                                    isLimited
                                        ? "e.g. Purchase of Sports Items for Chief Warden (Boys Hostels)"
                                        : isGeM
                                        ? "e.g. Procurement of High Resolution X-ray Diffractometer (XRD)"
                                        : "e.g. Printing and Supply of Self Learning Material (SLM) for CDOE"
                                }
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                {isGeM ? "GeM Bid Number / Reference No." : "Tender / File Reference No."} *
                            </label>
                            <input
                                type="text"
                                name="tenderNo"
                                value={formData.tenderNo}
                                onChange={handleChange}
                                placeholder={
                                    isLimited
                                        ? "e.g. 1-13/2009-HPU (CW)"
                                        : isGeM
                                        ? "e.g. GEM/2026/B/1234567"
                                        : "e.g. HPU/CDOE/2026/01"
                                }
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Department / Workshop / Centre Name *
                            </label>
                            <input
                                type="text"
                                name="departmentName"
                                value={formData.departmentName}
                                onChange={handleChange}
                                placeholder="e.g. Store Purchase Office or Department of Physics"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Department Official Email *
                            </label>
                            <input
                                type="email"
                                name="departmentEmail"
                                value={formData.departmentEmail}
                                onChange={handleChange}
                                placeholder="e.g. spo@hpuniv.ac.in or physicshpu@gmail.com"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Tender Inviting Authority / Designation *
                            </label>
                            <input
                                type="text"
                                name="tenderInvitingAuthority"
                                value={formData.tenderInvitingAuthority}
                                onChange={handleChange}
                                placeholder="e.g. Store Purchase Officer / Chairman / Director"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        {isLimited && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Specific Hostels / Locations / Purpose
                                </label>
                                <input
                                    type="text"
                                    name="procurementLocations"
                                    value={formData.procurementLocations}
                                    onChange={handleChange}
                                    placeholder="e.g. Tagore Boys Hostel, SBS Tribal Boys Hostel, and Dr. Y.S. Parmar Boys Hostel of H.P. University, Summerhill, Shimla-171005"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                />
                            </div>
                        )}

                        {isGeM && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Procurement Quantity / Units
                                </label>
                                <input
                                    type="text"
                                    name="itemQuantity"
                                    value={formData.itemQuantity}
                                    onChange={handleChange}
                                    placeholder="e.g. 1 Complete System"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                />
                            </div>
                        )}

                        {isETender && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tender Document Fee (₹)
                                </label>
                                <input
                                    type="text"
                                    name="tenderFee"
                                    value={formData.tenderFee}
                                    onChange={handleChange}
                                    placeholder="e.g. 1000"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ESTIMATED COST & SECURITY DEPOSITS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                        <DollarSign className="w-5 h-5 text-purple-600" /> Estimated Value & Security Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Approximate / Estimated Cost (₹) *
                            </label>
                            <input
                                type="number"
                                name="estimatedCost"
                                value={formData.estimatedCost}
                                onChange={handleChange}
                                placeholder="e.g. 229000"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Estimated Cost (in Words) *
                            </label>
                            <input
                                type="text"
                                name="estimatedCostWords"
                                value={formData.estimatedCostWords}
                                onChange={handleChange}
                                placeholder="e.g. Rupees Two Lakh Twenty-Nine Thousand Only"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                EMD Amount (₹) *
                            </label>
                            <input
                                type="text"
                                name="emdAmount"
                                value={formData.emdAmount}
                                onChange={handleChange}
                                placeholder="e.g. 5000"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                EMD Amount in Words
                            </label>
                            <input
                                type="text"
                                name="emdAmountWords"
                                value={formData.emdAmountWords}
                                onChange={handleChange}
                                placeholder="e.g. Rupees Five Thousand Only"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Performance Bank Guarantee (PBG Amount ₹)
                            </label>
                            <input
                                type="text"
                                name="pbgAmount"
                                value={formData.pbgAmount}
                                onChange={handleChange}
                                placeholder="e.g. 10000"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                EMD / PBG Pledge Officer *
                            </label>
                            <input
                                type="text"
                                name="emdPledgeOfficer"
                                value={formData.emdPledgeOfficer}
                                onChange={handleChange}
                                placeholder="e.g. Finance Officer, H.P. University, Shimla-05"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 4. CRITICAL DATES & DEADLINES */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                        <Calendar className="w-5 h-5 text-indigo-600" /> Key Dates & Deadlines
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Notice / Publish Date *
                            </label>
                            <input
                                type="date"
                                name="publishDate"
                                value={formData.publishDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Submission Deadline Date *
                            </label>
                            <input
                                type="date"
                                name="bidEndDate"
                                value={formData.bidEndDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Deadline Time
                            </label>
                            <input
                                type="text"
                                name="bidEndTime"
                                value={formData.bidEndTime}
                                onChange={handleChange}
                                placeholder="e.g. 5:00 P.M."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Technical Bid Opening Date *
                            </label>
                            <input
                                type="date"
                                name="techEvalDate"
                                value={formData.techEvalDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Bid Opening Time
                            </label>
                            <input
                                type="text"
                                name="techEvalTime"
                                value={formData.techEvalTime}
                                onChange={handleChange}
                                placeholder="e.g. 11:30 A.M."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Opening Venue / Office
                            </label>
                            <input
                                type="text"
                                name="openingVenue"
                                value={formData.openingVenue}
                                onChange={handleChange}
                                placeholder="e.g. Store Purchase Office"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. SCHEDULE OF ARTICLES & FINANCIAL BID FORM (ONLY FOR LIMITED TENDER) */}
                {isLimited && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-amber-600" />
                                    Schedule of Articles / Items (Annexure-A Financial Bid Table)
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Define the articles, technical specifications, and quantities to populate the Annexure-A Financial Bid submission form.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                <Plus size={14} /> Add Item Row
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 w-12 text-center">Sr.</th>
                                        <th className="p-3 w-1/3">Name of Article / Equipment</th>
                                        <th className="p-3">Specification / Dimensions / Standards</th>
                                        <th className="p-3 w-28 text-center">Quantity</th>
                                        <th className="p-3 w-12 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.itemsList.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/60">
                                            <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                                            <td className="p-2.5">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                                                    placeholder="e.g. Table Tennis Table or Sports Item"
                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <input
                                                    type="text"
                                                    value={item.specs}
                                                    onChange={(e) => handleItemChange(idx, "specs", e.target.value)}
                                                    placeholder="e.g. 22mm Top, TTFI approved"
                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="p-2.5">
                                                <input
                                                    type="text"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                                                    placeholder="Qty"
                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </td>
                                            <td className="p-2.5 text-center">
                                                {formData.itemsList.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItemRow(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Remove Row"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. TERMS & CONDITIONS MAPPING - TWO COLUMN SELECTION WITH SEARCH */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Terms & Conditions Selection
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Browse clause categories on the left and select applicable clauses on the right.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleAiRecommend}
                                disabled={aiLoading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 cursor-pointer"
                            >
                                {aiLoading ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                                {aiLoading ? "Analyzing Procurement..." : "AI Auto-Select Clauses"}
                            </button>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-xl border border-indigo-100 shadow-xs">
                                {formData.selectedTermIds.length} Selected
                            </span>
                        </div>
                    </div>

                    {/* TOP SEARCH BAR */}
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={termSearchQuery}
                                onChange={(e) => setTermSearchQuery(e.target.value)}
                                placeholder="Search clauses by keyword, title, or description (e.g. Warranty, EMD, Inspection, MAF, Delivery)..."
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                            {termSearchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setTermSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {termSearchQuery && (
                            <button
                                type="button"
                                onClick={() => setTermSearchQuery("")}
                                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* AI Recommendation Rationale Box */}
                    {aiRecommendation && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 animate-in fade-in duration-300">
                            <div className="flex justify-between items-start mb-1.5">
                                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-600" /> AI Procurement Analysis ({aiRecommendation.source || "OpenRouter Nemotron"})
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setAiRecommendation(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {aiRecommendation.rationale}
                            </p>
                        </div>
                    )}

                    {/* TWO COLUMN INTERACTION CONTAINER */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* COLUMN 1: SIDEBAR OF CATEGORIES */}
                        <div className="md:col-span-4 lg:col-span-4 space-y-2 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200">
                            <div className="flex justify-between items-center px-2 py-1 mb-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Categories
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                    {categories.length} total
                                </span>
                            </div>

                            {/* "All Categories" Item */}
                            <button
                                type="button"
                                onClick={() => setActiveCategoryFilter(null)}
                                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                                    activeCategoryFilter === null
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                        : "bg-white text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900 border-slate-200/80"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Layers className={`w-4 h-4 flex-shrink-0 ${activeCategoryFilter === null ? "text-indigo-200" : "text-slate-400"}`} />
                                    <span className="text-xs font-bold truncate">All Categories</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {formData.selectedTermIds.length > 0 && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            activeCategoryFilter === null ? "bg-indigo-500 text-white" : "bg-purple-100 text-purple-800"
                                        }`}>
                                            {formData.selectedTermIds.length} sel
                                        </span>
                                    )}
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                        activeCategoryFilter === null ? "bg-indigo-700/60 text-indigo-100" : "bg-slate-100 text-slate-500"
                                    }`}>
                                        {terms.length}
                                    </span>
                                </div>
                            </button>

                            {/* Individual Categories */}
                            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                                {categories.map((cat) => {
                                    const catTerms = terms.filter((t) => t.categoryId === cat.id);
                                    const selectedInCat = catTerms.filter((t) => formData.selectedTermIds.includes(t.id)).length;
                                    const isActive = activeCategoryFilter === cat.id;

                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setActiveCategoryFilter(cat.id)}
                                            className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                                                isActive
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                    : "bg-white text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900 border-slate-200/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    selectedInCat > 0 ? (isActive ? "bg-green-300" : "bg-emerald-500") : (isActive ? "bg-indigo-300" : "bg-slate-300")
                                                }`} />
                                                <span className="text-xs font-semibold truncate">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {selectedInCat > 0 && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                                                        isActive ? "bg-indigo-500 text-white" : "bg-emerald-100 text-emerald-800"
                                                    }`}>
                                                        <CheckCircle2 size={10} /> {selectedInCat}
                                                    </span>
                                                )}
                                                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                                    isActive ? "bg-indigo-700/60 text-indigo-100" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {catTerms.length}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COLUMN 2: TERMS / CLAUSES CHECKBOX LIST */}
                        <div className="md:col-span-8 lg:col-span-8 space-y-3">
                            {/* Active Category Header & Bulk Selection Tools */}
                            {(() => {
                                const q = termSearchQuery.trim().toLowerCase();
                                const filteredTerms = terms.filter((t) => {
                                    const matchesCat = activeCategoryFilter === null || t.categoryId === activeCategoryFilter;
                                    if (!q) return matchesCat;
                                    const matchesSearch =
                                        (t.title && t.title.toLowerCase().includes(q)) ||
                                        (t.description && t.description.toLowerCase().includes(q)) ||
                                        (t.categoryName && t.categoryName.toLowerCase().includes(q)) ||
                                        String(t.id).includes(q);
                                    return matchesCat && matchesSearch;
                                });

                                return (
                                    <>
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-800">
                                                    {activeCategoryFilter === null
                                                        ? "All Clauses"
                                                        : categories.find((c) => c.id === activeCategoryFilter)?.name || "Category Clauses"}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    ({filteredTerms.length} available{termSearchQuery ? " matching search" : ""})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const visibleIds = filteredTerms.map((t) => t.id);
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            selectedTermIds: Array.from(new Set([...prev.selectedTermIds, ...visibleIds])),
                                                        }));
                                                    }}
                                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                                >
                                                    Select All Visible
                                                </button>
                                                <span className="text-slate-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const visibleIdSet = new Set(filteredTerms.map((t) => t.id));
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            selectedTermIds: prev.selectedTermIds.filter((id) => !visibleIdSet.has(id)),
                                                        }));
                                                    }}
                                                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                                                >
                                                    Deselect All Visible
                                                </button>
                                            </div>
                                        </div>

                                        {/* Terms Cards Scrollable List */}
                                        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                                            {filteredTerms.length === 0 ? (
                                                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-500">
                                                        No clauses found matching "{termSearchQuery}".
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTermSearchQuery("")}
                                                        className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                                                    >
                                                        Clear search filter
                                                    </button>
                                                </div>
                                            ) : (
                                                filteredTerms.map((term) => {
                                                    const isSelected = formData.selectedTermIds.includes(term.id);
                                                    return (
                                                        <div
                                                            key={term.id}
                                                            onClick={() => toggleTermSelection(term.id)}
                                                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                                                                isSelected
                                                                    ? "border-indigo-400 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-200"
                                                                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60 bg-white"
                                                            }`}
                                                        >
                                                            <div className="mt-0.5 flex-shrink-0">
                                                                {isSelected ? (
                                                                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                                ) : (
                                                                    <Square className="w-4 h-4 text-slate-300" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <span className="text-xs font-bold text-slate-900">{term.title}</span>
                                                                    {term.mandatory && (
                                                                        <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100">
                                                                            Mandatory
                                                                        </span>
                                                                    )}
                                                                    {term.hasAnnexure && (
                                                                        <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-100">
                                                                            <Paperclip className="w-2.5 h-2.5 text-purple-600" /> Annexure Linked
                                                                        </span>
                                                                    )}
                                                                    {activeCategoryFilter === null && term.categoryName && (
                                                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                                                                            {term.categoryName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-600 leading-relaxed">{term.description}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* 6.1 DYNAMIC CLAUSE PLACEHOLDERS & CUSTOM VARIABLES */}
                {(() => {
                    const detectedPlaceholders = getDetectedPlaceholders();
                    if (detectedPlaceholders.length === 0) return null;

                    return (
                        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white p-6 rounded-2xl border border-indigo-200 shadow-sm space-y-4 animate-in fade-in duration-300">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-indigo-100">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-indigo-600" /> Clause Dynamic Variables & Placeholders
                                    </h2>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        The terms and conditions selected above contain dynamic placeholders enclosed in <code className="bg-indigo-100/80 text-indigo-800 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{"{{...}}"}</code>. Enter the custom values below to populate them directly into your tender document.
                                    </p>
                                </div>
                                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200 shadow-xs flex items-center gap-1 self-start sm:self-auto">
                                    <Sparkles className="w-3 h-3 text-indigo-600" /> {detectedPlaceholders.length} Variable{detectedPlaceholders.length > 1 ? "s" : ""} Detected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                                {detectedPlaceholders.map(({ key, usedInTerms }) => {
                                    const val = formData.variables?.[key] !== undefined ? formData.variables[key] : "";
                                    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

                                    return (
                                        <div
                                            key={key}
                                            className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs space-y-2 hover:border-indigo-300 transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-1">
                                                <label className="block text-xs font-bold text-slate-800 truncate" title={key}>
                                                    {label}
                                                </label>
                                                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-semibold">
                                                    {"{{" + key + "}}"}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={val}
                                                onChange={(e) => handleVariableChange(key, e.target.value)}
                                                placeholder={`Enter ${label.toLowerCase()}...`}
                                                className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-medium"
                                            />
                                            <div
                                                className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5 truncate"
                                                title={`Used in: ${usedInTerms.join(", ")}`}
                                            >
                                                <span className="font-semibold text-slate-400">Used in:</span>
                                                <span className="truncate text-slate-600 font-medium">{usedInTerms.join(", ")}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* 7. IS ANNEXURE REQUIRED? & ANNEXURES SELECTION */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Paperclip className="w-5 h-5 text-purple-600" /> Annexures & Undertakings Management
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Select required Annexures, declarations, proformas, and financial forms to attach to the final document.
                            </p>
                        </div>

                        {/* IS ANNEXURE REQUIRED TOGGLE */}
                        <div className="flex items-center gap-3 bg-purple-50/70 border border-purple-200 px-4 py-2.5 rounded-xl">
                            <div>
                                <span className="text-xs font-bold text-slate-800 block">Is Annexure Required?</span>
                                <span className="text-[11px] text-slate-500">Include annexures in final tender</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isAnnexureRequired}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, isAnnexureRequired: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>

                    {formData.isAnnexureRequired ? (
                        <div className="space-y-4">
                            {/* Category Filter Pills for Annexures */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveAnnexCategoryFilter(null)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        activeAnnexCategoryFilter === null
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    All Formats ({filteredAnnexures.length})
                                </button>
                                {["financial", "eligibility", "undertaking", "technical", "general", "custom"].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveAnnexCategoryFilter(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                            activeAnnexCategoryFilter === cat
                                                ? "bg-purple-600 text-white shadow-sm"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Annexures Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                                {filteredAnnexures.map((annex) => {
                                    const isSelected = formData.selectedAnnexureIds.includes(annex.id);
                                    const isMandatory = mandatoryAnnexureIds.includes(annex.id);
                                    const linkedTerm = terms.find((t) => t.hasAnnexure && t.annexureId === annex.id && formData.selectedTermIds.includes(t.id));

                                    return (
                                        <div
                                            key={annex.id}
                                            onClick={() => toggleAnnexureSelection(annex.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                                                isSelected
                                                    ? "border-purple-500 bg-purple-50/40 shadow-xs"
                                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                            {annex.category}
                                                        </span>
                                                        {isMandatory && (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Lock className="w-2.5 h-2.5 text-amber-700" /> Mandatory (Clause Linked)
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                                                    )}
                                                </div>

                                                <h4 className="font-bold text-xs text-slate-900 leading-snug mb-1">{annex.title}</h4>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {annex.description || "Official proforma format to be filled and submitted by bidder."}
                                                </p>
                                                {linkedTerm && (
                                                    <p className="text-[10px] text-purple-700 font-semibold mt-1.5">
                                                        ↳ Required by: <span className="underline">{linkedTerm.title}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-400 font-mono">{annex.code || "ANNEX"}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewAnnexure(annex);
                                                    }}
                                                    className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                                                >
                                                    <Eye className="w-3 h-3" /> Preview Format
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                            <p className="text-sm font-semibold text-slate-600">Annexures disabled for this tender.</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Toggle "Is Annexure Required?" above to attach declarations, bid forms, and compliance sheets.
                            </p>
                        </div>
                    )}
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end gap-4 pt-4 pb-12">
                    <button
                        type="button"
                        onClick={() => navigate("/my-tenders")}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        Generate & Preview Document
                    </button>
                </div>
            </form>

            {/* ANNEXURE PREVIEW MODAL */}
            {previewAnnexure && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <div>
                                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {previewAnnexure.category} Annexure Format
                                </span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{previewAnnexure.title}</h3>
                            </div>
                            <button
                                onClick={() => setPreviewAnnexure(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
                            <div
                                className="border border-slate-200 rounded-xl p-6 bg-slate-50/50"
                                dangerouslySetInnerHTML={{ __html: previewAnnexure.contentTemplate }}
                            />
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setPreviewAnnexure(null)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateTender;
