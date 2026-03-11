"use client";
import { useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const features = [
    {
        emoji: "🧠",
        title: "Ontworpen door Experts",
        description: "Uw digitale aanwezigheid verdient meer dan een sjabloon. Onze senior marketeers en SEO-strategen leggen het fundament. Wij gebruiken AI niet om na te denken, maar om onze hoogwaardige strategieën met chirurgische precisie en snelheid tot leven te wekken. Geen AI auto-generated website, maar een 'wat als je een marketing expert ongeremd te werk kan laten gaan' ervaring.",
        subtitle: "Strategische Meesterschap"
    },
    {
        emoji: "⚡",
        title: "Gebouwd voor Snelheid",
        description: "In de moderne economie is traagheid fataal. Door onze 15+ jaar ervaring te combineren met AI technologie elimineren we de traditionele bottlenecks. We optimaliseren alles tot in de puntjes zonder hoge technische kosten of tijdverlies door trage communicatie met ontwikkelingsbureaus.",
        subtitle: "Technologische Voorsprong"
    },
    {
        emoji: "🎯",
        title: "Gemaakt voor Resultaat",
        description: "Data is de brandstof van groei. Onze systemen analyseren continu gebruikersgedrag en komen proactief met optimalisaties. Het is geen statisch visitekaartje, maar een dynamische leadmachine die zichzelf elke dag verbetert voor een maximale ROI.",
        subtitle: "Rendement Gedreven"
    }
];

export default function WhatIsAILeadSite() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (pathRef.current) {
                gsap.to(pathRef.current, {
                    attr: { d: "M0,100 Q720,0 1440,100 L1440,150 L0,150 Z" },
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "bottom bottom", // Start de animatie wanneer de onderkant van de sectie de onderkant van de viewport raakt
                        end: "bottom top",      // Eindig wanneer de onderkant van de sectie de bovenkant van de viewport raakt
                        scrub: true,
                    }
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="min-h-screen flex items-center py-20 px-6 lg:py-32 relative overflow-hidden bg-white" id="ai-definition">
            {/* Background Blob */}
            <div className="absolute top-0 left-0 w-1/3 h-full opacity-[0.03] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,72.4,41.4C63.3,53.7,50.8,63.7,37.1,70.9C23.4,78.1,8.4,82.4,-6.6,83.9C-21.7,85.3,-36.8,83.9,-49.9,76.5C-62.9,69.1,-73.9,55.7,-80.4,41C-86.9,26.3,-88.9,10.2,-86.6,-5.3C-84.3,-20.8,-77.7,-35.7,-67.7,-47.8C-57.7,-59.9,-44.3,-69.2,-30.5,-76.5C-16.8,-83.8,-2.7,-89.1,11,-88.2C24.7,-87.3,30.6,-83.6,44.7,-76.4Z" fill="var(--color-navy)" transform="translate(100 100)"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left Column */}
                    <div className="lg:sticky lg:top-32 flex flex-col gap-12">
                        <div>
                            <div className="w-20 h-1 bg-accent mb-8"></div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-navy font-display">
                                🤖 Wat is een <br />
                                <span className="text-accent italic">AI Lead Site</span> <br />
                                precies<span className="text-accent">?</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-600 max-w-xl leading-relaxed font-light italic border-l-4 border-accent/20 pl-6 mb-8">
                                "De perfecte symbiose tussen menselijke expertise en kunstmatige intelligentie,
                                geformuleerd als een strategisch instrument om uw bedrijfsgroei te accelereren."
                            </p>
                            <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
                                Wij geloven in de kracht van overtuiging. Daarom bieden we je een gratis, op maat gemaakt homepage design aan. Ervaar zelf de impact van onze aanpak, zonder verplichtingen.
                            </p>
                        </div>

                        {/* Custom SVG Graphic built to match brand */}
                        <div className="hidden lg:block relative w-full h-64 overflow-hidden rounded-2xl shadow-xl bg-navy border-t-2 border-accent/30 group">
                            <Image
                                src="/ai_abstract_graphic.svg"
                                alt="AI Network Abstraction"
                                fill
                                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            {/* Overlay voor de editorial feel */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-navy/40 to-transparent mix-blend-multiply"></div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-16 lg:pt-8 mb-24">
                        {features.map((feature) => (
                            <article key={feature.title} className="group border-l border-slate-200 pl-8 transition-all duration-300 hover:border-accent">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-4xl">{feature.emoji}</span>
                                    <h3 className="text-3xl font-bold tracking-tight text-navy font-display">{feature.title}</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">{feature.subtitle}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>

            {/* GSAP SVG Section Transition */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
                <svg
                    className="w-full h-16 md:h-24 lg:h-32 text-slate-50"
                    viewBox="0 0 1440 100"
                    preserveAspectRatio="none"
                >
                    <path
                        ref={pathRef}
                        fill="currentColor"
                        d="M0,100 Q720,100 1440,100 L1440,150 L0,150 Z"
                    />
                </svg>
            </div>
        </section>
    );
}