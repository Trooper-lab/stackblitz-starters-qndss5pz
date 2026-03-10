"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getClientProjects } from "@/lib/services/projectService";
import { ProjectData, UserData } from "@/types/database";
import ClientProjectDetail from "@/components/dashboard/ClientProjectDetail";
import { 
    LayoutDashboard, 
    FolderKanban, 
    ChevronRight, 
    Loader2, 
    Sparkles, 
    Building2, 
    Globe, 
    Mail, 
    Phone, 
    User,
    ArrowRight,
    Clock,
    CheckCircle2,
    LogOut
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CustomerDashboard() {
    const { user, userData, signOut } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    
    // Onboarding form state
    const [companyDetails, setCompanyDetails] = useState({
        companyName: "",
        website: "",
        phone: "",
        address: "",
        description: ""
    });

    useEffect(() => {
        if (userData?.companyDetails) {
            setCompanyDetails(userData.companyDetails as any);
            if (projects.length === 0) {
                setOnboardingStep(2);
            }
        }
    }, [userData, projects.length]);

    const loadProjects = async () => {
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
    };

    useEffect(() => {
        loadProjects();
    }, [user]);

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                companyDetails: companyDetails,
                onboardingCompleted: true
            });
            setOnboardingStep(2);
        } catch (error) {
            console.error("Error saving onboarding details:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Render Onboarding Step 1: Company Details
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

                    <main className="flex-grow flex items-center justify-center p-6 py-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl w-full"
                        >
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-4">
                                    Stap 1 van 2
                                </div>
                                <h1 className="text-4xl md:text-5xl font-display font-black mb-4 uppercase tracking-tight">Laten we kennismaken<span className="text-accent">.</span></h1>
                                <p className="text-slate-400 text-lg font-medium">Vul je bedrijfsgegevens in zodat we direct een vliegende start kunnen maken met je project.</p>
                            </div>

                            <form onSubmit={handleOnboardingSubmit} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl space-y-6 shadow-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bedrijfsnaam</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <Building2 size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.companyName}
                                                onChange={(e) => setCompanyDetails({...companyDetails, companyName: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="Bijv. Janssen BV"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Huidige Website (optioneel)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <Globe size={18} />
                                            </div>
                                            <input
                                                type="url"
                                                value={companyDetails.website}
                                                onChange={(e) => setCompanyDetails({...companyDetails, website: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefoonnummer</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                value={companyDetails.phone}
                                                onChange={(e) => setCompanyDetails({...companyDetails, phone: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="06 12345678"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adresgegevens</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-accent transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={companyDetails.address}
                                                onChange={(e) => setCompanyDetails({...companyDetails, address: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                                placeholder="Straat, Postcode, Plaats"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Wat doe je precies? (Kort)</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={companyDetails.description}
                                        onChange={(e) => setCompanyDetails({...companyDetails, description: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                        placeholder="Vertel ons kort wat je bedrijf uniek maakt..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-accent text-white rounded-2xl p-5 text-lg font-black uppercase tracking-wider shadow-xl shadow-accent/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>Opslaan & Volgende Stap <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Render Onboarding Step 2: Waiting
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
                            className="max-w-2xl w-full text-center"
                        >
                            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <Clock size={40} className="text-accent animate-pulse" />
                                <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20" />
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 uppercase tracking-tight">Ontvangst bevestigd<span className="text-accent">!</span></h1>
                            <p className="text-slate-300 text-xl font-medium leading-relaxed mb-10">
                                Bedankt {user?.displayName?.split(' ')[0]}! We hebben je gegevens ontvangen. Onze experts nemen binnen <span className="text-white font-black italic">1 werkdag</span> contact met je op om je nieuwe website-project officieel op te starten.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {[
                                    { title: "Review", desc: "Wij bekijken je bedrijfsgegevens." },
                                    { title: "Contact", desc: "We bellen voor de kickoff." },
                                    { title: "Start", desc: "Je dashboard wordt geactiveerd." }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-accent text-[10px] font-black flex items-center justify-center">{i + 1}</div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{item.title}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </main>
                </div>
            </ProtectedRoute>
        );
    }

    // Default: Main Dashboard (Step 3)
    return (
        <ProtectedRoute allowedRoles={["client", "admin"]}>
            <div className="min-h-screen bg-navy text-white font-inter selection:bg-accent/30">
                {/* Navbar */}
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
                            <button
                                onClick={signOut}
                                className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
                            >
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
                            {/* Header */}
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

                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Column: Projects */}
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
                                                                    Update: {new Date(project.updatedAt?.toDate()).toLocaleDateString('nl-NL')}
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

                                {/* Sidebar */}
                                <div className="space-y-8">
                                    <div className="bg-accent rounded-[2.5rem] p-8 shadow-2xl shadow-accent/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-32 h-32 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black font-display uppercase tracking-tight mb-6 relative z-10 text-white">Project Status</h3>
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

                                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                                        <h3 className="text-lg font-black font-display uppercase tracking-tight">Support & Docs</h3>
                                        <div className="space-y-3">
                                            {['Onze Werkwijze', 'Hosting & Domeinen', 'Direct Contact'].map((item) => (
                                                <button key={item} className="w-full text-left px-5 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-accent/30 hover:bg-white/10 transition-all flex items-center justify-between group">
                                                    {item}
                                                    <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
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
