"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getClientProjects } from "@/lib/services/projectService";
import { ProjectData, CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import ClientProjectDetail from "@/components/dashboard/ClientProjectDetail";
import {
    LayoutDashboard,
    FolderKanban,
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
    ShieldCheck
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

    // Onboarding form state
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
        name: "",
        address: "",
        kvk: "",
        vat: ""
    });

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

            if (projects.length === 0) {
                setOnboardingStep(2);
            }
        }
    }, [userData, projects.length]);

    const loadProjects = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getClientProjects(user.uid);
            setProjects(data);
            if (selectedProject) {
                const updated = data.find(p => p.id === selectedProject.id);
                if (updated) setSelectedProject(updated);
            }
            if (data.length > 0) {
                setOnboardingStep(3);
            }
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setLoading(false);
        }
    }, [user, selectedProject]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                companyDetails,
                domainInfo,
                projectContext,
                onboardingCompleted: true,
                updatedAt: serverTimestamp()
            });
            setOnboardingStep(2);
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
                                    Project Intake & Gegevens
                                </div>
                                <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">Kickstart je project<span className="text-accent">.</span></h1>
                                <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">Vul de onderstaande gegevens zo volledig mogelijk in. Dit vormt de basis voor je nieuwe high-performance website.</p>
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
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Wettelijke informatie</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bedrijfsnaam</label>
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
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vestigingsadres</label>
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
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">KVK Nummer</label>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.kvk}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, kvk: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="8 cijfers"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">BTW Nummer</label>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.vat}
                                                onChange={(e) => setCompanyDetails({ ...companyDetails, vat: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="NL001234567B01"
                                            />
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
                                                type="text"
                                                value={domainInfo.currentDomain}
                                                onChange={(e) => setDomainInfo({ ...domainInfo, currentDomain: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="www.jouwbedrijf.nl"
                                            />
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

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-accent text-white rounded-[2rem] p-6 text-xl font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50 hover:translate-y-[-4px] active:translate-y-0"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <>Intake Afronden <ArrowRight size={24} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Step 2 and 3 remain similar but with updated styling to match
    if (onboardingStep === 2 && !loading) {
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
                                <Clock size={40} className="text-accent animate-pulse" />
                                <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20" />
                            </div>

                            <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tight italic">Intake ontvangen<span className="text-accent">!</span></h1>
                            <p className="text-slate-300 text-xl font-medium leading-relaxed mb-12">
                                Bedankt {user?.displayName?.split(' ')[0]}! Je hebt de intake succesvol afgerond. Onze strategen bekijken je gegevens en nemen binnen <span className="text-white font-black italic underline decoration-accent underline-offset-4">1 werkdag</span> contact met je op voor de kickoff.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {[
                                    { title: "Review", desc: "Strategische analyse van je intake." },
                                    { title: "Kickoff", desc: "Telefonische afstemming & start." },
                                    { title: "Resultaat", desc: "De eerste designs live in je dashboard." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-accent text-sm font-black flex items-center justify-center text-white">{i + 1}</div>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-accent">{item.title}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Default Dashboard (Step 3) - Same as before but consistent navy
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
                        <div className="flex items-center gap-6">
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
                            onUpdate={loadProjects}
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
