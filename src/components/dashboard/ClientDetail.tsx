"use client";

import { useState } from "react";
import { UserData, CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import { updateClientData } from "@/lib/services/clientService";

interface ClientDetailProps {
    client: UserData;
    onBack: () => void;
    onUpdate: (updatedClient: UserData) => void;
}

export default function ClientDetail({ client, onBack, onUpdate }: ClientDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>(client);
    const [saving, setSaving] = useState(false);

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
                    className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity"
                >
                    ← Terug naar lijst
                </button>
                <div className="flex gap-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all disabled:opacity-50"
                            >
                                {saving ? "Opslaan..." : "Wijzigingen Opslaan"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                        >
                            Bewerken
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basis Informatie */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h3 className="text-xl font-bold mb-6 text-blue-400">Bedrijfsgegevens</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase opacity-40 mb-1">Bedrijfsnaam</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                    value={formData.companyDetails?.name || ""}
                                    onChange={(e) => updateCompany({ name: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg">{client.companyDetails?.name || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase opacity-40 mb-1">Adres</label>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-20"
                                    value={formData.companyDetails?.address || ""}
                                    onChange={(e) => updateCompany({ address: e.target.value })}
                                />
                            ) : (
                                <p className="opacity-80 whitespace-pre-wrap">{client.companyDetails?.address || "-"}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">KVK Nummer</label>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                        value={formData.companyDetails?.kvk || ""}
                                        onChange={(e) => updateCompany({ kvk: e.target.value })}
                                    />
                                ) : (
                                    <p>{client.companyDetails?.kvk || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">BTW Nummer</label>
                                {isEditing ? (
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                        value={formData.companyDetails?.vat || ""}
                                        onChange={(e) => updateCompany({ vat: e.target.value })}
                                    />
                                ) : (
                                    <p>{client.companyDetails?.vat || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Domein Informatie */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h3 className="text-xl font-bold mb-6 text-blue-400">Domein & Hosting</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase opacity-40 mb-1">Huidig Domein</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                    value={formData.domainInfo?.currentDomain || ""}
                                    onChange={(e) => updateDomain({ currentDomain: e.target.value })}
                                />
                            ) : (
                                <p className="text-lg">{client.domainInfo?.currentDomain || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase opacity-40 mb-1">Provider</label>
                            {isEditing ? (
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                    value={formData.domainInfo?.provider || ""}
                                    onChange={(e) => updateDomain({ provider: e.target.value })}
                                />
                            ) : (
                                <p>{client.domainInfo?.provider || "-"}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs uppercase opacity-40 mb-1">Inloggegevens (Admin Only)</label>
                            {isEditing ? (
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-20"
                                    value={formData.domainInfo?.loginDetails || ""}
                                    onChange={(e) => updateDomain({ loginDetails: e.target.value })}
                                    placeholder="Niet zichtbaar voor klant"
                                />
                            ) : (
                                <p className="text-xs font-mono opacity-50 bg-black/20 p-2 rounded">
                                    {client.domainInfo?.loginDetails ? "••••••••••••" : "Geen inloggegevens"}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Project Context */}
                <section className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h3 className="text-xl font-bold mb-6 text-blue-400">Project Context & Doelen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">Doelen van de website</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-32"
                                        value={formData.projectContext?.goals || ""}
                                        onChange={(e) => updateContext({ goals: e.target.value })}
                                    />
                                ) : (
                                    <p className="opacity-80">{client.projectContext?.goals || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">Doelgroep</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-24"
                                        value={formData.projectContext?.targetAudience || ""}
                                        onChange={(e) => updateContext({ targetAudience: e.target.value })}
                                    />
                                ) : (
                                    <p className="opacity-80">{client.projectContext?.targetAudience || "-"}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">Huidige Content / Inhoud</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-32"
                                        value={formData.projectContext?.currentWebsiteContent || ""}
                                        onChange={(e) => updateContext({ currentWebsiteContent: e.target.value })}
                                    />
                                ) : (
                                    <p className="opacity-80">{client.projectContext?.currentWebsiteContent || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs uppercase opacity-40 mb-1">Concurrenten</label>
                                {isEditing ? (
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none h-24"
                                        value={formData.projectContext?.competitors || ""}
                                        onChange={(e) => updateContext({ competitors: e.target.value })}
                                    />
                                ) : (
                                    <p className="opacity-80">{client.projectContext?.competitors || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
