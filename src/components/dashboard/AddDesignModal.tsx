"use client";

import { useState } from "react";
import { X, Layout, Link, FileText, Plus } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { ProjectDesign } from "@/types/database";

interface AddDesignModalProps {
    onClose: () => void;
    onAdd: (design: ProjectDesign) => void;
    defaultName?: string;
}

export default function AddDesignModal({ onClose, onAdd, defaultName = "" }: AddDesignModalProps) {
    const [name, setName] = useState(defaultName);
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
            createdAt: Timestamp.fromDate(new Date())
        };
        onAdd(newDesign);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl shadow-slate-200/50 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Layout className="w-5 h-5 text-navy" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">Design Toevoegen</h2>
                            <p className="text-xs text-slate-500">Voeg een HTML-design toe voor klantreview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Design Naam *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="bijv. Homepage V1, Landing Page Variant A"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy"}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Design URL *
                        </label>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                placeholder="https://yourdesign.netlify.app"
                                value={url}
                                onChange={e => { setUrl(e.target.value); setErrors(prev => ({ ...prev, url: "" })); }}
                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm ${errors.url ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy"}`}
                            />
                        </div>
                        {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Beschrijving <span className="normal-case opacity-60 text-slate-500">(optioneel)</span>
                        </label>
                        <textarea
                            placeholder="Wat is er nieuw of anders in dit design?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-slate-200 focus:border-navy focus:ring-1 focus:ring-navy rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all resize-none placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50"
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
