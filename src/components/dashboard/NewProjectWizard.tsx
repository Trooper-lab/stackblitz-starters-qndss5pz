"use client";

import { useState, useEffect } from "react";
import { X, Search, FolderOpen, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { UserData, ProjectData } from "@/types/database";
import { getClients } from "@/lib/services/clientService";
import { createProject } from "@/lib/services/projectService";

interface NewProjectWizardProps {
    onClose: () => void;
    onCreated: (project: ProjectData) => void;
}

export default function NewProjectWizard({ onClose, onCreated }: NewProjectWizardProps) {
    const [step, setStep] = useState(1);
    const [clients, setClients] = useState<UserData[]>([]);
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<UserData | null>(null);
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        getClients()
            .then(setClients)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = clients.filter(
        c => c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.companyDetails?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async () => {
        const errs: Record<string, string> = {};
        if (!selectedClient) errs.client = "Selecteer een klant";
        if (!title.trim()) errs.title = "Vul een project titel in";
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSaving(true);
        try {
            const id = await createProject({
                clientId: selectedClient!.uid,
                clientEmail: selectedClient!.email || undefined,
                title: title.trim(),
                status: "vibecheck",
                assets: [],
                designs: [],
            });
            const newProject: ProjectData = {
                id,
                clientId: selectedClient!.uid,
                clientEmail: selectedClient!.email || undefined,
                title: title.trim(),
                status: "vibecheck",
                assets: [],
                designs: [],
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
            };
            onCreated(newProject);
        } catch {
            setErrors({ general: "Aanmaken mislukt. Probeer opnieuw." });
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl shadow-slate-200/50 animate-in slide-in-from-bottom-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="font-bold text-lg text-slate-900">Nieuw Project</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${s <= step ? "bg-navy border-navy text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                                        {s < step ? <Check className="w-3 h-3" /> : s}
                                    </div>
                                    <span className={`text-xs font-medium ${s === step ? "text-slate-800" : "text-slate-400"}`}>
                                        {s === 1 ? "Klant" : "Projectinfo"}
                                    </span>
                                    {s < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Step 1: Select Client */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in">
                            <p className="text-sm font-medium text-slate-600">Selecteer de klant voor dit project</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    autoFocus
                                    placeholder="Zoek op naam, email of bedrijf..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {loading ? (
                                    <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                                ) : filtered.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-slate-500">Geen klanten gevonden</div>
                                ) : (
                                    filtered.map(client => (
                                        <button
                                            key={client.uid}
                                            onClick={() => { setSelectedClient(client); setErrors({}); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedClient?.uid === client.uid ? "border-navy bg-blue-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-navy shrink-0">
                                                {(client.displayName || client.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">{client.displayName || client.email}</p>
                                                <p className="text-xs text-slate-500 truncate">{client.companyDetails?.name || client.email}</p>
                                            </div>
                                            {selectedClient?.uid === client.uid && (
                                                <Check className="w-4 h-4 text-navy shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.client && <p className="text-red-500 text-xs font-medium">{errors.client}</p>}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => { if (!selectedClient) { setErrors({ client: "Selecteer een klant" }); return; } setStep(2); }}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white text-sm font-bold transition-all shadow-sm"
                                >
                                    Volgende <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Project Info */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in">
                            {selectedClient && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                        {(selectedClient.displayName || selectedClient.email || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{selectedClient.displayName}</p>
                                        <p className="text-xs text-slate-500">{selectedClient.companyDetails?.name || selectedClient.email}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">Project Titel *</label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="bijv. Website Redesign 2025"
                                        value={title}
                                        onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: "" })); }}
                                        className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy"}`}
                                    />
                                </div>
                                {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                                    Interne Notitie <span className="normal-case font-normal text-slate-500">(optioneel)</span>
                                </label>
                                <textarea
                                    placeholder="Initiële afspraken, bijzonderheden, startdatum..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            {errors.general && (
                                <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl font-medium">{errors.general}</p>
                            )}

                            <div className="flex justify-between pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Terug
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Project Aanmaken
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
