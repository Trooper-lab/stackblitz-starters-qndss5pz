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
                title: title.trim(),
                status: "intake",
                assets: [],
                designs: [],
            });
            const newProject: ProjectData = {
                id,
                clientId: selectedClient!.uid,
                title: title.trim(),
                status: "intake",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0d1526] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="font-extrabold text-lg font-montserrat">Nieuw Project</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${s <= step ? "bg-blue-600 border-blue-600 text-white" : "border-white/20 text-white/40"}`}>
                                        {s < step ? <Check className="w-3 h-3" /> : s}
                                    </div>
                                    <span className={`text-xs ${s === step ? "text-white/80" : "opacity-30"}`}>
                                        {s === 1 ? "Klant" : "Projectinfo"}
                                    </span>
                                    {s < 2 && <ChevronRight className="w-3 h-3 opacity-20" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-white/60 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Step 1: Select Client */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in">
                            <p className="text-sm text-white/70">Selecteer de klant voor dit project</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    autoFocus
                                    placeholder="Zoek op naam, email of bedrijf..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {loading ? (
                                    <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
                                ) : filtered.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-white/50">Geen klanten gevonden</div>
                                ) : (
                                    filtered.map(client => (
                                        <button
                                            key={client.uid}
                                            onClick={() => { setSelectedClient(client); setErrors({}); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedClient?.uid === client.uid ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
                                                {(client.displayName || client.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{client.displayName || client.email}</p>
                                                <p className="text-xs text-white/60 truncate">{client.companyDetails?.name || client.email}</p>
                                            </div>
                                            {selectedClient?.uid === client.uid && (
                                                <Check className="w-4 h-4 text-blue-400 shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                            {errors.client && <p className="text-red-400 text-xs">{errors.client}</p>}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => { if (!selectedClient) { setErrors({ client: "Selecteer een klant" }); return; } setStep(2); }}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
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
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                        {(selectedClient.displayName || selectedClient.email || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{selectedClient.displayName}</p>
                                        <p className="text-xs text-white/60">{selectedClient.companyDetails?.name || selectedClient.email}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs uppercase font-bold text-white/60 mb-2 block tracking-wider">Project Titel *</label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="bijv. Website Redesign 2025"
                                        value={title}
                                        onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: "" })); }}
                                        className={`w-full bg-black/30 border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${errors.title ? "border-red-500" : "border-white/10 focus:border-blue-500"}`}
                                    />
                                </div>
                                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-white/60 mb-2 block tracking-wider">
                                    Interne Notitie <span className="normal-case opacity-60">(optioneel)</span>
                                </label>
                                <textarea
                                    placeholder="Initiële afspraken, bijzonderheden, startdatum..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full bg-black/30 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                                />
                            </div>

                            {errors.general && (
                                <p className="text-red-400 text-sm bg-red-400/5 border border-red-400/10 p-3 rounded-lg">{errors.general}</p>
                            )}

                            <div className="flex justify-between pt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white/60 hover:opacity-100 hover:bg-white/5 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Terug
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:text-white/70"
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
