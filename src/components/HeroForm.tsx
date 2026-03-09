"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { 
    Check, 
    ArrowLeft, 
    LayoutTemplate, 
    Globe, 
    Building2, 
    Target, 
    TrendingUp, 
    Trophy,
    User,
    Mail,
    ArrowRight
} from "lucide-react";

const steps = [
    {
        id: "project",
        title: "Wat gaan we bouwen?",
        subtitle: "Kies de oplossing die bij jouw visie past.",
        options: [
            { label: "Hoog-ROI Landingspagina", icon: LayoutTemplate },
            { label: "Volledige Bedrijfswebsite", icon: Globe },
            { label: "Enterprise Oplossing", icon: Building2 },
        ],
    },
    {
        id: "goal",
        title: "Wat is je hoofddoel?",
        subtitle: "Waar moeten we de focus op leggen?",
        options: [
            { label: "Meer Gekwalificeerde Leads", icon: Target },
            { label: "Directe Online Verkoop", icon: TrendingUp },
            { label: "Domineer de Lokale Markt", icon: Trophy },
        ],
    },
    {
        id: "contact",
        title: "Waar sturen we de audit heen?",
        subtitle: "Je ontvangt binnen 24 uur een video analyse.",
    },
];

export default function HeroForm() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        project: "",
        goal: "",
        name: "",
        email: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const formRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const nextStep = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        
        if (step < steps.length - 1) {
            gsap.to(contentRef.current, {
                opacity: 0,
                x: -30,
                duration: 0.4,
                ease: "power3.inOut",
                onComplete: () => {
                    setStep(step + 1);
                    gsap.fromTo(contentRef.current,
                        { opacity: 0, x: 30 },
                        { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", onComplete: () => setIsAnimating(false) }
                    );
                }
            });
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (isAnimating || step === 0) return;
        setIsAnimating(true);

        gsap.to(contentRef.current, {
            opacity: 0,
            x: 30,
            duration: 0.4,
            ease: "power3.inOut",
            onComplete: () => {
                setStep(step - 1);
                gsap.fromTo(contentRef.current,
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", onComplete: () => setIsAnimating(false) }
                );
            }
        });
    };

    const handleSubmit = () => {
        setIsAnimating(true);
        gsap.to(formRef.current, {
            opacity: 0,
            scale: 0.95,
            y: 10,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                setIsSubmitted(true);
                gsap.fromTo(formRef.current,
                    { opacity: 0, scale: 1.05, y: -10 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" }
                );
            }
        });
    };

    const handleOptionSelect = (id: string, value: string) => {
        if (isAnimating) return;
        setFormData({ ...formData, [id]: value });
        // Korte vertraging zodat de gebruiker de selectiestatus ziet
        setTimeout(nextStep, 300);
    };

    if (isSubmitted) {
        return (
            <div
                ref={formRef}
                className="relative flex min-h-[480px] w-full max-w-lg lg:ml-auto flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-navy-light/40 p-10 text-center shadow-2xl backdrop-blur-xl"
            >
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-accent blur-xl opacity-40 rounded-full animate-pulse" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-orange-400 text-white shadow-xl">
                        <Check className="h-12 w-12" strokeWidth={3} />
                    </div>
                </div>
                
                <h3 className="mb-4 font-display text-3xl font-extrabold text-white tracking-tight">
                    Aanvraag Ontvangen!
                </h3>
                <p className="text-slate-300 leading-relaxed font-medium">
                    We hebben je gegevens in goede orde ontvangen. Onze strateeg analyseert je doelen en neemt <span className="text-white font-bold">binnen 24 uur</span> contact op.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={formRef}
            className="relative flex min-h-[480px] w-full max-w-lg lg:ml-auto flex-col rounded-[2rem] border border-white/5 bg-navy-light/40 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
            {/* Inner top highlight for glass effect */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Premium Progress Bar */}
            <div className="absolute left-6 top-8 right-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-accent relative rounded-full"
                    style={{ width: `${((step + 1) / steps.length) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50" />
                </div>
            </div>

            <div className="flex flex-col flex-grow p-8 md:p-10 pt-16 relative z-10">
                <div ref={contentRef} className="flex flex-col flex-grow">
                    <div className="mb-8">
                        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                            {steps[step].title}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">
                            {steps[step].subtitle}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 flex-grow">
                        {steps[step].options ? (
                            steps[step].options?.map((opt) => {
                                const isSelected = formData[steps[step].id as keyof typeof formData] === opt.label;
                                const Icon = opt.icon;
                                
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleOptionSelect(steps[step].id, opt.label)}
                                        className={`group relative flex items-center gap-4 w-full rounded-2xl p-4 text-left transition-all duration-300 overflow-hidden
                                            ${isSelected
                                                ? "border-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgba(255,125,41,1)]"
                                                : "border-transparent bg-white/5 hover:bg-white/10 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors
                                            ${isSelected ? "bg-accent text-white" : "bg-white/10 text-slate-400 group-hover:text-white"}
                                        `}>
                                            <Icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-[15px] font-bold transition-colors ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                                            {opt.label}
                                        </span>
                                        {/* Subtle hover reveal arrow */}
                                        <ArrowRight className={`absolute right-4 w-5 h-5 transition-all duration-300 ${isSelected ? "opacity-100 text-accent translate-x-0" : "opacity-0 -translate-x-4 text-slate-500 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white"}`} />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col gap-5 justify-center flex-grow -mt-4">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                            <User size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Je volledige naam"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                            <Mail size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="jouw@bedrijf.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.name || !formData.email || !formData.email.includes('@')}
                                    className="mt-4 group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-6 font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-navy shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] disabled:shadow-none overflow-hidden"
                                >
                                    <span className="relative z-10">Audit Aanvragen</span>
                                    {/* Shine effect on hover */}
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Navigation within form */}
                {step > 0 && (
                     <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group"
                            aria-label="Ga terug"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Terug</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
