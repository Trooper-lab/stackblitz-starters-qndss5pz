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
import { UserData, ProjectData, InvoiceData } from "@/types/database";
import { getAllProjects, createProject } from "@/lib/services/projectService";
import { getClients } from "@/lib/services/clientService";
import { getAllInvoices } from "@/lib/services/invoiceService";
import {
    Plus, FolderOpen, Users, LogOut, LayoutDashboard,
    CheckCircle, Wrench, Layout, FileText, Loader2, RefreshCw, Home, TrendingUp, FileSpreadsheet, AlertCircle
} from "lucide-react";
import OverviewTab from "@/components/dashboard/admin/OverviewTab";
import LeadManager from "@/components/dashboard/admin/LeadManager";
import InvoiceOverview from "@/components/dashboard/admin/InvoiceOverview";

type View = "overview" | "pipeline" | "clients" | "leads" | "invoices";

const STEPS = [
    { key: "intake", label: "Intake", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { key: "design_review", label: "Design Review", icon: Layout, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
    { key: "development", label: "Development", icon: Wrench, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
    { key: "qa", label: "QA", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
    { key: "delivered", label: "Opgeleverd", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-200" },
];

export default function AdminDashboard() {
    const { signOut } = useAuth();
    const [view, setView] = useState<View>("overview");
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [clients, setClients] = useState<UserData[]>([]);
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [selectedClient, setSelectedClient] = useState<UserData | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [p, c, i] = await Promise.all([getAllProjects(), getClients(), getAllInvoices()]);
            setProjects(p);
            setClients(c);
            setInvoices(i);
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

    const handleStartFreeDesign = async (clientId: string) => {
        const client = clients.find(c => c.uid === clientId);
        try {
            const projectDataToCreate: Partial<ProjectData> = {
                clientId,
                clientEmail: client?.email || undefined,
                title: "Free HTML Design",
                status: "design_review",
                assets: [],
                designs: [],
            };

            // Copy package selection if the client has already made one during onboarding
            if (client?.selectedPackage) {
                projectDataToCreate.packageSelection = {
                    packageId: client.selectedPackage.packageId,
                    addons: client.selectedPackage.addons || [],
                    billingCycle: client.selectedPackage.billingCycle || "monthly"
                };
            }

            const id = await createProject(projectDataToCreate as Omit<ProjectData, "id" | "createdAt" | "updatedAt">);
            
            // Let's also update the client status to "design_pipeline"
            await import("@/lib/services/clientService").then(mod => mod.updateClientData(clientId, { status: "design_pipeline" }));
            // We need to reload projects to get this new one, then select it
            const p = await getAllProjects();
            setProjects(p);
            const newProj = p.find(proj => proj.id === id);
            
            if (newProj) {
                setSelectedClient(null);
                setSelectedProject(newProj);
                setView("pipeline");
            }
        } catch (error) {
            console.error("Error creating free design project:", error);
            alert("Er is iets misgegaan bij het aanmaken van het project.");
        }
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

            <div className="min-h-screen bg-slate-50 text-slate-800 flex font-inter">
                {/* ── SIDEBAR ── */}
                <aside className="w-64 border-r border-navy-light flex flex-col fixed h-full bg-navy text-white">
                    {/* Brand */}
                    <div className="p-6 border-b border-navy-light/50">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🚀</span>
                            <span className="font-extrabold font-display text-lg tracking-tight uppercase">AIleadsite<span className="text-accent">.</span></span>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <button
                            onClick={() => { setView("overview"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "overview" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <Home className="w-4 h-4" />
                            Vandaag
                        </button>
                        <button
                            onClick={() => { setView("leads"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "leads" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Leads
                            <span className="ml-auto text-xs opacity-50 font-medium">{clients.filter(c => c.status === "new_lead" || c.status === "contacted" || c.status === "lead").length}</span>
                        </button>
                        <button
                            onClick={() => { setView("clients"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "clients" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <Users className="w-4 h-4" />
                            Klanten
                            <span className="ml-auto text-xs opacity-50 font-medium">{clients.filter(c => c.status === "active_client" || c.status === "active" || c.status === "design_pipeline").length}</span>
                        </button>
                        <button
                            onClick={() => { setView("pipeline"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "pipeline" && !selectedProject ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Pipeline
                            {inProgress > 0 && (
                                <span className="ml-auto text-[10px] uppercase tracking-wider bg-accent/20 text-accent font-black px-2 py-0.5 rounded-full">{inProgress}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { setView("invoices"); setSelectedProject(null); setSelectedClient(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === "invoices" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Facturen
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
                    <div className="p-4 border-t border-navy-light/50">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-accent hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
                        >
                            <Plus className="w-4 h-4" /> Nieuw Project
                        </button>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 mt-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Uitloggen
                        </button>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-grow ml-64 p-10 min-h-screen">
                    {view === "overview" && (
                        <OverviewTab projects={projects} clients={clients} invoices={invoices} onNavigate={(v) => {
                            setView(v);
                            setSelectedProject(null);
                            setSelectedClient(null);
                        }} />
                    )}

                    {view === "leads" && !selectedClient && (
                        <LeadManager 
                            clients={clients} 
                            onSelectLead={setSelectedClient} 
                            onStartFreeDesign={handleStartFreeDesign} 
                        />
                    )}

                    {view === "pipeline" && !selectedProject && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1">Project Pipeline</h1>
                                    <p className="text-sm text-slate-500 font-medium">{projects.length} projecten totaal · {inProgress} lopend</p>
                                </div>
                                <button
                                    onClick={load}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-navy hover:bg-slate-200 transition-all border border-slate-200 bg-white shadow-sm"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {/* Step filter pills */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${!activeFilter ? "bg-navy text-white border-navy shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                >
                                    Alle ({projects.length})
                                </button>
                                {STEPS.map(step => {
                                    const count = projects.filter(p => p.status === step.key).length;
                                    return (
                                        <button
                                            key={step.key}
                                            onClick={() => setActiveFilter(activeFilter === step.key ? null : step.key)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === step.key ? `${step.bg} ${step.color} shadow-sm border-opacity-100` : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            <step.icon className="w-3 h-3" />
                                            {step.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Project grid or Kanban */}
                            {loading ? (
                                <div className="flex items-center justify-center py-32">
                                    <Loader2 className="w-8 h-8 animate-spin text-navy/20" />
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="py-32 flex flex-col items-center gap-4 text-slate-400">
                                    <FolderOpen className="w-12 h-12" />
                                    <p className="text-lg font-bold text-slate-500">Geen projecten gevonden</p>
                                    <p className="text-sm">Maak een nieuw project aan via de sidebar</p>
                                </div>
                            ) : activeFilter ? (
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
                            ) : (
                                <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                                    {STEPS.map(step => {
                                        const colProjects = filteredProjects.filter(p => p.status === step.key);
                                        return (
                                            <div key={step.key} className="flex-none w-80 flex flex-col snap-start">
                                                <div className={`px-4 py-3 rounded-t-xl border-t border-x flex items-center justify-between ${step.bg}`}>
                                                    <div className="flex items-center gap-2">
                                                        <step.icon className={`w-4 h-4 ${step.color}`} />
                                                        <h3 className={`font-bold text-sm ${step.color}`}>{step.label}</h3>
                                                    </div>
                                                    <span className={`text-xs font-black ${step.color} bg-white px-2 py-0.5 rounded-full shadow-sm`}>
                                                        {colProjects.length}
                                                    </span>
                                                </div>
                                                <div className="flex-1 bg-slate-100/50 border-x border-b border-slate-200 rounded-b-xl p-3 flex flex-col gap-3 min-h-[400px]">
                                                    {colProjects.length === 0 ? (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50 py-10">
                                                            <FolderOpen className="w-8 h-8 mb-2" />
                                                            <p className="text-xs font-medium">Geen projecten</p>
                                                        </div>
                                                    ) : (
                                                        colProjects.map(project => (
                                                            <ProjectPipelineCard
                                                                key={project.id}
                                                                project={project}
                                                                client={clientMap[project.clientId]}
                                                                onClick={() => setSelectedProject(project)}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {view === "pipeline" && selectedProject && (
                        <ProjectDetail
                            project={selectedProject}
                            clientId={selectedProject.clientId}
                            clientStatus={clientMap[selectedProject.clientId]?.status}
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
                                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1">Klanten</h1>
                                    <p className="text-sm text-slate-500 font-medium">{clients.length} geregistreerde klanten</p>
                                </div>
                                <button
                                    onClick={() => setShowNewClientModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
                                >
                                    <Plus className="w-4 h-4" /> Nieuwe Klant
                                </button>
                            </div>
                            <ClientList onSelectClient={setSelectedClient} />
                        </div>
                    )}

                    {selectedClient && (view === "clients" || view === "leads") && (
              <ClientDetail
                client={selectedClient}
                onBack={() => setSelectedClient(null)}
                onUpdate={setSelectedClient}
                projects={projects.filter((p) => p.clientId === selectedClient.uid)}
                invoices={invoices.filter((i) => i.clientId === selectedClient.uid)}
              />
            )}
                    {view === "invoices" && (
                        <InvoiceOverview clients={clients} />
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
