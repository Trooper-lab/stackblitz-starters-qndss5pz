"use client";

import { useState, useEffect, useCallback } from "react";
import { InvoiceData, UserData, ProjectData } from "@/types/database";
import { getAllInvoices, createInvoice, updateInvoice } from "@/lib/services/invoiceService";
import { getClients } from "@/lib/services/clientService";
import { getAllProjects } from "@/lib/services/projectService";
import InvoiceDocument from "@/components/dashboard/InvoiceDocument";
import {
    Receipt, CheckCircle, Clock, AlertTriangle, FileText,
    Plus, RefreshCw, Loader2, Send, Check, X, ChevronDown, Zap,
    Building2, Briefcase, Calendar, TrendingUp, ExternalLink
} from "lucide-react";
import { Timestamp } from "firebase/firestore";

type FilterStatus = "all" | "draft" | "sent" | "paid" | "overdue";

const STATUS_STYLE: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    sent: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-green-50 text-green-700 border-green-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
    draft: "Concept", sent: "Verzonden", paid: "Betaald", overdue: "Verlopen",
};

interface NewInvoiceForm {
    clientId: string;
    projectId: string;
    description: string;
    amount: number;
    dueDays: number;
    type: "one_time" | "maintenance";
    billingCycle?: "monthly" | "yearly";
}

interface InvoiceSuggestion {
    projectId: string;
    clientId: string;
    type: string;
    label: string;
    amount: number;
    description: string;
    billingCycle?: "monthly" | "yearly";
}

export default function InvoiceOverview({ clients: propClients }: { clients?: UserData[] }) {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [clients, setClients] = useState<UserData[]>(propClients || []);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
    const [form, setForm] = useState<NewInvoiceForm>({
        clientId: "", projectId: "", description: "", amount: 0, dueDays: 14, type: "one_time"
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [inv, proj, cl] = await Promise.all([
                getAllInvoices(),
                getAllProjects(),
                propClients ? Promise.resolve(propClients) : getClients(),
            ]);
            setInvoices(inv);
            setProjects(proj);
            setClients(cl);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [propClients]);

    useEffect(() => { load(); }, [load]);

    const clientMap = Object.fromEntries(clients.map(c => [c.uid, c]));
    const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

    const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

    const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const totalOutstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const totalDraft = invoices.filter(i => i.status === "draft").length;

    // Automation: Calculate suggestions
    const suggestions: InvoiceSuggestion[] = projects.flatMap(p => {
        const projectInvoices = invoices.filter(i => i.projectId === p.id);
        const suggests: InvoiceSuggestion[] = [];

        // 1. Commitment Fee Suggestion
        const hasCommitment = projectInvoices.some(i => i.description.includes("Commitment Fee"));
        if (!hasCommitment && p.status !== "intake") {
            suggests.push({
                projectId: p.id,
                clientId: p.clientId,
                type: "commitment",
                label: "Commitment Fee (50%)",
                amount: p.packageSelection?.totalPrice ? p.packageSelection.totalPrice / 2 : 0,
                description: `50% Commitment Fee - ${p.title}`
            });
        }

        // 2. Final Payment Suggestion
        const hasFinal = projectInvoices.some(i => i.description.includes("Restbetaling") || i.description.includes("Finale"));
        if (!hasFinal && p.status === "delivered") {
            suggests.push({
                projectId: p.id,
                clientId: p.clientId,
                type: "final",
                label: "Finale Betaling (50%)",
                amount: p.packageSelection?.totalPrice ? p.packageSelection.totalPrice / 2 : 0,
                description: `50% Restbetaling bij oplevering - ${p.title}`
            });
        }

        // 3. Maintenance Suggestion
        const hasMaintenance = projectInvoices.some(i => i.type === "maintenance");
        if ((p.status === "delivered" || p.status === "qa") && p.packageSelection?.maintenancePrice && !hasMaintenance) {
            suggests.push({
                projectId: p.id,
                clientId: p.clientId,
                type: "maintenance",
                label: `Onderhoud (${p.packageSelection.billingCycle === "monthly" ? "Maand" : "Jaar"})`,
                amount: p.packageSelection.maintenancePrice,
                description: `${p.packageSelection.billingCycle === "monthly" ? "Maandelijkse" : "Jaarlijkse"} Hosting & Onderhoud - ${p.title}`,
                billingCycle: p.packageSelection.billingCycle
            });
        }

        return suggests;
    });

    const handleCreate = async () => {
        if (!form.clientId || !form.description || form.amount <= 0) return;
        setCreating(true);
        try {
            if (editingId) {
                const updates: Partial<InvoiceData> = {
                    clientId: form.clientId,
                    projectId: form.projectId,
                    amount: form.amount,
                    description: form.description,
                    type: form.type,
                };
                if (form.type === "maintenance" && form.billingCycle) {
                    updates.billingCycle = form.billingCycle;
                }
                await updateInvoice(editingId, updates);
            } else {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + form.dueDays);
                
                const invoiceData: Omit<InvoiceData, "id" | "createdAt"> = {
                    clientId: form.clientId,
                    projectId: form.projectId,
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                    amount: form.amount,
                    description: form.description,
                    status: "draft",
                    type: form.type,
                    issuedAt: Timestamp.now(),
                    dueDate: Timestamp.fromDate(dueDate),
                };

                if (form.type === "maintenance" && form.billingCycle) {
                    invoiceData.billingCycle = form.billingCycle;
                }

                await createInvoice(invoiceData);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ clientId: "", projectId: "", description: "", amount: 0, dueDays: 14, type: "one_time" });
            await load();
        } catch (e) {
            console.error("Error saving invoice:", e);
            alert("Er is een fout opgetreden bij het opslaan van de factuur.");
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = (inv: InvoiceData) => {
        setEditingId(inv.id);
        setForm({
            clientId: inv.clientId,
            projectId: inv.projectId,
            description: inv.description,
            amount: inv.amount,
            dueDays: 14, // default, usually not stored in exactly this way but can be derived if needed
            type: inv.type || "one_time",
            billingCycle: inv.billingCycle
        });
        setShowForm(true);
    };

    const handleCreateFromSuggestion = async (sugg: InvoiceSuggestion) => {
        setCreating(true);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            const invoiceData: Omit<InvoiceData, "id" | "createdAt"> = {
                clientId: sugg.clientId,
                projectId: sugg.projectId,
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                amount: sugg.amount,
                description: sugg.description,
                status: "draft",
                type: (sugg.type === "maintenance" ? "maintenance" : "one_time") as "maintenance" | "one_time",
                issuedAt: Timestamp.now(),
                dueDate: Timestamp.fromDate(dueDate),
            };

            if (sugg.billingCycle) {
                invoiceData.billingCycle = sugg.billingCycle;
            }

            await createInvoice(invoiceData);
            await load();
        } catch (e) { console.error(e); }
        finally { setCreating(false); }
    };

    const handleStatusChange = async (inv: InvoiceData, newStatus: InvoiceData["status"]) => {
        setUpdatingId(inv.id);
        try {
            await updateInvoice(inv.id, {
                status: newStatus,
                ...(newStatus === "paid" ? { paidAt: Timestamp.now() } : {}),
                ...(newStatus === "sent" ? { issuedAt: Timestamp.now() } : {}),
            });
            setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: newStatus } : i));
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1 tracking-tight">Financieel Overzicht</h1>
                    <p className="text-sm text-slate-500 font-medium">Beheer facturatie en volg betalingen</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={load}
                        disabled={loading}
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-navy hover:bg-slate-100 transition-all border border-slate-200 bg-white"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setForm({ clientId: "", projectId: "", description: "", amount: 0, dueDays: 14, type: "one_time" });
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-lg shadow-navy/10"
                    >
                        <Plus className="w-4 h-4" /> Nieuwe Factuur
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Ontvangen", value: `€${totalPaid.toFixed(2)}`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                    { label: "Openstaand", value: `€${totalOutstanding.toFixed(2)}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                    { label: "Verlopen", value: `€${totalOverdue.toFixed(2)}`, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
                    { label: "Concepten", value: `${totalDraft} stuks`, icon: FileText, color: "text-slate-600", bg: "bg-slate-50 border-slate-100" },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${stat.bg} flex flex-col gap-3 group hover:shadow-md transition-all`}>
                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 font-display">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Automation Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent animate-pulse" />
                            <h3 className="font-bold text-sm text-navy uppercase tracking-wider">Slimme Suggesties</h3>
                        </div>
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase">Automatisering</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map((sugg, idx) => {
                            const client = clientMap[sugg.clientId];
                            return (
                                <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-accent/30 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-accent" />
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{sugg.label}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-black text-navy leading-none">€{sugg.amount.toFixed(2)}</span>
                                                {sugg.billingCycle && (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">/{sugg.billingCycle === "monthly" ? "mnd" : "jr"}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{client?.companyDetails?.name || client?.displayName || client?.email}</p>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 opacity-80">{sugg.description}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleCreateFromSuggestion(sugg)}
                                        disabled={creating}
                                        className="mt-6 w-full py-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                                    >
                                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />}
                                        Maak Concept
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* New Invoice Form */}
            {showForm && (
                <div className="bg-white border border-navy/10 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                                {editingId ? <Receipt className="w-5 h-5 text-navy" /> : <Plus className="w-5 h-5 text-navy" />}
                            </div>
                            <h3 className="font-black text-navy text-xl uppercase tracking-tight">
                                {editingId ? "Bewerk Factuur" : "Handmatige Factuur"}
                            </h3>
                        </div>
                        <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Klant</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <select
                                    value={form.clientId}
                                    onChange={e => setForm(f => ({ ...f, clientId: e.target.value, projectId: "" }))}
                                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 appearance-none transition-all"
                                >
                                    <option value="">Selecteer klant...</option>
                                    {clients.map(c => (
                                        <option key={c.uid} value={c.uid}>{c.companyDetails?.name || c.displayName || c.email}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <select
                                    value={form.projectId}
                                    onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                                    disabled={!form.clientId}
                                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 disabled:opacity-50 transition-all appearance-none"
                                >
                                    <option value="">Geen project...</option>
                                    {projects.filter(p => p.clientId === form.clientId).map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Omschrijving</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="bijv. Extra design ronde of consult"
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bedrag (€)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-3.5 text-slate-400 font-bold">€</span>
                                <input
                                    type="number"
                                    value={form.amount || ""}
                                    onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Betaaltermijn</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <select
                                    value={form.dueDays}
                                    onChange={e => setForm(f => ({ ...f, dueDays: parseInt(e.target.value) }))}
                                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 transition-all appearance-none"
                                >
                                    <option value={7}>7 dagen</option>
                                    <option value={14}>14 dagen</option>
                                    <option value={30}>30 dagen</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value as "one_time" | "maintenance", billingCycle: e.target.value === "maintenance" ? "monthly" : undefined }))}
                                className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 transition-all appearance-none"
                            >
                                <option value="one_time">Eenmalig</option>
                                <option value="maintenance">Onderhoud & Hosting</option>
                            </select>
                        </div>
                        {form.type === "maintenance" && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cyclus</label>
                                <select
                                    value={form.billingCycle}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm(f => ({ ...f, billingCycle: e.target.value as "monthly" | "yearly" }))}
                                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-navy/5 bg-slate-50/50 transition-all appearance-none"
                                >
                                    <option value="monthly">Per maand</option>
                                    <option value="yearly">Per jaar</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button 
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setForm({ clientId: "", projectId: "", description: "", amount: 0, dueDays: 14, type: "one_time" });
                            }} 
                            className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Niet nu
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating || !form.clientId || !form.description || form.amount <= 0}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wider transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingId ? "Update Factuur" : "Creëer Factuur"}
                        </button>
                    </div>
                </div>
            )}

            {/* List & Filtering */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {(["all", "draft", "sent", "paid", "overdue"] as FilterStatus[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2 whitespace-nowrap rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f ? "bg-navy text-white border-navy shadow-lg shadow-navy/10" : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-white hover:border-slate-300"}`}
                            >
                                {f === "all" ? `Alle (${invoices.length})` : `${STATUS_LABEL[f]} (${invoices.filter(i => i.status === f).length})`}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Filter op status</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Factuur & Details</th>
                                <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Klant & Project</th>
                                <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financieel</th>
                                <th className="text-center px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-navy/10 mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center space-y-3">
                                        <Receipt className="w-12 h-12 text-slate-100 mx-auto" />
                                        <p className="text-sm font-bold text-slate-400 italic">Geen facturen gevonden voor dit filter</p>
                                    </td>
                                </tr>
                            ) : filtered.map((inv) => {
                                const client = clientMap[inv.clientId];
                                const project = projectMap[inv.projectId];
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-black text-navy text-sm tracking-tight">{inv.invoiceNumber}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] truncate uppercase font-bold tracking-wider">{inv.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{client?.companyDetails?.name || client?.displayName || client?.email}</p>
                                                <p className="text-[10px] text-slate-400 group-hover:text-accent transition-colors font-medium">{project?.title || "Geen Project"}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="font-black text-navy text-base">€{inv.amount.toFixed(2)}</p>
                                            {inv.dueDate && (
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Due: {inv.dueDate instanceof Timestamp ? inv.dueDate.toDate().toLocaleDateString('nl-NL') : (inv.dueDate && typeof inv.dueDate === 'object' && 'seconds' in inv.dueDate) ? new Date((inv.dueDate as { seconds: number }).seconds * 1000).toLocaleDateString('nl-NL') : 'Unknown'}</p>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full border tracking-widest ${STATUS_STYLE[inv.status]}`}>
                                                {STATUS_LABEL[inv.status]}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {updatingId === inv.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            title="Factuur inzien & printen"
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-navy border border-slate-200 transition-all shadow-sm"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                                onClick={() => handleEdit(inv)}
                                                                title="Factuur bewerken"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-400 border border-slate-200 transition-all shadow-sm"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                            </button>
                                                            {inv.status === "draft" && (
                                                            <button
                                                                onClick={() => handleStatusChange(inv, "sent")}
                                                                title="Versturen naar klant"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-amber-500 hover:text-white text-amber-500 border border-slate-200 hover:border-amber-500 transition-all shadow-sm"
                                                            >
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {(inv.status === "sent" || inv.status === "overdue") && (
                                                            <button
                                                                onClick={() => handleStatusChange(inv, "paid")}
                                                                title="Betaling bevestigen"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-500 hover:text-white text-emerald-500 border border-slate-200 hover:border-emerald-500 transition-all shadow-sm"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {inv.status === "sent" && (
                                                            <button
                                                                onClick={() => handleStatusChange(inv, "overdue")}
                                                                title="Als verlopen markeren"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-rose-500 hover:text-white text-rose-500 border border-slate-200 hover:border-rose-500 transition-all shadow-sm"
                                                            >
                                                                <AlertTriangle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Invoice Document View */}
            {selectedInvoice && (
                <InvoiceDocument
                    invoice={selectedInvoice}
                    client={clientMap[selectedInvoice.clientId]}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
