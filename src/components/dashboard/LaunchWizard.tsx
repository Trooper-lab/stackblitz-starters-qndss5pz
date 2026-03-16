"use client";

import { useState, ComponentType } from "react";
import { LaunchSettings, LaunchFlowOption } from "@/types/database";
import { Globe, Shield, Database, Layout, CheckCircle2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LaunchWizardProps {
    onClose: () => void;
    onComplete: (settings: LaunchSettings) => void;
    isSubmitting?: boolean;
    initialSettings?: LaunchSettings;
}

const OPTIONS: { id: LaunchFlowOption; title: string; desc: string; icon: ComponentType<{ className?: string }> }[] = [
    { 
        id: "no_domain", 
        title: "Ik heb nog geen domeinnaam", 
        desc: "Geen zorgen, wij regelen de registratie en hosting voor je.",
        icon: Globe
    },
    { 
        id: "move_domain", 
        title: "Verhuis mijn domein", 
        desc: "Verhuis je bestaande domein naar ons beheer voor een zorgeloze ervaring.",
        icon: Shield
    },
    { 
        id: "full_migration", 
        title: "Volledige migratie", 
        desc: "Wij verhuizen je volledige website, e-mail en domein naar onze servers.",
        icon: Database
    },
    { 
        id: "self_dns", 
        title: "Ik beheer mijn eigen DNS", 
        desc: "Jij houdt controle over je eigen provider, wij geven je de juiste DNS instellingen.",
        icon: Layout
    }
];

export default function LaunchWizard({ onClose, onComplete, isSubmitting, initialSettings }: LaunchWizardProps) {
    const [step, setStep] = useState<1 | 2>(initialSettings ? 2 : 1);
    const [selectedOption, setSelectedOption] = useState<LaunchFlowOption | null>(initialSettings?.option || null);
    const [formData, setFormData] = useState({
        domainName: initialSettings?.domainName || "",
        currentProvider: initialSettings?.currentProvider || "",
        loginDetails: initialSettings?.loginDetails || "",
        confirmedMove: initialSettings?.confirmedMove || false,
        confirmedBackup: initialSettings?.confirmedBackup || false,
    });

    const handleOptionSelect = (option: LaunchFlowOption) => {
        setSelectedOption(option);
        setStep(2);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        
        onComplete({
            option: selectedOption,
            ...formData
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-blue-500/10"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Website Lancering Configuratie
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Hoe wil je dat we je website live zetten?</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid sm:grid-cols-2 gap-4"
                            >
                                {OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionSelect(opt.id)}
                                        className="text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group"
                                    >
                                        <div className="p-3 bg-blue-600/20 rounded-xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-400">
                                            <opt.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-white mb-2">{opt.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{opt.desc}</p>
                                    </button>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                                            {OPTIONS.find(o => o.id === selectedOption)?.icon && 
                                                (() => {
                                                    const Icon = OPTIONS.find(o => o.id === selectedOption)!.icon;
                                                    return <Icon className="w-4 h-4" />;
                                                })()
                                            }
                                        </div>
                                        <span className="font-bold text-white text-sm">{OPTIONS.find(o => o.id === selectedOption)?.title}</span>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Wijzig optie</button>
                                </div>

                                <div className="space-y-4">
                                    {/* Domain Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Domeinnaam</label>
                                        <input 
                                            type="text"
                                            placeholder="bijv. www.jouwbedrijf.nl"
                                            value={formData.domainName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, domainName: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>

                                    {/* Conditional Fields based on option */}
                                    {selectedOption !== "no_domain" && selectedOption !== "self_dns" && (
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Huidige Provider</label>
                                                <input 
                                                    type="text"
                                                    placeholder="bijv. Hostnet, TransIP..."
                                                    value={formData.currentProvider}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, currentProvider: e.target.value }))}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Inloggegevens / Verhuiscode</label>
                                                <input 
                                                    type="text"
                                                    placeholder="Login of tokens..."
                                                    value={formData.loginDetails}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, loginDetails: e.target.value }))}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Self DNS Info */}
                                    {selectedOption === "self_dns" && (
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-200">
                                            <p>Je ontvangt de DNS records (A, CNAME, TXT) zodra de configuratie gereed is.</p>
                                        </div>
                                    )}

                                    {/* Confirmations */}
                                    <div className="space-y-3 pt-2">
                                        <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                                            <input 
                                                type="checkbox"
                                                checked={formData.confirmedMove}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmedMove: e.target.checked }))}
                                                className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-400 font-medium">Ik geef Antigravity toestemming om de technische lancering uit te voeren.</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                                            <input 
                                                type="checkbox"
                                                checked={formData.confirmedBackup}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmedBackup: e.target.checked }))}
                                                className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-400 font-medium">Ik heb een backup van mijn huidige website/e-mail (indien van toepassing).</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.domainName || !formData.confirmedMove || isSubmitting}
                                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>Bevestig Configuratie <CheckCircle2 className="w-5 h-5" /></>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
