"use client";

import { useState, useEffect } from "react";
import { UserData, CompanyDetails, ProjectContext, ProjectData, InvoiceData } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import { updateClientData } from "@/lib/services/clientService";

import { Folder, Receipt, ExternalLink } from "lucide-react";

interface ClientDetailProps {
    client: UserData;
    onBack: () => void;
    onUpdate: (updatedClient: UserData) => void;
    projects: ProjectData[];
    invoices: InvoiceData[];
    onStartProject?: (clientId: string) => void;
}

export default function ClientDetail({ client, onBack, onUpdate, projects: initialProjects, invoices: initialInvoices, onStartProject }: ClientDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>(client);
    const [saving, setSaving] = useState(false);
    const [creatingProject, setCreatingProject] = useState(false);
    const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
    const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);

    useEffect(() => {
        setProjects(initialProjects);
        setInvoices(initialInvoices);
    }, [initialProjects, initialInvoices]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateClientData(client.uid, formData);
            onUpdate(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Save failed", error);
            alert("Er is iets misgegaan bij het opslaan.");
        } finally {
            setSaving(false);
        }
    };

    const updateCompany = (updates: Partial<CompanyDetails>) => {
        setFormData({
            ...formData,
            companyDetails: { ...(formData.companyDetails || {} as CompanyDetails), ...updates }
        });
    };


    const updateContext = (updates: Partial<ProjectContext>) => {
        setFormData({
            ...formData,
            projectContext: { ...(formData.projectContext || {} as ProjectContext), ...updates }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    ← Terug naar lijst
                </button>
                <div className="flex gap-4 items-center">
                    {client.status === "lead" && (
                        <button
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await updateClientData(client.uid, { status: "active_client" });
                                    onUpdate({ ...client, status: "active_client" });
                                } catch (e) {
                                    console.error("Promotion failed", e);
                                    alert("Er is iets misgegaan bij het promoveren.");
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            disabled={saving}
                            className="px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {saving ? "Verwerken..." : "Promoveren naar Klant"}
                        </button>
                    )}
                    {(client.status === "new_lead" || client.status === "lead") && onStartProject && (
                        <button
                            onClick={() => {
                                setCreatingProject(true);
                                onStartProject(client.uid);
                            }}
                            disabled={creatingProject}
                            className="px-6 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold transition-all shadow-sm mx-2"
                        >
                            {creatingProject ? "Starten..." : "Start Free Design Project"}
                        </button>
                    )}
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all font-medium bg-white"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 rounded-xl bg-navy text-white hover:bg-navy-light font-bold transition-all disabled:opacity-50"
                            >
                                {saving ? "Opslaan..." : "Wijzigingen Opslaan"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm font-medium"
                        >
                            Bewerken
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basis Informatie */}
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-navy">Bedrijfsgegevens</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Bedrijfsnaam</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm"
                                    value={formData.companyDetails?.name || ""}
                                    onChange={(e) => updateCompany({ name: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg text-slate-900 font-medium">{client.companyDetails?.name || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Adres</label>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-20"
                                    value={formData.companyDetails?.address || ""}
                                    onChange={(e) => updateCompany({ address: e.target.value })}
                                />
                            ) : (
                                <p className="text-slate-700 whitespace-pre-wrap">{client.companyDetails?.address || "-"}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">KVK Nummer</label>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm"
                                        value={formData.companyDetails?.kvk || ""}
                                        onChange={(e) => updateCompany({ kvk: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.companyDetails?.kvk || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">BTW Nummer</label>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm"
                                        value={formData.companyDetails?.vat || ""}
                                        onChange={(e) => updateCompany({ vat: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.companyDetails?.vat || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-navy">Pakket Selectie</h3>
                    {client.selectedPackage ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-xs uppercase text-blue-600 font-bold mb-1">Geselecteerd Pakket</p>
                                <p className="text-lg text-navy font-bold capitalize">{client.selectedPackage.packageId}</p>
                                <p className="text-sm text-slate-600 mt-1">Facturatie: <span className="font-medium text-navy">{client.selectedPackage.billingCycle === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}</span></p>
                            </div>
                            {client.selectedPackage.addons && client.selectedPackage.addons.length > 0 && (
                                <div>
                                    <label className="block text-xs uppercase text-slate-500 font-semibold mb-2">Extra Opties</label>
                                    <div className="flex flex-wrap gap-2">
                                        {client.selectedPackage.addons.map(addonId => (
                                            <span key={addonId} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                                                + {addonId}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {client.selectedPackage.timestamp && (
                                <p className="text-[10px] text-slate-400 italic mt-2">
                                    Geselecteerd op: {client.selectedPackage.timestamp instanceof Timestamp ? client.selectedPackage.timestamp.toDate().toLocaleString() : 'Onbekend'}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                            <p className="text-sm text-slate-400 italic text-center">Nog geen pakket geselecteerd</p>
                        </div>
                    )}
                </section>

                <section className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 text-navy">Project Context & Doelen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Doelen van de website</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-32"
                                        value={formData.projectContext?.goals || ""}
                                        onChange={(e) => updateContext({ goals: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.projectContext?.goals || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Doelgroep</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-24"
                                        value={formData.projectContext?.targetAudience || ""}
                                        onChange={(e) => updateContext({ targetAudience: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.projectContext?.targetAudience || "-"}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Huidige Content / Inhoud</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-32"
                                        value={formData.projectContext?.currentWebsiteContent || ""}
                                        onChange={(e) => updateContext({ currentWebsiteContent: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.projectContext?.currentWebsiteContent || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Concurrenten</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-24"
                                        value={formData.projectContext?.competitors || ""}
                                        onChange={(e) => updateContext({ competitors: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700">{client.projectContext?.competitors || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Projecten */}
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                            <Folder className="w-5 h-5 text-blue-500" /> Projecten
                        </h3>
                    </div>
                    {projects.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">Geen projecten gevonden.</p>
                    ) : (
                        <div className="space-y-3">
                            {projects.map(p => (
                                <div key={p.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all flex justify-between items-center group cursor-pointer bg-slate-50 hover:bg-white">
                                    <div>
                                        <p className="font-bold text-navy">{p.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 capitalize">{p.status.replace("_", " ")}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Facturen & Financiën */}
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-green-500" /> Facturen
                        </h3>
                    </div>
                    {invoices.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">Geen facturen gevonden.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 bg-green-50 border border-green-100 p-3 rounded-xl">
                                    <p className="text-xs text-green-600 font-bold uppercase">Betaald / Omzet</p>
                                    <p className="text-lg font-bold text-green-700">€{invoices.filter(i => i.status === "paid").reduce((s,i) => s + i.amount, 0).toFixed(2)}</p>
                                </div>
                                <div className="flex-1 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                                    <p className="text-xs text-amber-600 font-bold uppercase">Openstaand</p>
                                    <p className="text-lg font-bold text-amber-700">€{invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s,i) => s + i.amount, 0).toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-white text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <Receipt className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">Factuur #{inv.invoiceNumber}</p>
                                                <p className="text-xs text-slate-500 truncate w-32 md:w-auto">{inv.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">€{inv.amount.toFixed(2)}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block mt-1 ${
                                                inv.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' :
                                                inv.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200' :
                                                inv.status === 'sent' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
