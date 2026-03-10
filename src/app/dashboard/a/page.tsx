"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import ProjectDetail from "@/components/dashboard/ProjectDetail";
import ProjectPipelineCard from "@/components/dashboard/ProjectPipelineCard";
import NewProjectWizard from "@/components/dashboard/NewProjectWizard";
import ClientList from "@/components/dashboard/ClientList";
import ClientDetail from "@/components/dashboard/ClientDetail";
import NewClientModal from "@/components/dashboard/NewClientModal";
import { UserData, ProjectData } from "@/types/database";
import { getAllProjects } from "@/lib/services/projectService";
import { getClients } from "@/lib/services/clientService";
import {
    Plus, FolderOpen, Users, LogOut, LayoutDashboard,
    CheckCircle, Wrench, Layout, FileText, Loader2, RefreshCw
} from "lucide-react";

type View = "pipeline" | "clients";

const STEPS = [
    { key: "intake", label: "Intake", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
    { key: "design_review", label: "Design Review", icon: Layout, color: "text-purple-400", bg: "bg-purple-400/10" },
    { key: "development", label: "Development", icon: Wrench, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { key: "delivered", label: "Opgeleverd", icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
];

export default function AdminDashboard() {
    const { signOut } = useAuth();
    const [view, setView] = useState<View>("pipeline");
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [clients, setClients] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [selectedClient, setSelectedClient] = useState<UserData | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([getAllProjects(), getClients()]);
            setProjects(p);
            setClients(c);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const clientMap = Object.fromEntries(clients.map(c => [c.uid, c]));

    const filteredProjects = activeFilter
        ? projects.filter(p => p.status === activeFilter)
        : projects;

    const handleProjectCreated = (newProject: ProjectData) => {
        setShowWizard(false);
        setProjects(prev => [newProject, ...prev]);
        setSelectedProject(newProject);
        setView("pipeline");
    };

    const handleClientCreated = (newClient: UserData) => {
        setShowNewClientModal(false);
        setClients(prev => [newClient, ...prev]);
        setSelectedClient(newClient);
    };

    const inProgress = projects.filter(p => p.status !== "delivered").length;
    const pendingDesigns = projects.reduce((acc, p) => acc + p.designs.filter(d => d.status === "pending").length, 0);

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            {showWizard && (
                <NewProjectWizard
                    onClose={() => setShowWizard(false)}
                    onCreated={handleProjectCreated}
                />
            )}

            {showNewClientModal && (
                <NewClientModal
                    onClose={() => setShowNewClientModal(false)}
                    onCreated={handleClientCreated}
                />
            )}

            <div className="min-h-screen bg-[#060d1a] text-white flex font-inter">
                {/* ── SIDEBAR ── */}
                <aside className="w-64 border-r border-white/8 flex flex-col fixed h-full bg-[#060d1a]">
                    {/* Brand */}
                    <div className="p-6 border-b border-white/8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs font-extrabold">A</span>
                            </div>
                            <span className="font-extrabold font-montserrat text-sm tracking-wide">AILEADSITE</span>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-1">
                        <button
                            onClick={() => { setView("pipeline"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "pipeline" && !selectedProject ? "bg-white/10 text-white" : "opacity-40 hover:opacity-80 hover:bg-white/5"}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Pipeline
                            {inProgress > 0 && (
                                <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">{inProgress}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { setView("clients"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "clients" ? "bg-white/10 text-white" : "opacity-40 hover:opacity-80 hover:bg-white/5"}`}
                        >
                            <Users className="w-4 h-4" />
                            Klanten
                            <span className="ml-auto text-xs opacity-30 font-medium">{clients.length}</span>
                        </button>
                    </nav>

                    {/* Stats */}
                    {pendingDesigns > 0 && (
                        <div className="mx-4 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <p className="text-xs font-bold text-yellow-400">{pendingDesigns} design{pendingDesigns > 1 ? "s" : ""} wachten</p>
                            <p className="text-[10px] opacity-50 mt-0.5">Klant moet nog reviewen</p>
                        </div>
                    )}

                    {/* New project CTA */}
                    <div className="p-4 border-t border-white/8">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-4 h-4" /> Nieuw Project
                        </button>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 mt-2 rounded-xl text-sm opacity-30 hover:opacity-70 hover:bg-white/5 transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Uitloggen
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-grow ml-64 p-10 min-h-screen">
                    {view === "pipeline" && !selectedProject && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-extrabold font-montserrat">Project Pipeline</h1>
                                    <p className="text-sm opacity-40 mt-1">{projects.length} projecten totaal · {inProgress} lopend</p>
                                </div>
                                <button
                                    onClick={load}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm opacity-40 hover:opacity-100 hover:bg-white/5 transition-all"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {/* Step filter pills */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!activeFilter ? "bg-white text-black" : "bg-white/5 hover:bg-white/10 opacity-60"}`}
                                >
                                    Alle ({projects.length})
                                </button>
                                {STEPS.map(step => {
                                    const count = projects.filter(p => p.status === step.key).length;
                                    return (
                                        <button
                                            key={step.key}
                                            onClick={() => setActiveFilter(activeFilter === step.key ? null : step.key)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === step.key ? `${step.bg} ${step.color}` : "bg-white/5 hover:bg-white/10 opacity-60"}`}
                                        >
                                            <step.icon className="w-3 h-3" />
                                            {step.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Project grid */}
                            {loading ? (
                                <div className="flex items-center justify-center py-32">
                                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="py-32 flex flex-col items-center gap-4 opacity-30">
                                    <FolderOpen className="w-12 h-12" />
                                    <p className="text-lg font-medium">Geen projecten gevonden</p>
                                    <p className="text-sm">Maak een nieuw project aan via de sidebar</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredProjects.map(project => (
                                        <ProjectPipelineCard
                                            key={project.id}
                                            project={project}
                                            client={clientMap[project.clientId]}
                                            onClick={() => setSelectedProject(project)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === "pipeline" && selectedProject && (
                        <ProjectDetail
                            project={selectedProject}
                            clientId={selectedProject.clientId}
                            onBack={() => { setSelectedProject(null); load(); }}
                            onUpdate={(updated) => {
                                setSelectedProject(updated);
                                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                            }}
                        />
                    )}

                    {view === "clients" && !selectedClient && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-extrabold font-montserrat">Klanten</h1>
                                    <p className="text-sm opacity-60 mt-1">{clients.length} geregistreerde klanten</p>
                                </div>
                                <button
                                    onClick={() => setShowNewClientModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold transition-all shadow-lg shadow-green-600/20"
                                >
                                    <Plus className="w-4 h-4" /> Nieuwe Klant
                                </button>
                            </div>
                            <ClientList onSelectClient={setSelectedClient} />
                        </div>
                    )}

                    {view === "clients" && selectedClient && (
                        <ClientDetail
                            client={selectedClient}
                            onBack={() => setSelectedClient(null)}
                            onUpdate={setSelectedClient}
                        />
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
