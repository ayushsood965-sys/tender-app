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
} from "lucide-react";
import {
    fetchDashboardData,
    createTender,
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
    const [showVariables, setShowVariables] = useState(false);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

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

    const VARIABLE_FIELDS = [
        { key: "portal_name", label: "Procurement Portal (e.g. GeM / hptenders.gov.in)" },
        { key: "scope_of_work", label: "Scope of Work / Item Description" },
        { key: "tender_fee", label: "Tender Fee (Amount)" },
        { key: "tender_fee_words", label: "Tender Fee (in Words)" },
        { key: "bid_validity_days", label: "Bid Validity Period (Days)" },
        { key: "experience_years", label: "Experience (Years)" },
        { key: "financial_years", label: "Financial Years (e.g., 2021-22, 2022-23, 2023-24)" },
        { key: "past_performance_percentage", label: "Past Performance (%)" },
        { key: "min_turnover", label: "Minimum Average Annual Turnover" },
        { key: "emd_amount", label: "EMD Amount" },
        { key: "emd_amount_words", label: "EMD Amount (Words)" },
        { key: "emd_pledge_officer", label: "EMD / PBG Pledge Officer" },
        { key: "submission_officer", label: "Hardcopy Submission Officer" },
        { key: "department_address", label: "Department Address" },
        { key: "pbg_percentage", label: "PBG Percentage (%)" },
        { key: "pbg_amount", label: "PBG Fixed Amount" },
        { key: "delivery_days", label: "Delivery Timeline (Days)" },
        { key: "delivery_location", label: "Delivery Destination Location" },
        { key: "warranty_years", label: "Comprehensive Warranty (Years)" },
        { key: "court_jurisdiction", label: "Court Jurisdiction" },
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
        itemQuantity: "",
        estimatedCost: "",
        estimatedCostWords: "",
        bidValidity: "90",
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
            setFormData(prev => ({
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
            // Preselect mandatory or first 10 terms if empty
            if (data.terms && data.terms.length > 0) {
                const initialSelected = data.terms.filter(t => t.mandatory).map(t => t.id);
                setFormData(prev => ({
                    ...prev,
                    selectedTermIds: prev.selectedTermIds.length > 0 ? prev.selectedTermIds : initialSelected.slice(0, 15)
                }));
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-update words when estimated cost or EMD changes
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
        if (typeId === "Limited Tender Document") defaultTenderType = "limited";
        if (typeId === "e-tender Document") defaultTenderType = "etender";

        setFormData(prev => ({
            ...prev,
            documentType: typeId,
            tenderType: defaultTenderType
        }));
    };

    // Item row management for Limited Tender
    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.itemsList];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, itemsList: updated };
        });
    };

    const addItemRow = () => {
        setFormData(prev => ({
            ...prev,
            itemsList: [
                ...prev.itemsList,
                { srNo: prev.itemsList.length + 1, name: "", specs: "", quantity: "1" }
            ]
        }));
    };

    const removeItemRow = (index) => {
        setFormData(prev => ({
            ...prev,
            itemsList: prev.itemsList.filter((_, i) => i !== index).map((item, idx) => ({ ...item, srNo: idx + 1 }))
        }));
    };

    const toggleTermSelection = (termId) => {
        setFormData((prev) => {
            const currentIds = prev.selectedTermIds || [];
            if (currentIds.includes(termId)) {
                return {
                    ...prev,
                    selectedTermIds: currentIds.filter((id) => id !== termId),
                };
            } else {
                return { ...prev, selectedTermIds: [...currentIds, termId] };
            }
        });
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
                }
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
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                isSelected ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
                                            }`}>
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
                        {isLimited ? "Limited Tender / Notice Details" : "Tender & Department Information"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                {isLimited ? "Subject / Procurement Title" : "Tender / Item Name"} *
                            </label>
                            <input
                                type="text"
                                name="tenderName"
                                value={formData.tenderName}
                                onChange={handleChange}
                                placeholder={isLimited ? "e.g. Purchase of Sports Items for Chief Warden (Boys Hostels)" : "e.g. Procurement of High Resolution XRD"}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Tender / File Reference No. *
                            </label>
                            <input
                                type="text"
                                name="tenderNo"
                                value={formData.tenderNo}
                                onChange={handleChange}
                                placeholder="e.g. 1-13/2009-HPU (CW) or HPU/PHY/2026/01"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Department / Office Name *
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
                                Department Email *
                            </label>
                            <input
                                type="email"
                                name="departmentEmail"
                                value={formData.departmentEmail}
                                onChange={handleChange}
                                placeholder="e.g. spo@hpuniv.ac.in"
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
                                placeholder="e.g. Store Purchase Officer / Chairman"
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

                {/* 5. SCHEDULE OF ITEMS (FOR LIMITED TENDER) */}
                {isLimited && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-amber-600" /> Schedule of Articles / Items (Annexure-A Table)
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">Define the items, technical specifications, and quantities to be procured.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                            >
                                <Plus size={14} /> Add Item Row
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 w-12 text-center">Sr.</th>
                                        <th className="p-3 w-1/4">Name of Article / Item</th>
                                        <th className="p-3">Specification / Dimensions</th>
                                        <th className="p-3 w-24 text-center">Quantity</th>
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
                                                    placeholder="e.g. Table Tennis Table"
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
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* 6. TERMS & CONDITIONS MAPPING */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-600" /> Terms & Conditions Mapping
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Select clauses to include in your document.</p>
                        </div>
                        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                            {formData.selectedTermIds.length} Clauses Selected
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 pb-3">
                        <button
                            type="button"
                            onClick={() => setActiveCategoryFilter(null)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeCategoryFilter === null
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            All Categories ({terms.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveCategoryFilter(cat.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeCategoryFilter === cat.id
                                        ? "bg-purple-600 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                        {terms
                            .filter((t) => activeCategoryFilter === null || t.categoryId === activeCategoryFilter)
                            .map((term) => {
                                const isSelected = formData.selectedTermIds.includes(term.id);
                                return (
                                    <div
                                        key={term.id}
                                        onClick={() => toggleTermSelection(term.id)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                            isSelected
                                                ? "border-purple-300 bg-purple-50/50 shadow-xs"
                                                : "border-slate-200 hover:border-slate-300 bg-white"
                                        }`}
                                    >
                                        <div className="mt-0.5">
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-800">{term.title}</span>
                                                {term.mandatory && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">Mandatory</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{term.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
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
        </div>
    );
};

export default CreateTender;
