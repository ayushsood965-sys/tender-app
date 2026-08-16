import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    User,
    Mail,
    Building2,
    Phone,
    Briefcase,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Sparkles,
} from "lucide-react";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        departmentName: "Department of Physics",
        phone: "",
        designation: "Assistant Professor",
        dob: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const departments = [
        "Store Purchase Office",
        "Department of Physics",
        "Department of Chemistry",
        "Department of Computer Science",
        "Centre for Distance and Online Education (CDOE)",
        "Chief Warden (Boys Hostels)",
        "Chief Warden (Girls Hostels)",
        "Department of Biosciences",
        "Department of Mathematics",
        "Department of Law",
        "Finance Office & Accounts Branch",
        "General Administration Branch",
        "University Health Centre",
        "Department of Physical Education & Sports",
    ];

    const designations = [
        "Store Purchase Officer",
        "Assistant Professor",
        "Associate Professor",
        "Professor & Chairperson",
        "Dean of Studies",
        "Chief Warden",
        "Warden",
        "Section Officer",
        "Superintendent",
        "Finance Officer",
        "Assistant Registrar",
        "Deputy Registrar",
        "System Administrator",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-indigo-50/30 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-purple-300/30 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-indigo-300/30 rounded-full blur-[130px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 my-8">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-purple-500/10 border border-purple-100 p-2.5 mb-3 ring-8 ring-purple-500/5">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/d/d8/Himachal_Pradesh_University_Shimla_Logo.svg"
                            alt="HPU Logo"
                            className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Create Your HPU Faculty / Officer Account
                    </h1>
                    <p className="text-xs font-bold text-purple-700 mt-1 flex items-center justify-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Tender Management & Documentation Portal
                    </p>
                </div>

                {/* White Glassmorphic Form Card */}
                <div className="bg-white/90 backdrop-blur-2xl border border-purple-100/80 rounded-3xl p-8 shadow-2xl shadow-purple-900/10 relative">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">User Registration</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Please provide your official university details to create your workspace</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Full Name <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="e.g. Dr. Rajesh Verma"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Email ID */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Email Address <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@hpuniv.ac.in"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Department Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Department / Office <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        name="departmentName"
                                        list="departments-list"
                                        required
                                        value={formData.departmentName}
                                        onChange={handleChange}
                                        placeholder="Select or enter Department"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                    <datalist id="departments-list">
                                        {departments.map((d, i) => (
                                            <option key={i} value={d} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Phone Number <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 9816012345"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Designation <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        name="designation"
                                        list="designations-list"
                                        required
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Select or enter Designation"
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                    <datalist id="designations-list">
                                        {designations.map((d, i) => (
                                            <option key={i} value={d} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Date of Birth <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="date"
                                        name="dob"
                                        required
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Password <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 6 characters"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Confirm Password <span className="text-purple-600">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 text-xs cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Register & Enter Workspace</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-purple-700 hover:text-purple-900 underline underline-offset-4 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
