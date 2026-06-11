import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  Hash,
  Layers,
  ArrowRight,
  Database,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  ArrowLeft,
  AlertCircle,
  Tag,
  Folder,
  Building,
  Mail,
  Users,
  CheckSquare,
  Square,
  List,
  Eye,
  UserCheck,
  RefreshCw,
  Download,
} from "lucide-react";
import { Routes, Route } from "react-router-dom";
import TenderPreview from "./pages/TenderPreview";

function Dashboard() {
  const [view, setView] = useState("form");
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false); // New state for doc generation

  // API Base URL
  const API_URL = "/api";

  // --- STATE ---
  const [savedTenders, setSavedTenders] = useState([]);
  const [activeTender, setActiveTender] = useState(null);
  const [categories, setCategories] = useState([]);
  const [terms, setTerms] = useState([]);

  // Saved Docs State
  const [savedDocs, setSavedDocs] = useState([]);
  const [savedDocsLoading, setSavedDocsLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showVariables, setShowVariables] = useState(false);

  const VARIABLE_FIELDS = [
    { key: "scope_of_work", label: "Scope of Work" },
    { key: "experience_years", label: "Experience (Years)" },
    { key: "financial_years", label: "Financial Years (e.g., 2021-24)" },
    { key: "past_performance_percentage", label: "Past Performance (%)" },
    { key: "min_turnover", label: "Minimum Turnover" },
    { key: "emd_amount", label: "EMD Amount" },
    { key: "emd_amount_words", label: "EMD Amount (Words)" },
    { key: "emd_pledge_officer", label: "EMD Pledge Officer" },
    { key: "submission_officer", label: "Submission Officer" },
    { key: "emd_submission_days", label: "EMD Submission Days" },
    { key: "pbg_percentage", label: "PBG Percentage" },
    { key: "pbg_submission_days", label: "PBG Submission Days" },
    { key: "pbg_validity_period", label: "PBG Validity (Months)" },
    { key: "annexure_ref", label: "Annexure Reference" },
    { key: "stamp_paper_value", label: "Stamp Paper Value" },
    { key: "contract_signing_days", label: "Contract Signing Days" },
    { key: "delivery_days", label: "Delivery Timeline (Days)" },
    { key: "penalty_rate", label: "Penalty Rate (%)" },
    { key: "max_penalty", label: "Max Penalty (%)" },
    { key: "max_delay_weeks", label: "Max Delay (Weeks)" },
    { key: "warranty_years", label: "Warranty (Years)" },
    { key: "response_time_hours", label: "Response Time (Hours)" },
    { key: "uptime_guarantee", label: "Uptime Guarantee (%)" },
    { key: "service_penalty_1", label: "Service Penalty (1st Week)" },
    { key: "service_penalty_2", label: "Service Penalty (2nd Week+)" },
    { key: "max_service_delay_days", label: "Max Service Delay (Days)" },
    { key: "spare_parts_years", label: "Spare Parts Availability (Years)" },
    { key: "arbitrator_authority", label: "Arbitrator Authority" },
    { key: "court_jurisdiction", label: "Court Jurisdiction" },
  ];

  const [formData, setFormData] = useState({
    id: null,
    tenderCategory: "service",
    tenderType: "gem",
    departmentName: "Department of Physics, H.P. University",
    departmentEmail: "physicshpu@gmail.com",
    tenderInvitingAuthority: "",
    tenderName: "",
    tenderNo: "",
    itemQuantity: "",
    estimatedCost: "",
    bidValidity: "90",
    emdRequired: "",
    pbgRequired: "",
    emdPledgeOfficer:
      "Finance Officer, Himachal Pradesh University, Summerhill, Shimla - 171005",
    publishDate: "",
    isPreBidRequired: "no",
    preBidDate: "",
    bidStartDate: "",
    bidEndDate: "",
    offlineSubmissionDate: "",
    techEvalDate: "",
    selectedTermIds: [],
    variables: {} // Store dynamic variables here
  });

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [termForm, setTermForm] = useState({
    id: null,
    categoryId: "",
    title: "",
    description: "",
  });

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [editingTenderId, setEditingTenderId] = useState(null); // New state for editing tender
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  // Delete Tender Modal State
  const [tenderToDelete, setTenderToDelete] = useState(null);

  // --- 1. INITIAL LOAD (Fetch from MongoDB) ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/dashboard-data`);
      if (!response.ok) throw new Error("Failed to connect to backend");
      const data = await response.json();

      setCategories(data.categories || []);
      setTerms(data.terms || []);
      setSavedTenders(data.tenders || []);
    } catch (error) {
      console.error("API Error:", error);
      console.warn("Backend unreachable.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS: Main Form ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleVariableChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      variables: { ...prev.variables, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If variables step is not shown yet, show it
    if (!showVariables) {
      setShowVariables(true);
      // Auto-fill some variables from main form if empty
      setFormData(prev => ({
        ...prev,
        variables: {
          ...prev.variables,
          emd_amount: prev.emdRequired,
          emd_pledge_officer: prev.emdPledgeOfficer,
          scope_of_work: prev.tenderName,
        }
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const method = editingTenderId ? "PUT" : "POST";
      const url = editingTenderId
        ? `${API_URL}/tenders/${editingTenderId}`
        : `${API_URL}/tenders`;

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedTender = await response.json();

        if (editingTenderId) {
          setSavedTenders((prev) => prev.map(t => t.id === editingTenderId ? savedTender : t));
        } else {
          setSavedTenders((prev) => [savedTender, ...prev]);
        }

        setView("my-tenders");
        resetForm();
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save to MongoDB. Is server.js running?");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingTenderId(null);
    setFormData({
      id: null,
      tenderCategory: "service",
      tenderType: "gem",
      departmentName: "Department of Physics, H.P. University",
      departmentEmail: "physicshpu@gmail.com",
      tenderInvitingAuthority: "",
      tenderName: "",
      tenderNo: "",
      itemQuantity: "",
      estimatedCost: "",
      bidValidity: "90",
      emdRequired: "",
      pbgRequired: "",
      emdPledgeOfficer:
        "Finance Officer, Himachal Pradesh University, Summerhill, Shimla - 171005",
      publishDate: "",
      isPreBidRequired: "no",
      preBidDate: "",
      bidStartDate: "",
      bidEndDate: "",
      offlineSubmissionDate: "",
      techEvalDate: "",
      selectedTermIds: [],
      variables: {}
    });
    setShowVariables(false);
  };

  const editTender = (tender) => {
    setEditingTenderId(tender.id);
    setFormData({
      ...tender,
      // Ensure dates are formatted correctly for input fields if needed, 
      // but for now passing as is usually works if inputs are text/date
    });
    setView("form");
  };

  const deleteTender = (tenderId) => {
    setTenderToDelete(tenderId);
  };

  const confirmDeleteTender = async () => {
    if (!tenderToDelete) return;
    try {
      const response = await fetch(`${API_URL}/tenders/${tenderToDelete}`, { method: "DELETE" });
      if (response.ok) {
        setSavedTenders(prev => prev.filter(t => t.id !== tenderToDelete));
        setTenderToDelete(null);
      } else {
        alert("Failed to delete tender");
      }
    } catch (err) {
      console.error("Error deleting tender:", err);
      alert("Error deleting tender");
    }
  };

  const viewTenderDetails = async (tender) => {
    setActiveTender(tender);
    setView("tender-details");

    // Fetch saved documents for this tender
    setSavedDocsLoading(true);
    try {
      const response = await fetch(`${API_URL}/tenders/${tender.id}/documents`);
      if (response.ok) {
        const docs = await response.json();
        setSavedDocs(docs);
      }
    } catch (err) {
      console.error("Failed to fetch saved docs", err);
    } finally {
      setSavedDocsLoading(false);
    }
  };

  const deleteSavedDoc = (docId) => {
    setItemToDelete(docId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`${API_URL}/documents/${itemToDelete}`, { method: "DELETE" });
      if (response.ok) {
        setSavedDocs(prev => prev.filter(d => d.id !== itemToDelete));
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Error deleting document");
    }
  };

  // --- HANDLER: Document Generation ---
  const handleGenerateDocument = async () => {
    if (!activeTender) {
      alert("No tender selected");
      return;
    }
    // Open the preview in a new tab
    window.open(`/tender-preview/${activeTender.id}`, "_blank");
  };

  // --- HANDLERS: CRUD (Same as before) ---
  const handleCategoryChange = (e) =>
    setCategoryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (response.ok) {
        const newCat = await response.json();
        setCategories((prev) => [...prev, newCat]);
        setCategoryForm({ id: null, name: "", description: "" });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteCategory = async (id) => {
    // Check if any terms are mapped to this category
    const hasTerms = terms.some((t) => t.categoryId === id);
    if (hasTerms) {
      alert("Cannot delete category: There are T&C mapped to this category. Please delete those T&C first.");
      setDeleteConfirmId(null);
      return;
    }

    try {
      await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTermChange = (e) =>
    setTermForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveTerm = async (e) => {
    e.preventDefault();
    if (!termForm.title) return;
    try {
      // Helper to strip bold tags
      const sanitizeDescription = (text) => {
        if (!text) return "";
        return text.replace(/<\/?(b|strong)[^>]*>/gi, "");
      };

      const payload = {
        ...termForm,
        description: sanitizeDescription(termForm.description),
        categoryId: Number(termForm.categoryId)
      };

      let response;
      if (termForm.id) {
        // UPDATE
        response = await fetch(`${API_URL}/terms/${termForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        response = await fetch(`${API_URL}/terms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const savedTerm = await response.json();
        setTerms((prev) => {
          const exists = prev.find(t => t.id === savedTerm.id);
          if (exists) return prev.map(t => t.id === savedTerm.id ? savedTerm : t);
          return [...prev, savedTerm];
        });
        setTermForm({ id: null, categoryId: "", title: "", description: "" });
        setIsEditing(false);

        // Scroll back to item with highlight
        setTimeout(() => {
          const el = itemRefs.current[savedTerm.id];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-blue-100', 'transition-colors', 'duration-500');
            setTimeout(() => el.classList.remove('bg-blue-100'), 2000);
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteTerm = async (id) => {
    try {
      await fetch(`${API_URL}/terms/${id}`, { method: "DELETE" });
      setTerms((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const requestDelete = (id) => setDeleteConfirmId(id);
  const cancelDelete = () => setDeleteConfirmId(null);
  // Refs for scrolling
  const formRef = React.useRef(null);
  const itemRefs = React.useRef({});

  const editItem = (item, type) => {
    if (type === "cat") setCategoryForm(item);
    else setTermForm(item);
    setIsEditing(true);
    setDeleteConfirmId(null);

    // Auto-scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setTermForm({ id: null, categoryId: "", title: "", description: "" });
    setCategoryForm({ id: null, name: "", description: "" });
  };

  const getSelectionSummary = () => {
    return categories
      .map((cat) => ({
        name: cat.name,
        count: terms.filter(
          (t) =>
            t.categoryId === cat.id && formData.selectedTermIds.includes(t.id)
        ).length,
      }))
      .filter((item) => item.count > 0);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Version?</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Are you sure you want to delete this saved version? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Tender Doc Maker
            </span>
            {loading && (
              <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setView("form")}
              className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "form"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              Data Form
            </button>
            <button
              onClick={() => setView("my-tenders")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "my-tenders" || view === "tender-details"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <List className="w-4 h-4" /> My Tenders
            </button>
            <button
              onClick={() => setView("categories")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "categories"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Folder className="w-4 h-4" /> T&C Categories
            </button>
            <button
              onClick={() => setView("gem-master")}
              className={`whitespace-nowrap flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === "gem-master"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Database className="w-4 h-4" /> T&C Creation Master
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {view === "form" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {editingTenderId ? "Edit Tender" : "New Tender Entry"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {editingTenderId ? "Update tender details & T&Cs." : "Step 1: Fill details & Map T&Cs."}
                </p>
              </div>
              {editingTenderId && (
                <button
                  onClick={() => {
                    resetForm();
                    setView("my-tenders");
                  }}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className={showVariables ? "hidden" : "block"}>
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <Building className="w-5 h-5 text-blue-500" /> Department
                        Details
                      </h2>


                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Department Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="departmentName"
                            value={formData.departmentName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Department Email{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                              type="email"
                              name="departmentEmail"
                              value={formData.departmentEmail}
                              onChange={handleChange}
                              className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tender Inviting Authority (TIA){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                              type="text"
                              name="tenderInvitingAuthority"
                              value={formData.tenderInvitingAuthority}
                              onChange={handleChange}
                              placeholder="e.g. Chairperson, Dept of Physics"
                              className="w-full pl-10 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <Layers className="w-5 h-5 text-blue-500" />{" "}
                        Classification
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="tenderCategory"
                            value={formData.tenderCategory}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          >
                            <option value="service">Service</option>
                            <option value="product">Product</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="tenderType"
                            value={formData.tenderType}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          >
                            <option value="gem">GeM</option>
                            <option value="etender">E-Tender</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <Hash className="w-5 h-5 text-blue-500" /> General Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tender Name / Title{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="tenderName"
                            value={formData.tenderName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Procurement of furniture articles"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tender No <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="tenderNo"
                            value={formData.tenderNo}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Estimated Cost (₹){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="estimatedCost"
                            value={formData.estimatedCost}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="itemQuantity"
                            value={formData.itemQuantity}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Bid Validity (Days){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="bidValidity"
                            value={formData.bidValidity}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <DollarSign className="w-5 h-5 text-blue-500" />{" "}
                        Financials
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            EMD Required <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="emdRequired"
                            value={formData.emdRequired}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            PBG Required <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pbgRequired"
                            value={formData.pbgRequired}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Pledge Officer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="emdPledgeOfficer"
                            value={formData.emdPledgeOfficer}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <Calendar className="w-5 h-5 text-blue-500" /> Dates
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1">
                            Bid Start <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="bidStartDate"
                            value={formData.bidStartDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1">
                            Bid End <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            name="bidEndDate"
                            value={formData.bidEndDate}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 border-b pb-2">
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                        Select Applicable T&Cs
                      </h2>
                      <p className="text-sm text-slate-500">
                        Select categories on the left, then check the clauses you
                        want to include.
                      </p>

                      <div className="flex flex-col md:flex-row border border-slate-300 rounded-lg overflow-hidden h-[500px]">
                        <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-300 overflow-y-auto">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveCategoryFilter(cat.id)}
                              className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-slate-100 transition-colors flex justify-between items-center ${activeCategoryFilter === cat.id
                                ? "bg-white text-blue-600 border-l-4 border-l-blue-600"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                              {cat.name}
                              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                {
                                  terms.filter((t) => t.categoryId === cat.id)
                                    .length
                                }
                              </span>
                            </button>
                          ))}
                          {categories.length === 0 && (
                            <div className="p-4 text-xs text-slate-400">
                              No categories defined.
                            </div>
                          )}
                        </div>

                        <div className="w-full md:w-2/3 bg-white p-4 overflow-y-auto">
                          {!activeCategoryFilter ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                              <Folder className="w-10 h-10 mb-2 opacity-50" />
                              <p>Select a category to view terms</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {terms.filter(
                                (t) => t.categoryId === activeCategoryFilter
                              ).length === 0 ? (
                                <p className="text-sm text-slate-400 italic">
                                  No terms in this category.
                                </p>
                              ) : (
                                terms
                                  .filter(
                                    (t) => t.categoryId === activeCategoryFilter
                                  )
                                  .map((term) => (
                                    <div
                                      key={term.id}
                                      className={`p-3 rounded-lg border transition-all cursor-pointer ${formData.selectedTermIds.includes(
                                        term.id
                                      )
                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-blue-200"
                                        }`}
                                      onClick={() =>
                                        toggleTermSelection(term.id)
                                      }
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.selectedTermIds.includes(
                                            term.id
                                          )
                                            ? "bg-blue-600 border-blue-600"
                                            : "bg-white border-slate-300"
                                            }`}
                                        >
                                          {formData.selectedTermIds.includes(
                                            term.id
                                          ) && (
                                              <CheckSquare className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-medium text-slate-800">
                                            {term.title}
                                          </h4>
                                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {term.description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className={showVariables ? "block" : "hidden"}>
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setShowVariables(false)}
                          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Terms
                        </button>
                      </div>

                      <h2 className="text-xl font-bold text-slate-800 border-b pb-4">
                        Configure Tender Variables
                      </h2>
                      <p className="text-slate-600">
                        Please fill in the values for the variables used in the Terms & Conditions.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {VARIABLE_FIELDS.map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              name={field.key}
                              value={formData.variables?.[field.key] || ""}
                              onChange={handleVariableChange}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Enter ${field.label}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                      {showVariables ? "Final Save & Generate" : "Next: Configure Details"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
        }

        {
          view === "my-tenders" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">
                My Tenders
              </h1>
              {savedTenders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">
                    No tenders yet
                  </h3>
                  <p className="text-slate-500 mt-1 mb-6">
                    Create your first tender document to get started.
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setView("form");
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Create New Tender
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTenders.map((tender) => (
                    <div
                      key={tender.id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 group relative"
                    >
                      {/* Action Buttons (Top Right) */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editTender(tender);
                          }}
                          className="p-1.5 bg-white text-slate-400 hover:text-blue-600 border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all"
                          title="Edit Tender"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTender(tender.id);
                          }}
                          className="p-1.5 bg-white text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all"
                          title="Delete Tender"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                          #{tender.id}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {tender.tenderName}
                      </h3>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-slate-500">
                          <Building className="w-4 h-4 mr-2" />
                          <span className="truncate">
                            {tender.departmentName}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(tender.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => viewTenderDetails(tender)}
                        className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Delete Tender Confirmation Modal */}
              {tenderToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Delete Tender?
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Are you sure you want to delete this tender? This action cannot be undone and all saved versions will be lost.
                      </p>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => setTenderToDelete(null)}
                          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDeleteTender}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }

        {
          view === "tender-details" && activeTender && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <button
                onClick={() => setView("my-tenders")}
                className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
              </button>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {activeTender.tenderName}
                      </h1>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Hash className="w-4 h-4" /> {activeTender.tenderNo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Created:{" "}
                          {new Date(activeTender.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateDocument}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Generate Document
                    </button>
                  </div>

                  {/* --- DETAILED INFO GRID --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Department Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Department Details
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                        <div>
                          <span className="text-xs text-slate-500 block">Department Name</span>
                          <span className="text-sm font-medium text-slate-800">{activeTender.departmentName}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Email</span>
                          <span className="text-sm font-medium text-slate-800">{activeTender.departmentEmail}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Inviting Authority</span>
                          <span className="text-sm font-medium text-slate-800">{activeTender.tenderInvitingAuthority}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financials */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Financials
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">Estimated Cost</span>
                            <span className="text-sm font-medium text-slate-800">₹{activeTender.estimatedCost}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Bid Validity</span>
                            <span className="text-sm font-medium text-slate-800">{activeTender.bidValidity} Days</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">EMD</span>
                            <span className="text-sm font-medium text-slate-800">{activeTender.emdRequired}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">PBG</span>
                            <span className="text-sm font-medium text-slate-800">{activeTender.pbgRequired}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Pledge Officer</span>
                          <span className="text-sm font-medium text-slate-800">{activeTender.emdPledgeOfficer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Important Dates
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">Bid Start</span>
                            <span className="text-sm font-medium text-slate-800">{formatDateDisplay(activeTender.bidStartDate)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Bid End</span>
                            <span className="text-sm font-medium text-slate-800">{formatDateDisplay(activeTender.bidEndDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Classification & Quantity */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Other Details
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">Category</span>
                            <span className="text-sm font-medium text-slate-800 capitalize">{activeTender.tenderCategory}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Type</span>
                            <span className="text-sm font-medium text-slate-800 uppercase">{activeTender.tenderType}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Item Quantity</span>
                          <span className="text-sm font-medium text-slate-800">{activeTender.itemQuantity}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Selected Terms */}
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Selected Terms & Conditions
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      {activeTender.selectedTermIds && activeTender.selectedTermIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {terms
                            .filter(t => activeTender.selectedTermIds.includes(t.id))
                            .map(term => (
                              <span key={term.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {term.title}
                              </span>
                            ))
                          }
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No terms selected.</p>
                      )}
                    </div>
                  </div>

                </div>

                <div className="p-6 md:p-8 bg-slate-50/50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Saved Versions
                  </h3>

                  {savedDocsLoading ? (
                    <div className="text-center py-8 text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading saved versions...
                    </div>
                  ) : savedDocs.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                      <p className="text-slate-500">No saved versions found.</p>
                      <p className="text-sm text-slate-400 mt-1">Generate a document and save it to see it here.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {savedDocs.map((doc) => (
                        <div key={doc.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-800 truncate pr-2" title={doc.name}>
                              {doc.name}
                            </h4>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap">
                              v{doc.version}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-4">
                            {new Date(doc.createdAt).toLocaleString()}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(`/tender-preview/${activeTender.id}?savedId=${doc.id}`, "_blank")}
                              className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button
                              onClick={() => deleteSavedDoc(doc.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Delete Version"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* Categories View */}
        {
          view === "categories" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  T&C Categories
                </h1>
                <button
                  onClick={() => {
                    setCategoryForm({ id: null, name: "", description: "" });
                    setIsEditing(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              {isEditing && (
                <div ref={formRef} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
                  <h3 className="text-lg font-semibold mb-4">
                    {categoryForm.id ? "Edit Category" : "New Category"}
                  </h3>
                  <form onSubmit={saveCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Name
                      </label>
                      <input
                        name="name"
                        value={categoryForm.name}
                        onChange={handleCategoryChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={categoryForm.description}
                        onChange={handleCategoryChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                      >
                        {categoryForm.id ? "Update Category" : "Save Category"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-slate-800">
                        {cat.name}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => editItem(cat, "cat")}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {cat.description || "No description provided."}
                    </p>
                    <div className="flex items-center text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full w-fit">
                      <Hash className="w-3 h-3 mr-1" />
                      {terms.filter((t) => t.categoryId === cat.id).length} Terms
                    </div>

                    {deleteConfirmId === cat.id && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 animate-in fade-in">
                        <p className="text-sm text-red-700 mb-2">
                          Delete this category?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmDeleteCategory(cat.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1 bg-white text-slate-600 text-xs rounded border hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* GeM Master View */}
        {
          view === "gem-master" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  T&C Creation Master
                </h1>
                <button
                  onClick={() => {
                    setTermForm({
                      id: null,
                      categoryId: "",
                      title: "",
                      description: "",
                    });
                    setIsEditing(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Term
                </button>
              </div>

              {isEditing && (
                <div ref={formRef} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
                  <h3 className="text-lg font-semibold mb-4">
                    {termForm.id ? "Edit Term" : "New Term"}
                  </h3>
                  <form onSubmit={saveTerm} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Category
                        </label>
                        <select
                          name="categoryId"
                          value={termForm.categoryId}
                          onChange={handleTermChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Title
                        </label>
                        <input
                          name="title"
                          value={termForm.title}
                          onChange={handleTermChange}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={termForm.description}
                        onChange={handleTermChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                      >
                        {termForm.id ? "Update Term" : "Save Term"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-6">
                {categories.map((cat) => {
                  const catTerms = terms.filter((t) => t.categoryId === cat.id);
                  if (catTerms.length === 0) return null;

                  return (
                    <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                          {catTerms.length} Terms
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {catTerms.map((term) => (
                          <div
                            key={term.id}
                            ref={el => itemRefs.current[term.id] = el}
                            className="p-4 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-medium text-slate-900 mb-1">
                                  {term.title}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {term.description}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => editItem(term, "term")}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => requestDelete(term.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {deleteConfirmId === term.id && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 animate-in fade-in flex items-center justify-between">
                                <span className="text-sm text-red-700">
                                  Delete this term?
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => confirmDeleteTerm(term.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={cancelDelete}
                                    className="px-3 py-1 bg-white text-slate-600 text-xs rounded border hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tender-preview/:id" element={<TenderPreview />} />
    </Routes>
  );
}

export default App;
