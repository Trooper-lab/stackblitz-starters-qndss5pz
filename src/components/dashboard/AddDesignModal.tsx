"use client";

import { useState } from "react";
import { X, Layout, FileCode, FileText, Plus } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { ProjectDesign } from "@/types/database";

interface AddDesignModalProps {
    onClose: () => void;
    onAdd: (design: ProjectDesign) => void;
    defaultName?: string;
    initialDesign?: ProjectDesign | null;
}

export default function AddDesignModal({ onClose, onAdd, defaultName = "", initialDesign = null }: AddDesignModalProps) {
    const [name, setName] = useState(initialDesign?.name || defaultName);
    const [htmlUrl, setHtmlUrl] = useState(initialDesign?.htmlUrl || "");
    const [htmlCode, setHtmlCode] = useState(initialDesign?.htmlCode || "");
    const [description, setDescription] = useState(initialDesign?.description || "");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Geef een naam op";
        if (!htmlCode.trim() && !htmlUrl.trim()) e.html = "Geef een URL of plak de HTML code op";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        const newDesign: ProjectDesign = {
            ...initialDesign,
            id: initialDesign?.id || `d_${Date.now()}`,
            name: name.trim(),
            status: initialDesign?.status || "pending",
            createdAt: initialDesign?.createdAt || Timestamp.fromDate(new Date()),
            htmlUrl: htmlUrl.trim() || undefined,
            htmlCode: htmlCode.trim() || undefined,
            description: description.trim() || undefined,
        };

        onAdd(newDesign);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl shadow-slate-200/50 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Layout className="w-5 h-5 text-navy" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900">{initialDesign ? "Design Bewerken" : "Design Toevoegen"}</h2>
                            <p className="text-xs text-slate-500">Plak de Google Stitch HTML-export voor klantreview</p>
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

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <FileCode className="w-4 h-4 text-navy" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Design Bron</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-tight">
                                        HTML URL (bijv. Vercel of Cloudflare Link)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={htmlUrl}
                                        onChange={e => { setHtmlUrl(e.target.value); setErrors(prev => ({ ...prev, html: "" })); }}
                                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${errors.html ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-navy"}`}
                                    />
                                </div>

                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">of</span>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase tracking-tight">
                                        HTML Code (Google Stitch Export)
                                    </label>
                                    <textarea
                                        placeholder="Plak hier de HTML code..."
                                        value={htmlCode}
                                        onChange={e => { setHtmlCode(e.target.value); setErrors(prev => ({ ...prev, html: "" })); }}
                                        rows={6}
                                        className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-mono text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none ${errors.html ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-navy"}`}
                                    />
                                </div>
                            </div>
                            {errors.html && <p className="text-red-500 text-xs mt-2">{errors.html}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Beschrijving <span className="normal-case opacity-60 text-slate-500">(optioneel)</span>
                        </label>
                        <textarea
                            placeholder="Wat is er nieuw of anders in dit design?"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
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
                            {!initialDesign && <Plus className="w-4 h-4" />}
                            {initialDesign ? "Opslaan" : "Design Toevoegen"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
