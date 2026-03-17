"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import ProjectDetail from "@/components/dashboard/ProjectDetail";
import NewProjectWizard from "@/components/dashboard/NewProjectWizard";
import ClientDetail from "@/components/dashboard/ClientDetail";
import NewClientModal from "@/components/dashboard/NewClientModal";
import { UserData, ProjectData, InvoiceData } from "@/types/database";
import { getAllProjects, createProject } from "@/lib/services/projectService";
import { getClients } from "@/lib/services/clientService";
import { getAllInvoices } from "@/lib/services/invoiceService";
import { Plus, Users, LogOut, LayoutDashboard, Home, TrendingUp, FileSpreadsheet } from "lucide-react";
import OverviewTab from "@/components/dashboard/admin/OverviewTab";
import LeadManager from "@/components/dashboard/admin/LeadManager";
import InvoiceOverview from "@/components/dashboard/admin/InvoiceOverview";
import ProjectPipeline from "@/components/dashboard/admin/ProjectPipeline";
import ClientView from "@/components/dashboard/admin/ClientView";

type View = "overview" | "pipeline" | "clients" | "leads" | "invoices";


export default function AdminDashboardContent() {
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
                status: "vibecheck",
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
        <>
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
                        <ProjectPipeline
                            projects={projects}
                            clients={clients}
                            loading={loading}
                            onRefresh={load}
                            onSelectProject={setSelectedProject}
                        />
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
                        <ClientView
                            clients={clients}
                            invoices={invoices}
                            onSelectClient={setSelectedClient}
                            onNewClient={() => setShowNewClientModal(true)}
                        />
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
                        <InvoiceOverview clients={clients} invoices={invoices} projects={projects} />
                    )}
                </main>
            </div>
        </>
    );
}
