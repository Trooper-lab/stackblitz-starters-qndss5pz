"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";

const steps = [
    {
        id: "project",
        title: "What are we building?",
        options: ["High-ROI Landing Page", "Full Business Website", "Enterprise Solution"],
    },
    {
        id: "goal",
        title: "What is your main goal?",
        options: ["More Qualified Leads", "Direct Online Sales", "Dominate Local Market"],
    },
    {
        id: "contact",
        title: "Where should we send your audit?",
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
    const formRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const nextStep = () => {
        if (step < steps.length - 1) {
            gsap.to(contentRef.current, {
                opacity: 0,
                x: -20,
                duration: 0.3,
                onComplete: () => {
                    setStep(step + 1);
                    gsap.fromTo(contentRef.current,
                        { opacity: 0, x: 20 },
                        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
                    );
                }
            });
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            gsap.to(contentRef.current, {
                opacity: 0,
                x: 20,
                duration: 0.3,
                onComplete: () => {
                    setStep(step - 1);
                    gsap.fromTo(contentRef.current,
                        { opacity: 0, x: -20 },
                        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
                    );
                }
            });
        }
    };

    const handleSubmit = () => {
        gsap.to(formRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            onComplete: () => {
                setIsSubmitted(true);
                gsap.fromTo(formRef.current,
                    { opacity: 0, scale: 1.05 },
                    { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
                );
            }
        });
    };

    if (isSubmitted) {
        return (
            <div
                ref={formRef}
                className="relative flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-navy-light/80 p-8 md:p-12 text-center shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-10 w-10" />
                </div>
                <h3 className="mb-4 font-display text-2xl md:text-3xl font-extrabold text-white">
                    Audit Requested!
                </h3>
                <p className="mx-auto max-w-[300px] leading-relaxed text-slate-400">
                    Our growth strategist will review your goals and reach out within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={formRef}
            className="relative flex min-h-[450px] flex-col rounded-3xl border border-white/10 bg-navy-light/80 p-6 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
            {/* Progress Bar */}
            <div className="absolute left-0 top-0 h-1 w-full overflow-hidden rounded-t-3xl bg-white/5">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>

            <div ref={contentRef} className="flex flex-grow flex-col">
                <span className="mb-3 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-primary">
                    Step {step + 1} of {steps.length}
                </span>
                <h3 className="mb-8 font-display text-xl md:text-2xl font-extrabold leading-tight text-white">
                    {steps[step].title}
                </h3>

                <div className="flex flex-grow flex-col gap-3">
                    {steps[step].options ? (
                        steps[step].options?.map((opt) => {
                            const isSelected = formData[steps[step].id as keyof typeof formData] === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        setFormData({ ...formData, [steps[step].id]: opt });
                                        setTimeout(nextStep, 200);
                                    }}
                                    className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm md:text-[15px] font-semibold transition-all duration-200 ${isSelected
                                        ? "border-primary bg-primary/10 text-white"
                                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-[13px] font-bold text-slate-400">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:py-4 text-sm md:text-[15px] text-white outline-none transition-colors focus:border-primary focus:bg-white/10"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs md:text-[13px] font-bold text-slate-400">Work Email</label>
                                <input
                                    type="email"
                                    placeholder="john@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:py-4 text-sm md:text-[15px] text-white outline-none transition-colors focus:border-primary focus:bg-white/10"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 md:mt-10 flex gap-4">
                    {step > 0 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 rounded-xl border border-white/20 bg-transparent py-4 font-bold text-white transition-colors hover:bg-white/5"
                        >
                            Back
                        </button>
                    )}
                    {!steps[step].options && (
                        <button
                            onClick={nextStep}
                            disabled={!formData.name || !formData.email}
                            className={`flex-[2] rounded-xl py-4 font-black uppercase tracking-[0.05em] text-white transition-all ${formData.name && formData.email
                                ? "cursor-pointer bg-primary hover:bg-accent"
                                : "cursor-not-allowed bg-primary/50"
                                }`}
                        >
                            Finish Audit Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
