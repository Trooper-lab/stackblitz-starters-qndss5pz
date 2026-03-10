"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function AboutHero() {
    const containerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.1 });

            // 1. Titel (diagonaal + unblur)
            tl.fromTo(
                ".about-title-line",
                { opacity: 0, filter: "blur(20px)", y: 30, x: -20 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
            )
            // 2. Paragraaf tekst
            .fromTo(
                ".about-subtitle",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, ease: "power3.out" },
                "-=0.7"
            );

            // Oneindige achtergrond animatie (Slow Pan)
            gsap.to(".about-bg-shape-1", {
                x: "-5%", // Beweeg langzaam naar links
                y: "2%",
                rotation: "+=2", // Draai heel subtiel
                duration: 20,
                repeat: -1,
                yoyo: true, // Speel animatie heen en terug
                ease: "sine.inOut"
            });

            gsap.to(".about-bg-shape-2", {
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
        <section ref={containerRef} className="relative overflow-hidden bg-navy pb-16 md:pb-24 text-white min-h-[50vh] flex items-center">
            {/* Background geometric shapes */}
            <div className="absolute top-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                <div className="about-bg-shape-1 absolute -top-[10%] -right-[5%] w-[60%] h-[120%] bg-slate-800/20 rotate-12 origin-top-right transform -skew-x-12" />
                <div className="about-bg-shape-2 absolute top-[20%] right-[15%] w-[30%] h-[80%] bg-navy-light/40 -rotate-6 transform skew-x-6" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-extrabold leading-[1.05] tracking-tight text-white flex flex-col items-center gap-1 mb-6">
                        <span className="opacity-0 about-title-line">Nederlandse Wortels,</span>
                        <span className="opacity-0 about-title-line text-accent italic">Globale Mindset.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed opacity-0 about-subtitle max-w-2xl mx-auto">
                        Wij zijn geen log bureau waar je de zoveelste klant bent. We zijn een wendbaar team van specialisten, gedreven door snelheid en resultaat. Iedereen excelleert in zijn eigen vakgebied, met één gezamenlijk doel: jouw online aanwezigheid laten groeien.
                    </p>
                </div>
            </div>
        </section>
    );
}
