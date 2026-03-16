"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { subscribeClientProjects } from "@/lib/services/projectService";
import { ProjectData, CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import ClientProjectDetail from "@/components/dashboard/ClientProjectDetail";
import ClientNotificationBanner from "@/components/dashboard/ClientNotificationBanner";
import { ClientNotification } from "@/lib/services/notificationService";
import { pricingTiers, pricingAddons } from "@/lib/config/pricing";
import {
    LayoutDashboard,
    FolderKanban,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Sparkles,
    Building2,
    Globe,
    ArrowRight,
    Clock,
    CheckCircle2,
    LogOut,
    Hash,
    Target,
    Users,
    FileText,
    ShieldCheck,
    Check,
    Receipt
} from "lucide-react";
import { doc, updateDoc, serverTimestamp, Timestamp, FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CustomerDashboard() {
    const { user, userData, signOut } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
        name: "",
        address: "",
        email: "",
        phone: "",
        kvk: "",
        vat: ""
    });

    // Package Selection State
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [packageWizardStep, setPackageWizardStep] = useState(1);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    // Dutch landline (010 xxx xxxx) or mobile (06 xxxx xxxx), accepts spaces, dashes, +31
    const validatePhone = (v: string) => {
        const stripped = v.replace(/[\s\-().]/g, "");
        return /^(\+31|0031|0)[1-9][0-9]{7,8}$/.test(stripped);
    };
    // Must start with https:// and have a TLD (e.g. .nl, .com)
    const validateUrl = (v: string) => {
        if (!v.trim()) return true; // field is optional
        try {
            const url = new URL(v.trim());
            return url.protocol === "https:" && /\.[a-z]{2,}$/.test(url.hostname);
        } catch {
            return false;
        }
    };

    const handleFieldBlur = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        if (field === "email") {
            errors.email = validateEmail(value) ? "" : "Vul een geldig e-mailadres in.";
        } else if (field === "phone") {
            errors.phone = validatePhone(value) ? "" : "Vul een geldig Nederlands telefoonnummer in (bijv. 0612345678).";
        } else if (field === "website") {
            errors.website = validateUrl(value) ? "" : "Vul een geldige URL in met https:// en een domeinnaam (bijv. https://www.jouwbedrijf.nl).";
        }
        setFieldErrors(errors);
    };

    const isFormValid = () => {
        return (
            companyDetails.name.trim() !== "" &&
            companyDetails.address.trim() !== "" &&
            validateEmail(companyDetails.email) &&
            validatePhone(companyDetails.phone) &&
            projectContext.goals.trim() !== "" &&
            projectContext.targetAudience.trim() !== ""
        );
    };

    const [domainInfo, setDomainInfo] = useState<DomainInfo>({
        currentDomain: "",
        provider: "",
        loginDetails: "Geen inloggegevens verstrekt", // Default message
        sslStatus: "unknown"
    });

    const [projectContext, setProjectContext] = useState<ProjectContext>({
        goals: "",
        targetAudience: "",
        currentWebsiteContent: "",
        competitors: ""
    });

    useEffect(() => {
        if (userData?.companyDetails) {
            setCompanyDetails(userData.companyDetails);
            if (userData.domainInfo) setDomainInfo(userData.domainInfo);
            if (userData.projectContext) setProjectContext(userData.projectContext);

            // If user has company details but hasn't picked a package yet in their profile
            if (projects.length === 0 && !userData?.selectedPackage) {
                setOnboardingStep(2);
            } else if (projects.length === 0 && userData?.selectedPackage) {
                setOnboardingStep(3); // Waiting for admin to start project
            }
        }
        
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0]);
        }
    }, [userData, projects, selectedProject, setSelectedProject]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeClientProjects(
            user.uid,
            (data) => {
                setProjects(data);
                
                if (data.length > 0) {
                    setOnboardingStep(4); // Dashboard mode
                }
                setLoading(false);
            },
            user.email || undefined
        );

        return () => unsubscribe();
    }, [user]); // Re-subscribe if user changes

    // Keep selected project in sync with projects data
    useEffect(() => {
        if (selectedProject) {
            const updated = projects.find(p => p.id === selectedProject.id);
            if (updated && updated !== selectedProject) {
                setSelectedProject(updated);
            }
        }
    }, [projects, selectedProject, setSelectedProject]);

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !isFormValid()) return;
        setOnboardingStep(2);
    };

    const handlePackageSubmit = async () => {
        if (!user || !selectedPackageId) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                companyDetails,
                domainInfo,
                projectContext,
                selectedPackage: {
                    packageId: selectedPackageId,
                    addons: selectedAddons,
                    billingCycle,
                    timestamp: serverTimestamp()
                },
                onboardingCompleted: true,
                updatedAt: serverTimestamp()
            });
            setOnboardingStep(3);
        } catch (error) {
            console.error("Error saving onboarding details:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (date: Timestamp | FieldValue | undefined) => {
        if (!date) return "Recent";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('nl-NL');
        }
        
        const d = date as unknown as { seconds?: number; nanoseconds?: number };
        if (d && typeof d.seconds === 'number') {
            return new Timestamp(d.seconds, d.nanoseconds || 0).toDate().toLocaleDateString('nl-NL');
        }
        return "Recent";
    };

    const getPackage = () => pricingTiers.find(t => t.id === selectedPackageId);
    const getAddons = () => pricingAddons.filter(a => selectedAddons.includes(a.id));

    const calculateTotal = () => {
        const pkg = getPackage();
        if (!pkg) return 0;
        const pkgPrice = billingCycle === "monthly" ? pkg.priceMonthlyValue : pkg.priceYearlyValue;
        const addonsPrice = getAddons().reduce((sum, a) => sum + (billingCycle === "monthly" ? a.priceMonthlyValue : a.priceYearlyValue), 0);
        return pkgPrice + addonsPrice;
    };

    const calculateMonthlyEquivalent = () => {
        const pkg = getPackage();
        if (!pkg) return 0;
        const pkgPrice = pkg.priceMonthlyValue;
        const addonsPrice = getAddons().reduce((sum, a) => sum + a.priceMonthlyValue, 0);
        return pkgPrice + addonsPrice;
    };

    const commitmentFee = calculateMonthlyEquivalent() * 0.5;

    // Render Onboarding Step 1: Extended Intake
    if (onboardingStep === 1 && !loading) {
        return (
            <ProtectedRoute allowedRoles={["client", "admin"]}>
                <div className="min-h-screen bg-navy text-white flex flex-col">
                    <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <Link href="/">
                                <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                    AIleadsite<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>
                        <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <LogOut size={16} /> Uitloggen
                        </button>
                    </nav>

                    <main className="flex-grow p-6 py-12 max-w-4xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                                    Stap 1: Claim je 1 Gratis Design
                                </div>
                                <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">De start van iets moois<span className="text-accent">.</span></h1>
                                <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                                    Vul je gegevens in zodat we direct kunnen starten met jouw <span className="text-white font-black italic underline decoration-accent underline-offset-4">gratis</span> ontwerp. Geen creditcard nodig.
                                </p>
                            </div>

                            <form onSubmit={handleOnboardingSubmit} className="space-y-10 pb-20">
                                {/* Section 1: Bedrijfsgegevens */}
                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-black uppercase tracking-tight">Bedrijfsgegevens</h2>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contactinformatie</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bedrijfsnaam *</label>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.name}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="Bijv. AI Lead Site BV"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mailadres *</label>
                                            <input
                                                type="email"
                                                required
                                                value={companyDetails.email}
                                                onChange={(e) => {
                                                    setCompanyDetails({ ...companyDetails, email: e.target.value });
                                                    if (fieldErrors.email) handleFieldBlur("email", e.target.value);
                                                }}
                                                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                                                className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                                    fieldErrors.email ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                                }`}
                                                placeholder="info@jouwbedrijf.nl"
                                            />
                                            {fieldErrors.email && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.email}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vestigingsadres *</label>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.address}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="Straat 123, 1234 AB Plaats"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefoonnummer *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={companyDetails.phone}
                                                onChange={(e) => {
                                                    setCompanyDetails({ ...companyDetails, phone: e.target.value });
                                                    if (fieldErrors.phone) handleFieldBlur("phone", e.target.value);
                                                }}
                                                onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                                                className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                                    fieldErrors.phone ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                                }`}
                                                placeholder="06 12 34 56 78"
                                            />
                                            {fieldErrors.phone && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Domein & Hosting */}
                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-black uppercase tracking-tight">Domein & Hosting</h2>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Technische configuratie</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Huidig Domein</label>
                                            <input
                                                type="url"
                                                value={domainInfo.currentDomain}
                                                onChange={(e) => {
                                                    setDomainInfo({ ...domainInfo, currentDomain: e.target.value });
                                                    if (fieldErrors.website) handleFieldBlur("website", e.target.value);
                                                }}
                                                onBlur={(e) => {
                                                    // Auto-prepend https:// if user typed without it
                                                    let val = e.target.value.trim();
                                                    if (val && !val.startsWith("http")) {
                                                        val = "https://" + val;
                                                        setDomainInfo({ ...domainInfo, currentDomain: val });
                                                    }
                                                    handleFieldBlur("website", val);
                                                }}
                                                className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                                    fieldErrors.website ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                                }`}
                                                placeholder="https://www.jouwbedrijf.nl"
                                            />
                                            {fieldErrors.website && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.website}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Huidige Provider</label>
                                            <input
                                                type="text"
                                                value={domainInfo.provider}
                                                onChange={(e) => setDomainInfo({ ...domainInfo, provider: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="Bijv. Hostnet, TransIP, etc."
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-8 p-4 bg-navy-light/40 border border-white/5 rounded-2xl flex items-center gap-4 text-slate-400 text-sm italic">
                                        <ShieldCheck className="text-accent shrink-0" size={20} />
                                        Inloggegevens vragen wij pas op wanneer dit strikt noodzakelijk is via een beveiligde verbinding.
                                    </div>
                                </div>

                                {/* Section 3: Project Context */}
                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-black uppercase tracking-tight">Project Context & Doelen</h2>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Strategische basis</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <Sparkles size={12} className="text-accent" /> Doelen van de website
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={projectContext.goals}
                                                onChange={(e) => setProjectContext({ ...projectContext, goals: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                                placeholder="Wat wil je bereiken? Bijv. Meer offerte aanvragen, online verkoop, etc."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <Users size={12} className="text-accent" /> Doelgroep
                                            </label>
                                            <textarea
                                                required
                                                rows={2}
                                                value={projectContext.targetAudience}
                                                onChange={(e) => setProjectContext({ ...projectContext, targetAudience: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                                placeholder="Wie is je ideale klant?"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <FileText size={12} className="text-accent" /> Huidige Content / Inhoud
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={projectContext.currentWebsiteContent}
                                                onChange={(e) => setProjectContext({ ...projectContext, currentWebsiteContent: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                                placeholder="Heb je al teksten of foto's? Of moeten wij dit verzorgen?"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <Hash size={12} className="text-accent" /> Concurrenten
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={projectContext.competitors}
                                                onChange={(e) => setProjectContext({ ...projectContext, competitors: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                                placeholder="Welke bedrijven in jouw branche bewonder je?"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Legal (optional) */}
                                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-display font-black uppercase tracking-tight text-slate-300">Juridische Gegevens <span className="text-slate-600 text-sm font-bold normal-case tracking-normal">(optioneel)</span></h2>
                                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Nodig voor facturatie</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-8 ml-1">Je kunt dit later ook invullen. We hebben dit alleen nodig op het moment dat we een factuur opmaken.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">KVK Nummer</label>
                                            <input
                                                type="text"
                                                value={companyDetails.kvk || ""}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, kvk: e.target.value })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="8 cijfers (bijv. 12345678)"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">BTW Nummer</label>
                                            <input
                                                type="text"
                                                value={companyDetails.vat || ""}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, vat: e.target.value })}
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="NL001234567B01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving || !isFormValid()}
                                    className="w-full bg-accent text-white rounded-[2rem] p-6 text-xl font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:translate-y-[-4px] active:translate-y-0"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <>Pakket Kiezen <ArrowRight size={24} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Step 2: Package Selection
    if (onboardingStep === 2 && !loading) {
        return (
            <ProtectedRoute allowedRoles={["client", "admin"]}>
                <div className="min-h-screen bg-navy text-white flex flex-col">
                    <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <Link href="/">
                                <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer" onClick={() => setOnboardingStep(1)}>
                                    AIleadsite<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-2">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${s < 2 ? "bg-accent text-white" : s === 2 ? "bg-white text-navy" : "bg-white/10 text-white/40"}`}>
                                            {s < 2 ? <Check size={12} /> : s}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${s === 2 ? "text-white" : "text-white/40"}`}>
                                            {s === 1 ? "Intake" : s === 2 ? "Pakket" : "Klaar"}
                                        </span>
                                        {s < 3 && <ChevronRight size={12} className="text-white/20" />}
                                    </div>
                                ))}
                            </div>
                            <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <LogOut size={16} /> Uitloggen
                            </button>
                        </div>
                    </nav>

                    <main className="flex-grow p-6 py-12 max-w-6xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            {packageWizardStep === 1 && (
                                <div className="space-y-12">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                                            Stap 2: Kies je basis
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">Welk pakket past bij jou<span className="text-accent">?</span></h2>
                                        
                                        <div className="bg-white/5 p-1 rounded-full inline-flex relative border border-white/10 mt-4">
                                            <button
                                                onClick={() => setBillingCycle("monthly")}
                                                className={`relative z-10 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === "monthly" ? "text-navy" : "text-slate-400 hover:text-white"}`}
                                            >
                                                Maandelijks
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle("yearly")}
                                                className={`relative z-10 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === "yearly" ? "text-navy" : "text-slate-400 hover:text-white"}`}
                                            >
                                                Jaarlijks <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full ml-1 font-bold italic">-2 MDN</span>
                                            </button>
                                            <div
                                                className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-out"
                                                style={{
                                                    left: billingCycle === "monthly" ? "4px" : "50%",
                                                    width: "calc(50% - 4px)"
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-8">
                                        {pricingTiers.map(tier => (
                                            <div
                                                key={tier.id}
                                                onClick={() => setSelectedPackageId(tier.id)}
                                                className={`group relative bg-white/5 border-2 rounded-[2.5rem] p-8 md:p-10 cursor-pointer transition-all duration-500 hover:bg-white/[0.08] ${selectedPackageId === tier.id ? "border-accent ring-4 ring-accent/10 bg-white/[0.08]" : "border-white/10 hover:border-white/30"}`}
                                            >
                                                {tier.featured && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] uppercase tracking-widest font-black py-2 px-6 rounded-full shadow-2xl italic">
                                                        POPULAIR
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="font-display font-black text-2xl uppercase italic tracking-tight">{tier.name}</h4>
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedPackageId === tier.id ? "bg-accent border-accent text-white" : "border-white/20"}`}>
                                                        {selectedPackageId === tier.id && <Check size={16} />}
                                                    </div>
                                                </div>

                                                <div className="flex items-end gap-2 mb-10">
                                                    <span className="text-5xl font-display font-black tracking-tighter">
                                                        €{billingCycle === "monthly" ? tier.priceMonthlyValue : Math.round(tier.priceYearlyValue / 12)}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                        / mnd
                                                    </span>
                                                </div>

                                                <ul className="space-y-4 mb-10">
                                                    {tier.features.slice(0, 5).map((feat, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                                                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                                                                <Check size={12} />
                                                            </div>
                                                            <span>{feat.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 mt-12 mb-20 max-w-4xl mx-auto">
                                        <button
                                            onClick={() => setOnboardingStep(1)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft size={16} /> Terug naar intake
                                        </button>
                                        <button
                                            onClick={() => setPackageWizardStep(2)}
                                            disabled={!selectedPackageId}
                                            className="bg-accent text-white px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 italic"
                                        >
                                            Stap 2: Extra Opties <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {packageWizardStep === 2 && (
                                <div className="space-y-12 max-w-4xl mx-auto">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                                            Stap 2: Maak het compleet
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">Extra kracht nodig<span className="text-accent">?</span></h2>
                                        <p className="text-slate-400 text-lg font-medium">Voeg optionele modules toe aan je project. Je kunt deze later ook nog aanpassen.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {pricingAddons.map(addon => {
                                            const isSelected = selectedAddons.includes(addon.id);
                                            const price = billingCycle === "monthly" ? addon.priceMonthlyValue : Math.round(addon.priceYearlyValue / 12);
                                            return (
                                                <div
                                                    key={addon.id}
                                                    onClick={() => setSelectedAddons(prev => isSelected ? prev.filter(id => id !== addon.id) : [...prev, addon.id])}
                                                    className={`group flex items-center justify-between p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${isSelected ? "border-accent bg-accent/5 shadow-2xl shadow-accent/5" : "border-white/5 bg-white/5 hover:border-white/20"}`}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${isSelected ? "bg-accent border-accent text-white" : "border-white/10 bg-white/5"}`}>
                                                            {isSelected && <Check size={16} />}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-display font-black text-xl uppercase italic tracking-tight group-hover:text-accent transition-colors">{addon.name}</h5>
                                                            <p className="text-sm font-medium text-slate-400">{addon.features[0]?.text}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-display font-black italic tracking-tighter text-white">+ €{price}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">/ mnd</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 mb-20">
                                        <button
                                            onClick={() => setPackageWizardStep(1)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft size={16} /> Pakket aanpassen
                                        </button>
                                        <button
                                            onClick={() => setPackageWizardStep(3)}
                                            className="bg-accent text-white px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-orange-600 transition-all flex items-center gap-3 italic"
                                        >
                                            Stap 3: Review <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {packageWizardStep === 3 && (
                                <div className="space-y-12 max-w-3xl mx-auto">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                                            Stap 3: Laatste Check
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">Klaar voor de start<span className="text-accent">!</span></h2>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        <div className="p-8 md:p-12 border-b border-white/10">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Jouw Configuratie</h4>
                                            
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <p className="font-display font-black text-2xl uppercase italic tracking-tight text-white">{getPackage()?.name}</p>
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1">Basis pakket ({billingCycle === "monthly" ? "Maandelijks" : "Jaarlijks"})</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-display font-black text-2xl italic tracking-tighter text-white">
                                                        €{billingCycle === "monthly" ? getPackage()?.priceMonthlyValue : getPackage()?.priceYearlyValue}
                                                    </p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        / {billingCycle === "yearly" ? "jr" : "mnd"}
                                                    </p>
                                                </div>
                                            </div>

                                            {getAddons().map(addon => (
                                                <div key={addon.id} className="flex justify-between items-center py-4 border-t border-white/5 border-dashed">
                                                    <div>
                                                        <p className="font-bold text-slate-300">{addon.name}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Extra module</p>
                                                    </div>
                                                    <p className="font-bold text-slate-300">
                                                        + €{billingCycle === "monthly" ? addon.priceMonthlyValue : addon.priceYearlyValue}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-8 md:p-12 bg-accent flex justify-between items-center text-white">
                                            <span className="font-display font-black text-2xl uppercase italic tracking-tight">Totaal Bedrag</span>
                                            <div className="text-right">
                                                <span className="text-4xl font-display font-black tracking-tighter italic">€{calculateTotal()}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 ml-2">/ {billingCycle === "yearly" ? "jaar" : "maand"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-accent/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            <Receipt size={120} />
                                        </div>
                                        <h4 className="text-accent font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                            <Sparkles size={14} /> Belangrijk over je gratis design
                                        </h4>
                                        <p className="text-sm font-medium text-slate-300 mb-6 leading-relaxed relative z-10">
                                            We maken nu eerst je <span className="text-white font-black italic">Gratis Concept</span>. Zodra je dit ontwerp goedkeurt, sturen we een factuur voor de commitment fee (€{commitmentFee.toFixed(2)}) en gaan we live.
                                        </p>
                                        <div className="flex justify-between items-center border-t border-white/10 pt-6 relative z-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Commitment Fee (na goedkeuring)</span>
                                            <span className="text-xl font-display font-black italic text-white">€{commitmentFee.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-20">
                                        <button
                                            onClick={() => setPackageWizardStep(2)}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft size={16} /> Terug naar opties
                                        </button>
                                        <button
                                            onClick={handlePackageSubmit}
                                            disabled={isSaving}
                                            className="bg-accent text-white px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest shadow-2xl shadow-accent/40 hover:bg-orange-600 transition-all flex items-center gap-4 italic group"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                            ) : (
                                                <>Claim je gratis design <Sparkles size={24} className="group-hover:rotate-12 transition-transform" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Step 3: Confirmation (Updated to reflect new flow)
    if (onboardingStep === 3 && !loading) {
        return (
            <ProtectedRoute allowedRoles={["client", "admin"]}>
                <div className="min-h-screen bg-navy text-white flex flex-col">
                    <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <Link href="/">
                                <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                    AIleadsite<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>
                        <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <LogOut size={16} /> Uitloggen
                        </button>
                    </nav>

                    <main className="flex-grow flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl w-full text-center"
                        >
                            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <Sparkles size={40} className="text-accent animate-pulse" />
                                <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20" />
                            </div>

                            <h1 className="text-4xl md:text-7xl font-display font-black mb-6 uppercase tracking-tighter italic">We gaan ontwerpen<span className="text-accent">!</span></h1>
                            <p className="text-slate-300 text-xl font-medium leading-relaxed mb-4">
                                Top keuze, <span className="text-white font-black italic">{user?.displayName?.split(' ')[0]}</span>! Je intake is binnen en je pakket ({getPackage()?.name}) staat gereserveerd.
                            </p>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12">
                                Onze designers gaan direct aan de slag met je <span className="text-accent font-black underline decoration-accent/30 underline-offset-8">Gratis Concept</span>. Binnen <span className="text-white font-bold italic">24 uur</span> staat het eerste ontwerp in je dashboard.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {[
                                    { title: "Design", desc: "Wij maken je gratis custom homepage." },
                                    { title: "Feedback", desc: "Jij geeft feedback op het ontwerp." },
                                    { title: "Live", desc: "Goedkeuring = commitment fee & live!" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:bg-white/10 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 size={100} />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-accent text-sm font-black flex items-center justify-center text-white italic">{i + 1}</div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-accent italic">{item.title}</span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed text-slate-400 relative z-10">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 p-6 bg-white/5 border border-white/10 rounded-[2rem] inline-flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design Pipeline Status: <span className="text-white">Bezig met opstarten</span></span>
                            </div>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Step 4: Dashboard
    return (
        <ProtectedRoute allowedRoles={["client", "admin"]}>
            <div className="min-h-screen bg-navy text-white font-inter selection:bg-accent/30">
                <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <Link href="/">
                                <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                    AIleadsite<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && (
                                <ClientNotificationBanner
                                    clientId={user.uid}
                                    onActionClick={(notif: ClientNotification) => {
                                        if (notif.relatedId) {
                                            const proj = projects.find(p => p.id === notif.relatedId);
                                            if (proj) setSelectedProject(proj);
                                        }
                                    }}
                                />
                            )}
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Project Live</span>
                            </div>
                            <button onClick={signOut} className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                                <LogOut size={14} /> Uitloggen
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-8 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest opacity-40">Gegevens ophalen...</p>
                        </div>
                    ) : selectedProject ? (
                        <ClientProjectDetail
                            project={selectedProject}
                            onBack={() => setSelectedProject(null)}
                        />
                    ) : (
                        <div className="space-y-12">
                            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight uppercase">
                                        Welkom terug, <span className="text-accent italic">{user?.displayName?.split(' ')[0] || "Ondernemer"}</span>
                                    </h1>
                                    <p className="text-lg text-slate-400 font-medium max-w-2xl">
                                        Je project is in volle gang. Hieronder vind je de laatste status en updates van je nieuwe website.
                                    </p>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <FolderKanban className="w-5 h-5 text-accent" />
                                        <h2 className="text-xl font-black uppercase tracking-tight font-display">Actieve Projecten</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {projects.length === 0 ? (
                                            <div className="p-16 text-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center">
                                                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                                                    <LayoutDashboard className="w-10 h-10 text-accent opacity-50" />
                                                </div>
                                                <h3 className="text-2xl font-display font-black mb-2 uppercase tracking-tight">Bijna tijd voor actie!</h3>
                                                <p className="text-slate-400 max-w-sm font-medium">We bereiden je projectomgeving voor. Je ontvangt bericht zodra we de eerste ontwerpen voor je klaar hebben.</p>
                                            </div>
                                        ) : (
                                            projects.map((project) => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => setSelectedProject(project)}
                                                    className="group text-left bg-white/5 border border-white/10 rounded-[2rem] p-8 transition-all hover:bg-white/10 hover:border-accent/30 hover:translate-y-[-4px] shadow-xl hover:shadow-accent/5"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-2xl font-display font-black group-hover:text-accent transition-colors uppercase tracking-tight">{project.title}</h3>
                                                                <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                                                                    {project.status.replace('_', ' ')}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400">
                                                                <span className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-accent" />
                                                                    Update: {formatDate(project.updatedAt)}
                                                                </span>
                                                                <span className="flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4 text-accent" />
                                                                    {project.designs.length} Ontwerpen
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                                                <ChevronRight className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-accent rounded-[2.5rem] p-8 shadow-2xl shadow-accent/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-32 h-32 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black font-display uppercase tracking-tight mb-6 relative z-10 text-white text-[11px] font-black uppercase tracking-widest">Project Status</h3>
                                        <div className="space-y-4 relative z-10 text-white">
                                            <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Actieve Projecten</span>
                                                <span className="text-3xl font-black">{projects.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Goedgekeurd</span>
                                                <span className="text-3xl font-black">
                                                    {projects.reduce((acc, p) => acc + p.designs.filter(d => d.status === "approved").length, 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
