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
                companyDetails: {
                    name: companyName.trim(),
                    address: "",
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-white/20 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <User className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-white">Nieuwe Klant</h2>
                            <p className="text-xs text-white/80">Voeg een nieuwe klant toe aan het systeem</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errors.general && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div>
                        <label className="text-xs uppercase font-bold text-white/90 mb-2 block tracking-wider">
                            Volledige Naam *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="bijv. Jan de Vries"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors({ ...errors, name: "" }); }}
                                className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/40 ${errors.name ? "border-red-500" : "border-white/10 focus:border-green-500"}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-white/90 mb-2 block tracking-wider">
                            Emailadres *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="email"
                                placeholder="jan@voorbeeld.nl"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
                                className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/40 ${errors.email ? "border-red-500" : "border-white/10 focus:border-green-500"}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-white/90 mb-2 block tracking-wider">
                            Bedrijfsnaam
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="text"
                                placeholder="Bedrijfsnaam (optioneel)"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 focus:border-green-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/40"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
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
