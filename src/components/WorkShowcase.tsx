"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const projects = [
    {
        title: "Check Mijn Huis",
        category: "🛠 Maatwerk",
        result: "7 Dagen",
        metrics: "Custom CRM, 60 SEO pagina's, Linkbuilding",
        accent: "#0ea5e9",
        url: "https://checkmijnhuis.nl",
    },
    {
        title: "Hashstrat",
        category: "🛠 Maatwerk",
        result: "3 Dagen",
        metrics: "Custom CRM, Logo & Branding",
        accent: "#8b5cf6",
        url: "https://hashstrat.io",
    },
    {
        title: "Volopzon",
        category: "🎯 Landingpagina",
        result: "1 Dag",
        metrics: "GoHighLevel Lead Funnel",
        accent: "#FF6B00",
        url: "https://volopzon-nl.adpagina.nl",
    },
    {
        title: "Energie Plus",
        category: "🎯 Landingpagina",
        result: "2 Dagen",
        metrics: "GoHighLevel Lead Funnel",
        accent: "#10b981",
        url: "https://uwenergieplus.adpagina.nl",
    },
    {
        title: "Vonk Schilders",
        category: "🎯 Landingpagina",
        result: "2 Dagen",
        metrics: "GoHighLevel Lead Funnel",
        accent: "#f43f5e",
        url: "https://vonkschilders.adpagina.nl",
    },
    {
        title: "RM Totaal",
        category: "🌐 Website",
        result: "4 Dagen",
        metrics: "4 Custom Layouts",
        accent: "#3b82f6",
        url: "https://rmtotaal.nl",
    },
    {
        title: "Woontotaalservice",
        category: "🌐 Website",
        result: "5 Dagen",
        metrics: "Planning & CRM integratie",
        accent: "#64748b",
        url: "https://woontotaalservice.nl",
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
                    duration: 50,
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
                        <span className="text-accent">Echte</span> Projecten<span className="text-accent">.</span> Snelle Oplevering<span className="text-accent">.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                        Ontdek onze recente projecten. Beweeg de muis erover om te pauzeren en de details te bekijken.
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
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={`${project.title}-${idx}`}
                            className="w-[350px] md:w-[450px] flex-shrink-0 group relative rounded-[24px] overflow-hidden bg-[#112240] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] block"
                        >
                            <div className="relative h-[300px] md:h-[350px] overflow-hidden bg-slate-900 flex justify-center items-center">
                                <Image
                                    src={`https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url`}
                                    alt={`Screenshot van ${project.title}`}
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                    fill
                                    unoptimized
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500 z-10" />

                                <div
                                    className="absolute top-6 right-6 px-4 py-2 rounded-full text-[10px] md:text-[12px] font-extrabold uppercase tracking-wider text-white z-20"
                                    style={{ backgroundColor: project.accent }}
                                >
                                    {project.category}
                                </div>
                            </div>

                            <div className="p-8 md:p-10 relative z-20">
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
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
