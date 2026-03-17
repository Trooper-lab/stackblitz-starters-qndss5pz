import { useState, useEffect } from "react";
import { CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import { Loader2, ArrowRight, Building2, Globe, ShieldCheck, Target, Sparkles, Users, FileText, Hash } from "lucide-react";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deepCleanData } from "@/lib/utils";
import { User } from "firebase/auth";
import { motion } from "framer-motion";

interface CustomerOnboardingFormProps {
    user: User | null;
    initialCompanyDetails: CompanyDetails;
    initialDomainInfo: DomainInfo;
    initialProjectContext: ProjectContext;
    loading: boolean;
    onSaveSuccess: (companyDetails: CompanyDetails, domainInfo: DomainInfo, projectContext: ProjectContext) => Promise<void>;
}

export default function CustomerOnboardingForm({ 
    user, 
    initialCompanyDetails, 
    initialDomainInfo, 
    initialProjectContext, 
    loading, 
    onSaveSuccess 
}: CustomerOnboardingFormProps) {

    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(initialCompanyDetails);
    const [domainInfo, setDomainInfo] = useState<DomainInfo>(initialDomainInfo);
    const [projectContext, setProjectContext] = useState<ProjectContext>(initialProjectContext);

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    // Dutch landline (010 xxx xxxx) or mobile (06 xxxx xxxx), accepts spaces, dashes, +31
    const validatePhone = (v: string) => {
        const stripped = v.replace(/[\s\-().]/g, "");
        return /^(\+31|0031|0)[1-9][0-9]{7,8}$/.test(stripped);
    };
    // Must start with https:// and have a TLD (e.g. .nl, .com)
    const validateUrl = (v: string) => {
        if (!v.trim()) return true; // field is optional
        try {
            const url = new URL(v.trim());
            return url.protocol === "https:" && /\.[a-z]{2,}$/.test(url.hostname);
        } catch {
            return false;
        }
    };

    const handleFieldBlur = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        if (field === "email") {
            errors.email = validateEmail(value) ? "" : "Vul een geldig e-mailadres in.";
        } else if (field === "phone") {
            errors.phone = validatePhone(value) ? "" : "Vul een geldig Nederlands telefoonnummer in (bijv. 0612345678).";
        } else if (field === "website") {
            errors.website = validateUrl(value) ? "" : "Vul een geldige URL in met https:// en een domeinnaam (bijv. https://www.jouwbedrijf.nl).";
        }
        setFieldErrors(errors);
    };

    const isFormValid = () => {
        return (
            companyDetails.name.trim() !== "" &&
            companyDetails.address.trim() !== "" &&
            validateEmail(companyDetails.email) &&
            validatePhone(companyDetails.phone) &&
            projectContext.goals.trim() !== "" &&
            projectContext.targetAudience.trim() !== ""
        );
    };

    // Debounced autosave for onboarding forms
    useEffect(() => {
        if (!user || loading) return;

        const timer = setTimeout(async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const rawData = {
                    companyDetails,
                    domainInfo,
                    projectContext,
                    updatedAt: serverTimestamp()
                };
                const cleaned = deepCleanData(rawData);
                await updateDoc(userRef, cleaned).catch(e => {
                    if (e.code === 'not-found') {
                        return setDoc(userRef, cleaned, { merge: true });
                    }
                    throw e;
                });
            } catch (error) {
                console.warn("Autosave skipped or failed:", error);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [user, companyDetails, domainInfo, projectContext, loading]);

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !isFormValid()) return;

        setIsSaving(true);
        try {
            await onSaveSuccess(companyDetails, domainInfo, projectContext);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="flex-grow p-6 py-12 max-w-4xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-6">
                        Stap 1: Claim je 3 Gratis Designs
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">De start van iets moois<span className="text-accent">.</span></h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Vul je gegevens in zodat we direct kunnen starten met jouw <span className="text-white font-black italic underline decoration-accent underline-offset-4">3 gratis</span> ontwerpen. Geen creditcard nodig.
                    </p>
                </div>

                <form onSubmit={handleOnboardingSubmit} className="space-y-10 pb-20">
                    {/* Section 1: Bedrijfsgegevens */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black uppercase tracking-tight">Bedrijfsgegevens</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contactinformatie</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bedrijfsnaam *</label>
                                <input
                                    type="text"
                                    required
                                    value={companyDetails.name}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    placeholder="Bijv. AI Lead Site BV"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mailadres *</label>
                                <input
                                    type="email"
                                    required
                                    value={companyDetails.email}
                                    onChange={(e) => {
                                        setCompanyDetails({ ...companyDetails, email: e.target.value });
                                        if (fieldErrors.email) handleFieldBlur("email", e.target.value);
                                    }}
                                    onBlur={(e) => handleFieldBlur("email", e.target.value)}
                                    className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                        fieldErrors.email ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                    }`}
                                    placeholder="info@jouwbedrijf.nl"
                                />
                                {fieldErrors.email && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.email}</p>}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vestigingsadres *</label>
                                <input
                                    type="text"
                                    required
                                    value={companyDetails.address}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    placeholder="Straat 123, 1234 AB Plaats"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefoonnummer *</label>
                                <input
                                    type="tel"
                                    required
                                    value={companyDetails.phone}
                                    onChange={(e) => {
                                        setCompanyDetails({ ...companyDetails, phone: e.target.value });
                                        if (fieldErrors.phone) handleFieldBlur("phone", e.target.value);
                                    }}
                                    onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                                    className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                        fieldErrors.phone ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                    }`}
                                    placeholder="06 12 34 56 78"
                                />
                                {fieldErrors.phone && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Domein & Hosting */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black uppercase tracking-tight">Domein & Hosting</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Technische configuratie</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Huidig Domein</label>
                                <input
                                    type="url"
                                    value={domainInfo.currentDomain}
                                    onChange={(e) => {
                                        setDomainInfo({ ...domainInfo, currentDomain: e.target.value });
                                        if (fieldErrors.website) handleFieldBlur("website", e.target.value);
                                    }}
                                    onBlur={(e) => {
                                        let val = e.target.value.trim();
                                        if (val && !val.startsWith("http")) {
                                            val = "https://" + val;
                                            setDomainInfo({ ...domainInfo, currentDomain: val });
                                        }
                                        handleFieldBlur("website", val);
                                    }}
                                    className={`w-full bg-white/5 border rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                                        fieldErrors.website ? "border-red-500/60 focus:ring-red-500" : "border-white/10"
                                    }`}
                                    placeholder="https://www.jouwbedrijf.nl"
                                />
                                {fieldErrors.website && <p className="text-red-400 text-xs font-bold ml-1">{fieldErrors.website}</p>}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Huidige Provider</label>
                                <input
                                    type="text"
                                    value={domainInfo.provider}
                                    onChange={(e) => setDomainInfo({ ...domainInfo, provider: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    placeholder="Bijv. Hostnet, TransIP, etc."
                                />
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-navy-light/40 border border-white/5 rounded-2xl flex items-center gap-4 text-slate-400 text-sm italic">
                            <ShieldCheck className="text-accent shrink-0" size={20} />
                            Inloggegevens vragen wij pas op wanneer dit strikt noodzakelijk is via een beveiligde verbinding.
                        </div>
                    </div>

                    {/* Section 3: Project Context */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                                <Target size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black uppercase tracking-tight">Project Context & Doelen</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Strategische basis</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                    <Sparkles size={12} className="text-accent" /> Doelen van de website
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={projectContext.goals}
                                    onChange={(e) => setProjectContext({ ...projectContext, goals: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                    placeholder="Wat wil je bereiken? Bijv. Meer offerte aanvragen, online verkoop, etc."
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                    <Users size={12} className="text-accent" /> Doelgroep
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={projectContext.targetAudience}
                                    onChange={(e) => setProjectContext({ ...projectContext, targetAudience: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                    placeholder="Wie is je ideale klant?"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                    <FileText size={12} className="text-accent" /> Huidige Content / Inhoud
                                </label>
                                <textarea
                                    rows={2}
                                    value={projectContext.currentWebsiteContent}
                                    onChange={(e) => setProjectContext({ ...projectContext, currentWebsiteContent: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                    placeholder="Heb je al teksten of foto's? Of moeten wij dit verzorgen?"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                    <Hash size={12} className="text-accent" /> Concurrenten
                                </label>
                                <textarea
                                    rows={2}
                                    value={projectContext.competitors}
                                    onChange={(e) => setProjectContext({ ...projectContext, competitors: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                                    placeholder="Welke bedrijven in jouw branche bewonder je?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Legal (optional) */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                                <FileText size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-display font-black uppercase tracking-tight text-slate-300">Juridische Gegevens <span className="text-slate-600 text-sm font-bold normal-case tracking-normal">(optioneel)</span></h2>
                                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Nodig voor facturatie</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-8 ml-1">Je kunt dit later ook invullen. We hebben dit alleen nodig op het moment dat we een factuur opmaken.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">KVK Nummer</label>
                                <input
                                    type="text"
                                    value={companyDetails.kvk || ""}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, kvk: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    placeholder="8 cijfers (bijv. 12345678)"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">BTW Nummer</label>
                                <input
                                    type="text"
                                    value={companyDetails.vat || ""}
                                    onChange={(e) => setCompanyDetails({ ...companyDetails, vat: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    placeholder="NL001234567B01"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving || !isFormValid()}
                        className="w-full bg-accent text-white rounded-[2rem] p-6 text-xl font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:translate-y-[-4px] active:translate-y-0"
                    >
                        {isSaving ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <>Claim Gratis Designs <ArrowRight size={24} /></>
                        )}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
