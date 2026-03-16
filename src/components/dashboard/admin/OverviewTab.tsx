import React from "react";
import { UserData, ProjectData, InvoiceData } from "@/types/database";
import { CheckCircle, AlertCircle, Clock, TrendingUp, Users, FolderOpen, ArrowRight } from "lucide-react";

interface OverviewTabProps {
    projects: ProjectData[];
    clients: UserData[];
    invoices: InvoiceData[];
    onNavigate: (view: "pipeline" | "clients" | "leads" | "invoices") => void;
}

export default function OverviewTab({ projects, clients, invoices, onNavigate }: OverviewTabProps) {
    // Basic stats
    const activeProjects = projects.filter(p => p.status !== "delivered");
    const newLeads = clients.filter(c => (c.status === "new_lead" || c.status === "contacted" || c.status === "lead") && c.role === "client");
    const pendingDesigns = projects.filter(p => p.designs.some(d => d.status === "pending"));
    
    // Calculate real invoice stats
    const outstandingInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue").length; 
    const overdueInvoices = invoices.filter(i => i.status === "overdue");
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold font-display text-navy mb-1">Vandaag</h1>
                <p className="text-sm text-slate-500 font-medium">Hier is wat er vandaag je aandacht nodig heeft.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <FolderOpen className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-navy">{activeProjects.length}</div>
                    <div className="text-sm text-slate-500 font-medium mt-1">Actieve Projecten</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-navy">{newLeads.length}</div>
                    <div className="text-sm text-slate-500 font-medium mt-1">Nieuwe Leads</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-navy">{pendingDesigns.length}</div>
                    <div className="text-sm text-slate-500 font-medium mt-1">Wachten op Review</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-navy">{outstandingInvoices}</div>
                    <div className="text-sm text-slate-500 font-medium mt-1">Openstaande Facturen</div>
                </div>
            </div>

            {/* Action Items List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Urgent Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Actie Vereist
                    </h2>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {pendingDesigns.length === 0 && newLeads.length === 0 && outstandingInvoices === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle className="w-12 h-12 mb-3 text-green-400" />
                                <p className="font-bold text-slate-600">Alles is bijgewerkt!</p>
                                <p className="text-sm mt-1">Je hebt geen urgente actiepunten vandaag.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {pendingDesigns.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-navy text-sm">{p.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                                Klant review nodig
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate("pipeline")}
                                            className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {newLeads.slice(0, 3).map(c => (
                                    <div key={c.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-navy text-sm">{c.displayName || c.email}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                Nieuwe lead contacteren
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate("leads")}
                                            className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {overdueInvoices.map(i => (
                                    <div key={i.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-navy text-sm">Factuur {i.invoiceNumber}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                Betaling overtijd (€{i.amount})
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate("invoices")}
                                            className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {invoices.filter(i => i.status === "sent").slice(0, 2).map(i => (
                                    <div key={i.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-navy text-sm">Factuur {i.invoiceNumber}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                Wachten op betaling (€{i.amount})
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onNavigate("invoices")}
                                            className="p-2 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Recent Activity / Pipeline summary */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-navy">Pipeline Overzicht</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="space-y-4">
                            {["intake", "design_review", "development", "qa"].map(step => {
                                const count = projects.filter(p => p.status === step).length;
                                const labels: Record<string, string> = {
                                    "intake": "Intake",
                                    "design_review": "Design",
                                    "development": "Development",
                                    "qa": "QA / Testing"
                                };
                                const colors: Record<string, string> = {
                                    "intake": "bg-blue-500",
                                    "design_review": "bg-purple-500",
                                    "development": "bg-yellow-500",
                                    "qa": "bg-orange-500"
                                };

                                return (
                                    <div key={step}>
                                        <div className="flex justify-between text-sm font-bold text-slate-600 mb-1.5">
                                            <span>{labels[step]}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${colors[step]}`} 
                                                style={{ width: `${Math.min(100, (count / Math.max(1, projects.length)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button 
                            onClick={() => onNavigate("pipeline")}
                            className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors border border-slate-200"
                        >
                            Bekijk volledige pipeline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
