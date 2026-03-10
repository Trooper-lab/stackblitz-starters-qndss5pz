"use client";

import { useState } from "react";
import { X, Layout, Link, FileText, Plus } from "lucide-react";
import { ProjectDesign } from "@/types/database";

interface AddDesignModalProps {
    onClose: () => void;
    onAdd: (design: ProjectDesign) => void;
}

export default function AddDesignModal({ onClose, onAdd }: AddDesignModalProps) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Geef een naam op";
        if (!url.trim()) e.url = "Vul een URL in";
        else if (!url.startsWith("http")) e.url = "Moet beginnen met http(s)://";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        const newDesign: ProjectDesign = {
            id: `d_${Date.now()}`,
            name: name.trim(),
            htmlUrl: url.trim(),
            description: description.trim() || undefined,
            status: "pending",
            createdAt: new Date()
        };
        onAdd(newDesign);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Layout className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Design Toevoegen</h2>
                            <p className="text-xs text-white/80">Voeg een HTML-design toe voor klantreview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-white/60 hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-xs uppercase font-bold text-white/80 mb-2 block tracking-wider">
                            Design Naam *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="bijv. Homepage V1, Landing Page Variant A"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                                className={`w-full bg-black/30 border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${errors.name ? "border-red-500" : "border-white/10 focus:border-blue-500"}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-white/80 mb-2 block tracking-wider">
                            Design URL *
                        </label>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                            <input
                                type="url"
                                placeholder="https://yourdesign.netlify.app"
                                value={url}
                                onChange={e => { setUrl(e.target.value); setErrors(prev => ({ ...prev, url: "" })); }}
                                className={`w-full bg-black/30 border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all ${errors.url ? "border-red-500" : "border-white/10 focus:border-blue-500"}`}
                            />
                        </div>
                        {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-white/80 mb-2 block tracking-wider">
                            Beschrijving <span className="normal-case opacity-60">(optioneel)</span>
                        </label>
                        <textarea
                            placeholder="Wat is er nieuw of anders in dit design?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-black/30 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm text-white/60 hover:opacity-100 hover:bg-white/5 transition-all"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Design Toevoegen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
