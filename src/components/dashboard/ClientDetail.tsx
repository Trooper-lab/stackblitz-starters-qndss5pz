"use client";

import { useState } from "react";
import { UserData, CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import { updateClientData } from "@/lib/services/clientService";

interface ClientDetailProps {
    client: UserData;
    onBack: () => void;
    onUpdate: (updatedClient: UserData) => void;
    onStartProject?: (clientId: string) => void;
}

export default function ClientDetail({ client, onBack, onUpdate, onStartProject }: ClientDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>(client);
    const [saving, setSaving] = useState(false);
    const [creatingProject, setCreatingProject] = useState(false);

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

    const updateDomain = (updates: Partial<DomainInfo>) => {
        setFormData({
            ...formData,
            domainInfo: { ...(formData.domainInfo || {} as DomainInfo), ...updates }
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
                    {client.status === "lead" && onStartProject && (
                        <button
                            onClick={() => {
                                setCreatingProject(true);
                                onStartProject(client.uid);
                            }}
                            disabled={creatingProject}
                            className="px-6 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold transition-all shadow-sm"
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
                    <h3 className="text-xl font-bold mb-6 text-navy">Domein & Hosting</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Huidig Domein</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm"
                                    value={formData.domainInfo?.currentDomain || ""}
                                    onChange={(e) => updateDomain({ currentDomain: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg text-slate-900 font-medium">{client.domainInfo?.currentDomain || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Provider</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm"
                                    value={formData.domainInfo?.provider || ""}
                                    onChange={(e) => updateDomain({ provider: e.target.value })}
                                />
                            ) : (
                                <p className="text-slate-700">{client.domainInfo?.provider || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Inloggegevens (Admin Only)</label>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:border-navy focus:ring-1 focus:ring-navy outline-none text-slate-900 transition-all shadow-sm h-20"
                                    value={formData.domainInfo?.loginDetails || ""}
                                    onChange={(e) => updateDomain({ loginDetails: e.target.value })}
                                    placeholder="Niet zichtbaar voor klant"
                                />
                            ) : (
                                <p className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]">
                                    {client.domainInfo?.loginDetails ? "••••••••••••" : "Geen inloggegevens"}
                                </p>
                            )}
                        </div>
                    </div>
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
            </div>
        </div>
    );
}
