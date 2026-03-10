"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const projects = [
    {
        title: "SolarEdge Tech",
        category: "🏭 Industrieel / B2B",
        result: "+185% Leads",
        metrics: "In 3 maanden na lancering",
        image: "/project_showcase_1.png",
        accent: "#FF6B00",
    },
    {
        title: "Nova Health",
        category: "🏥 Medisch / Gezondheid",
        result: "€2.4M Omzet",
        metrics: "Gevolgd via nieuw boekingssysteem",
        image: "/project_showcase_2.png",
        accent: "#0ea5e9",
    },
    {
        title: "Apex Logistics",
        category: "🚚 Logistiek",
        result: "42% Sneller",
        metrics: "Toename conversieratio gebruikers",
        image: "/project_showcase_3.png",
        accent: "#10b981",
    },
    {
        title: "CloudSync Pro",
        category: "💻 SaaS / Tech",
        result: "+240% Snelheid",
        metrics: "Boost in systeemprestaties",
        image: "/project_showcase_4.png",
        accent: "#8b5cf6",
    },
    {
        title: "StadsLekkers",
        category: "🍔 Eten / Bezorging",
        result: "15k+ Bestellingen",
        metrics: "Maandelijks actief volume",
        image: "/project_showcase_5.png",
        accent: "#f43f5e",
    },
    {
        title: "Veilige Kluis",
        category: "🔒 Fintech / Beveiliging",
        result: "Bankniveau",
        metrics: "Nul-inbraak encryptie",
        image: "/project_showcase_6.png",
        accent: "#64748b",
    },
];

export default function WorkShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const marquee = marqueeRef.current;
            if (!marquee) return;

            // Simple infinite marquee effect
            // We use two sets of project cards to ensure seamless loop
            const totalWidth = marquee.scrollWidth / 2;

            timeline.current = gsap.timeline({
                repeat: -1,
                defaults: { ease: "none" }
            })
                .to(marquee, {
                    x: -totalWidth,
                    duration: 40,
                    onReverseComplete: () => {
                        gsap.set(marquee, { x: 0 });
                    }
                });

            // Re-sync position to handle container width correctly
            gsap.set(marquee, { x: 0 });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleMouseEnter = () => timeline.current?.pause();
    const handleMouseLeave = () => timeline.current?.play();

    // Double the items for seamless loop
    const displayProjects = [...projects, ...projects];

    return (
        <section id="work" ref={containerRef} className="py-24 bg-navy text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.1] mb-6">
                    <span className="text-accent">Echt</span> Werk<span className="text-accent">.</span> Buitengewone Resultaten<span className="text-accent">.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                        Ontdek onze nieuwste high-performance builds. Beweeg de muis erover om te pauzeren en de resultaten te bekijken.
                    </p>
                </div>
            </div>

            <div
                className="relative flex cursor-grab active:cursor-grabbing"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    ref={marqueeRef}
                    className="flex gap-8 px-4"
                    style={{ width: "fit-content" }}
                >
                    {displayProjects.map((project, idx) => (
                        <div
                            key={`${project.title}-${idx}`}
                            className="w-[350px] md:w-[450px] flex-shrink-0 group relative rounded-[24px] overflow-hidden bg-[#112240] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
                        >
                            <div className="relative h-[300px] md:h-[350px] overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] to-transparent opacity-80" />

                                <div
                                    className="absolute top-6 right-6 px-4 py-2 rounded-full text-[10px] md:text-[12px] font-extrabold uppercase tracking-wider text-white"
                                    style={{ backgroundColor: project.accent }}
                                >
                                    {project.category}
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                <div className="mb-6">
                                    <h3 className="font-display text-xl md:text-2xl font-extrabold mb-2 text-white">
                                        {project.title}
                                    </h3>
                                    <div className="h-0.5 w-10" style={{ backgroundColor: project.accent }} />
                                </div>

                                <div className="mt-auto">
                                    <div
                                        className="text-4xl md:text-5xl font-black font-display leading-none"
                                        style={{ color: project.accent }}
                                    >
                                        {project.result}
                                    </div>
                                    <div className="text-sm md:text-base text-slate-400 font-semibold mt-1">
                                        {project.metrics}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
