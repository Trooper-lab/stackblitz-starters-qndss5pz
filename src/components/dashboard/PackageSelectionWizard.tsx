"use client";

import { useState } from "react";
import { X, Check, ChevronRight, ChevronLeft, Loader2, Receipt } from "lucide-react";
import { pricingTiers, pricingAddons } from "@/lib/config/pricing";
import { ProjectData } from "@/types/database";

interface PackageSelectionWizardProps {
    project: ProjectData;
    onClose: () => void;
    onComplete: (data: { packageId: string; addons: string[]; billingCycle: "monthly" | "yearly"; commitmentFee: number }) => void;
    isSubmitting: boolean;
}

export default function PackageSelectionWizard({ project, onClose, onComplete, isSubmitting }: PackageSelectionWizardProps) {
    const [step, setStep] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState<string>("");
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const handleNext = () => setStep(s => Math.min(s + 1, 3));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const getPackage = () => pricingTiers.find(t => t.id === selectedPackage);
    const getAddons = () => pricingAddons.filter(a => selectedAddons.includes(a.id));

    const calculateTotal = () => {
        const pkg = getPackage();
        if (!pkg) return 0;
        const pkgPrice = billingCycle === "monthly" ? pkg.priceMonthlyValue : pkg.priceYearlyValue;
        const addonsPrice = getAddons().reduce((sum, a) => sum + (billingCycle === "monthly" ? a.priceMonthlyValue : a.priceYearlyValue), 0);
        return pkgPrice + addonsPrice;
    };

    const calculateMonthlyEquivalent = () => {
        const pkg = getPackage();
        if (!pkg) return 0;
        const pkgPrice = pkg.priceMonthlyValue;
        const addonsPrice = getAddons().reduce((sum, a) => sum + a.priceMonthlyValue, 0);
        return pkgPrice + addonsPrice;
    };

    const commitmentFee = calculateMonthlyEquivalent() * 0.5;

    const handleSubmit = () => {
        if (!selectedPackage) return;
        onComplete({
            packageId: selectedPackage,
            addons: selectedAddons,
            billingCycle,
            commitmentFee
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div>
                        <h2 className="font-bold text-xl text-navy font-montserrat tracking-tight">Pakket Samenstellen</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s <= step ? "bg-navy text-white shadow-sm" : "bg-white border border-slate-200 text-slate-400"}`}>
                                        {s < step ? <Check className="w-3 h-3" /> : s}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block ${s <= step ? "text-slate-800" : "text-slate-400"}`}>
                                        {s === 1 ? "Pakket" : s === 2 ? "Extra's" : "Overzicht"}
                                    </span>
                                    {s < 3 && <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isSubmitting} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-500 hover:text-navy disabled:opacity-50 shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50">
                    {/* Step 1: Package Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold font-montserrat text-navy mb-2">Kies het pakket dat bij je past</h3>
                                <p className="text-slate-500 max-w-xl mx-auto mb-8">Selecteer de basis voor jouw nieuwe website. Je kunt later altijd nog upgraden of extra modules toevoegen.</p>
                                
                                <div className="bg-white p-1.5 rounded-full inline-flex relative border border-slate-200 shadow-sm mb-4">
                                    <button
                                        onClick={() => setBillingCycle("monthly")}
                                        className={`relative z-10 px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === "monthly" ? "text-navy" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Maandelijks
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle("yearly")}
                                        className={`relative z-10 px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === "yearly" ? "text-navy" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Jaarlijks <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ml-1">2 mnd gratis</span>
                                    </button>
                                    <div
                                        className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-50 shadow-sm border border-slate-100 transition-all duration-300 ease-out"
                                        style={{
                                            left: billingCycle === "monthly" ? "6px" : "50%",
                                            width: "calc(50% - 6px)"
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {pricingTiers.map(tier => (
                                    <div
                                        key={tier.id}
                                        onClick={() => setSelectedPackage(tier.id)}
                                        className={`relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${selectedPackage === tier.id ? "border-navy ring-4 ring-navy/10" : "border-slate-200 hover:border-navy/50"}`}
                                    >
                                        {tier.featured && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold py-1 px-3 rounded-full shadow-sm">
                                                Meest Gekozen
                                            </div>
                                        )}
                                        {selectedPackage === tier.id && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-navy rounded-full flex items-center justify-center animate-in zoom-in shrink-0">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <h4 className="font-bold text-xl text-navy mb-1">{tier.name}</h4>
                                        <p className="text-sm text-slate-500 mb-4 h-10">{tier.desc}</p>
                                        <div className="flex items-end gap-1 mb-6 pb-6 border-b border-slate-100">
                                            <span className="text-3xl font-extrabold text-slate-900">
                                                €{billingCycle === "monthly" ? tier.priceMonthlyValue : Math.round(tier.priceYearlyValue / 12)}
                                            </span>
                                            <span className="text-sm text-slate-500 font-medium mb-1">
                                                /mnd {billingCycle === "yearly" && "(jaarlijks gefactureerd)"}
                                            </span>
                                        </div>
                                        <ul className="space-y-3">
                                            {tier.features.slice(0, 4).map((feat, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Add-ons & Billing Cycle */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold font-montserrat text-navy mb-2">Maak het helemaal af (optioneel)</h3>
                                <p className="text-slate-500">Kies extra modules om nog meer uit je website te halen.</p>
                            </div>                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Extra Modules</h4>
                                <div className="space-y-3">
                                    {pricingAddons.map(addon => {
                                        const isSelected = selectedAddons.includes(addon.id);
                                        const price = billingCycle === "monthly" ? addon.priceMonthlyValue : Math.round(addon.priceYearlyValue / 12);
                                        return (
                                            <div
                                                key={addon.id}
                                                onClick={() => setSelectedAddons(prev => isSelected ? prev.filter(id => id !== addon.id) : [...prev, addon.id])}
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-navy bg-blue-50/50" : "border-slate-100 hover:border-slate-300"}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isSelected ? "bg-navy border-navy text-white" : "border-slate-300 bg-white"}`}>
                                                        {isSelected && <Check className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-900">{addon.name}</h5>
                                                        <p className="text-sm text-slate-500">{addon.features[0]}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-navy">+ €{price}</span>
                                                    <span className="text-xs text-slate-500">/mnd</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold font-montserrat text-navy mb-2">Overzicht & Bevestiging</h3>
                                <p className="text-slate-500">Controleer je keuze en bevestig je ontwerp om te starten.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-200">
                                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm mb-4">Jouw Selectie</h4>
                                    
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-bold text-navy text-lg">{getPackage()?.name}</p>
                                            <p className="text-sm text-slate-500">Basis pakket ({billingCycle === "monthly" ? "Maandelijks" : "Jaarlijks"})</p>
                                        </div>
                                        <p className="font-bold text-slate-900">
                                            €{billingCycle === "monthly" ? getPackage()?.priceMonthlyValue : getPackage()?.priceYearlyValue}
                                            <span className="text-sm font-normal text-slate-500">/{billingCycle === "yearly" ? "jr" : "mnd"}</span>
                                        </p>
                                    </div>

                                    {getAddons().map(addon => (
                                        <div key={addon.id} className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 border-dashed">
                                            <div>
                                                <p className="font-semibold text-slate-700">{addon.name}</p>
                                                <p className="text-xs text-slate-500">Extra module</p>
                                            </div>
                                            <p className="font-medium text-slate-700">
                                                + €{billingCycle === "monthly" ? addon.priceMonthlyValue : addon.priceYearlyValue}
                                                <span className="text-xs font-normal text-slate-500">/{billingCycle === "yearly" ? "jr" : "mnd"}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-navy text-white flex justify-between items-center">
                                    <span className="font-bold text-lg">Totaal</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-extrabold">€{calculateTotal()}</span>
                                        <span className="text-blue-200">/{billingCycle === "yearly" ? "jaar" : "maand"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                <h4 className="font-bold text-navy mb-2 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-blue-600" />
                                    Commitment Fee Invoice
                                </h4>
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                    Zodra je het ontwerp goedkeurt, maken wij direct een initiële factuur aan van 50% van de eerste maandkosten. Dit is een eenmalige commitment fee vóór we het project live zetten.
                                </p>
                                <div className="flex justify-between items-center border-t border-blue-200/50 pt-4 mt-2">
                                    <span className="font-semibold text-slate-700">Te factureren bedrag (eenmalig)</span>
                                    <span className="font-bold text-xl text-navy">€{commitmentFee.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || isSubmitting}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Terug
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && !selectedPackage}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-navy hover:bg-navy-light text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-navy/20"
                        >
                            Volgende
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-green-600/20"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            Ontwerp Goedkeuren & Bevestigen
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
