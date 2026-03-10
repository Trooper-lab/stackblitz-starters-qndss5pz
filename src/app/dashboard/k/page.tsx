"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getClientProjects } from "@/lib/services/projectService";
import { ProjectData } from "@/types/database";
import ClientProjectDetail from "@/components/dashboard/ClientProjectDetail";
import { LayoutDashboard, FolderKanban, FileClock, ChevronRight, Loader2, Sparkles } from "lucide-react";

export default function CustomerDashboard() {
    const { user, userData, signOut } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProjects = async () => {
        if (!user) return;
        try {
            const data = await getClientProjects(user.uid);
            setProjects(data);
            // Update selected project if it exists
            if (selectedProject) {
                const updated = data.find(p => p.id === selectedProject.id);
                if (updated) setSelectedProject(updated);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-500/20 text-green-400 border-green-500/20";
            case "development": return "bg-purple-500/20 text-purple-400 border-purple-500/20";
            case "design_review": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
            default: return "bg-white/5 text-white/50 border-white/10";
        }
    };

    return (
        <ProtectedRoute allowedRoles={["client", "admin"]}>
            <div className="min-h-screen bg-[#020617] text-white font-inter selection:bg-blue-500/30">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
                            <span className="font-montserrat font-extrabold tracking-tight text-xl">BOILER <span className="text-blue-500">CLIENT</span></span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-medium opacity-70">Live Sync Actief</span>
                            </div>
                            <button
                                onClick={signOut}
                                className="text-sm opacity-50 hover:opacity-100 transition-opacity"
                            >
                                Uitloggen
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-8 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm opacity-40">Gegevens ophalen...</p>
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
                                    <h1 className="text-4xl font-montserrat font-extrabold tracking-tight">
                                        Welkom, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.displayName?.split(' ')[0] || "Ondernemer"}</span>
                                    </h1>
                                    <p className="text-lg opacity-50 max-w-2xl">
                                        Hier is een overzicht van je actieve projecten en de laatste updates aan je website.
                                    </p>
                                </div>

                                {userData && (!userData.companyDetails || !userData.projectContext) && (
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                                        <div className="p-2 bg-orange-500/20 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-orange-400">Profiel Incompleet</p>
                                            <p className="text-xs opacity-60 text-orange-300">Vul je bedrijfsgegevens aan voor een snellere start.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-orange-500 rounded-lg text-xs font-bold hover:bg-orange-600 transition-all">
                                            Aanvullen
                                        </button>
                                    </div>
                                )}
                            </header>

                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Column: Projects */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <FolderKanban className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-xl font-bold font-montserrat">Actieve Projecten</h2>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {projects.length === 0 ? (
                                            <div className="p-12 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <LayoutDashboard className="w-8 h-8 opacity-20" />
                                                </div>
                                                <h3 className="text-lg font-bold mb-1 opacity-60">Nog geen projecten</h3>
                                                <p className="text-sm opacity-40">Zodra we starten verschijnen hier je projecten.</p>
                                            </div>
                                        ) : (
                                            projects.map((project) => (
                                                <button
                                                    key={project.id}
                                                    onClick={() => setSelectedProject(project)}
                                                    className="group text-left bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10 hover:border-white/20 hover:translate-y-[-2px]"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{project.title}</h3>
                                                            <div className="flex items-center gap-4 text-xs opacity-50">
                                                                <span className="flex items-center gap-1">
                                                                    <FileClock className="w-3 h-3" />
                                                                    Laatste update: {new Date(project.updatedAt?.toDate()).toLocaleDateString('nl-NL')}
                                                                </span>
                                                                <span>{project.designs.length} Ontwerpen</span>
                                                                <span>{project.assets.length} Assets</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(project.status)}`}>
                                                                {project.status.replace('_', ' ')}
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Sidebar: Quick Stats / Next Steps */}
                                <div className="space-y-8">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Sparkles className="w-32 h-32" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-4 relative z-10">Jouw Succes</h3>
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                                                <span className="text-sm opacity-60">Actieve Projecten</span>
                                                <span className="text-3xl font-extrabold">{projects.length}</span>
                                            </div>
                                            <div className="flex items-end justify-between border-b border-white/10 pb-4">
                                                <span className="text-sm opacity-60">Goedgekeurde Designs</span>
                                                <span className="text-3xl font-extrabold">
                                                    {projects.reduce((acc, p) => acc + p.designs.filter(d => d.status === "approved").length, 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                        <h3 className="text-lg font-bold">Documentatie</h3>
                                        <div className="space-y-3">
                                            {['Onze Werkwijze', 'Hosting & Domeinen', 'SEO Optimalisatie'].map((item) => (
                                                <button key={item} className="w-full text-left px-4 py-3 bg-white/5 rounded-xl text-sm border border-transparent hover:border-white/10 transition-all flex items-center justify-between group">
                                                    {item}
                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
