"use client";

import { useLayoutEffect, useRef } from "react";
import { Check } from "lucide-react";
import HeroForm from "./HeroForm";
import gsap from "gsap";

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.1 });

            // 1. Titel (diagonaal + unblur)
            tl.fromTo(
                ".hero-title-line",
                { opacity: 0, filter: "blur(20px)", y: 30, x: -20 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
            )
            // 2. Paragraaf tekst
            .fromTo(
                ".hero-subtitle",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, ease: "power3.out" },
                "-=0.7"
            )
            // 3. Scheidingslijn (schaalt uit van links)
            .fromTo(
                ".hero-divider",
                { opacity: 0, scaleX: 0, transformOrigin: "left center" },
                { opacity: 1, scaleX: 1, duration: 0.8, ease: "power3.out" },
                "-=0.6"
            )
            // 4. USPs (één voor één)
            .fromTo(
                ".hero-usp",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                "-=0.6"
            )
            // 5. Knoppen
            .fromTo(
                ".hero-btn",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                "-=0.6"
            )
            // 6. Social proof balkje
            .fromTo(
                ".hero-social",
                { opacity: 0, filter: "blur(5px)", y: 10, x: -5 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.6, ease: "power3.out" },
                "-=0.5"
            );

            // 7. Rechter Formulier (Komt tegelijk met de linker content binnen, maar vanaf rechts/onder diagonaal)
            tl.fromTo(
                ".hero-form-wrapper",
                { opacity: 0, filter: "blur(30px)", y: 50, x: 30 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 1.2, ease: "power3.out" },
                0.4 // Start op 0.4 seconden in de timeline, synchroon met de rest
            );

            // 8. Oneindige achtergrond animatie (Slow Pan)
            gsap.to(".bg-shape-1", {
                x: "-5%", // Beweeg langzaam naar links
                y: "2%",
                rotation: "+=2", // Draai heel subtiel
                duration: 20,
                repeat: -1,
                yoyo: true, // Speel animatie heen en terug
                ease: "sine.inOut"
            });

            gsap.to(".bg-shape-2", {
                x: "5%", // Beweeg langzaam naar rechts
                y: "-2%",
                rotation: "-=2", // Draai heel subtiel tegenovergesteld
                duration: 25, // Iets andere snelheid voor asymmetrisch effect
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative overflow-hidden bg-navy pt-32 pb-16 md:pt-40 md:pb-24 text-white min-h-[90vh] flex items-center">
            {/* Background geometric shapes */}
            <div className="absolute top-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                <div className="bg-shape-1 absolute -top-[10%] -right-[5%] w-[60%] h-[120%] bg-slate-800/20 rotate-12 origin-top-right transform -skew-x-12" />
                <div className="bg-shape-2 absolute top-[20%] right-[15%] w-[30%] h-[80%] bg-navy-light/40 -rotate-6 transform skew-x-6" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                {/* Headline Spans across the top */}
                <div className="mb-12 max-w-5xl">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-white flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap opacity-0 hero-title-line">Stop met klanten te verliezen</span>
                        <span className="opacity-0 hero-title-line">
                            door <span className="text-accent italic">verouderde</span>
                        </span>
                        <span className="opacity-0 hero-title-line">websites.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    {/* Left Content (Text, USPs, Buttons) - Spans 5 columns */}
                    <div className="flex flex-col gap-10 lg:col-span-5 pt-4">
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-md opacity-0 hero-subtitle">
                            Wij bouwen high-performance websites voor drukke ondernemers die meer leads nodig hebben, geen extra kopzorgen. Krijg een site die net zo hard werkt als jij.
                        </p>

                        {/* Divider Line */}
                        <div className="h-px w-3/4 bg-white/20 opacity-0 origin-left hero-divider" />

                        {/* USPs */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm md:text-[15px] font-bold text-slate-300">
                            <div className="flex items-center gap-2 opacity-0 hero-usp">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                                </div>
                                <span>Ontworpen door Experts</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 hero-usp">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                                </div>
                                <span>Gebouwd voor Snelheid</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 hero-usp">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                                </div>
                                <span>Gemaakt voor Resultaat</span>
                            </div>
                             <div className="flex items-center gap-2 opacity-0 hero-usp">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                                </div>
                                <span>Volledig Jouw Eigendom</span>
                            </div>
                        </div>

                        {/* Buttons (Always side-by-side using flex-row) */}
                        <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-2">
                            <a
                                href="#contact"
                                className="hero-btn opacity-0 flex-1 sm:flex-none inline-flex justify-center items-center rounded-xl bg-accent px-3 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-sm md:text-base font-black uppercase tracking-widest text-white shadow-[0_0_40px_-10px_rgba(255,125,41,0.5)] transition-all hover:bg-orange-600 hover:-translate-y-1 text-center"
                            >
                                Krijg een gratis audit
                            </a>
                            <a
                                href="#work"
                                className="hero-btn opacity-0 flex-1 sm:flex-none inline-flex justify-center items-center rounded-xl border-2 border-slate-700 bg-transparent px-3 sm:px-8 py-3.5 sm:py-4 text-[11px] sm:text-sm md:text-base font-bold text-white transition-all hover:border-slate-500 hover:bg-white/5 text-center whitespace-nowrap"
                            >
                                Bekijk ons werk
                            </a>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-2 opacity-0 hero-social">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-10 w-10 rounded-full border-2 border-navy bg-navy-light bg-cover bg-center shadow-lg"
                                        style={{ backgroundImage: `url('https://i.pravatar.cc/100?u=${i}')` }}
                                    />
                                ))}
                            </div>
                            <span className="font-medium text-xs sm:text-sm">Vertrouwd door 500+ lokale ondernemers</span>
                        </div>
                    </div>

                    {/* Right Visual (Lead Form) - Spans 7 columns */}
                    <div className="relative w-full max-w-xl mx-auto lg:max-w-none lg:col-span-7 lg:pl-10 opacity-0 hero-form-wrapper">
                        <HeroForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
