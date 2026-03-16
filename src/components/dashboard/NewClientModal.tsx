"use client";

import { useState } from "react";
import { X, User, Mail, Building, Loader2, Check } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { UserData } from "@/types/database";
import { createClient } from "@/lib/services/clientService";

interface NewClientModalProps {
    onClose: () => void;
    onCreated: (client: UserData) => void;
}

export default function NewClientModal({ onClose, onCreated }: NewClientModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [status, setStatus] = useState<"lead" | "active_client">("lead");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Naam is verplicht";
        if (!email.trim()) e.email = "Email is verplicht";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Ongeldig emailadres";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const clientData: Partial<UserData> = {
                displayName: name.trim(),
                email: email.trim().toLowerCase(),
                status: status,
                companyDetails: {
                    name: companyName.trim(),
                    address: "",
                    email: email.trim().toLowerCase(),
                    phone: "",
                    kvk: "",
                    vat: ""
                }
            };
            const id = await createClient(clientData);
            const newClient: UserData = {
                uid: id,
                email: email.trim().toLowerCase(),
                displayName: name.trim(),
                photoURL: null,
                role: "client",
                status: status,
                companyDetails: clientData.companyDetails,
                createdAt: Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
            };
            onCreated(newClient);
        } catch (err) {
            console.error(err);
            setErrors({ general: "Er is iets misgegaan bij het aanmaken van de klant." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center border border-green-200">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-slate-900">Nieuwe Klant</h2>
                            <p className="text-xs text-slate-500">Voeg een nieuwe klant toe aan het systeem</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Volledige Naam *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="bijv. Jan de Vries"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors({ ...errors, name: "" }); }}
                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Emailadres *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="jan@voorbeeld.nl"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
                                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Bedrijfsnaam
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Bedrijfsnaam (optioneel)"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-slate-700 mb-2 block tracking-wider">
                            Klant Type
                        </label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setStatus("lead")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${status === "lead" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Lead
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus("active_client")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${status === "active_client" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                Actieve Klant
                            </button>
                        </div>
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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Klant Aanmaken
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
