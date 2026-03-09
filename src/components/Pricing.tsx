"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const tiers = [
    {
        name: "Growth Starter",
        desc: "Perfect for small local businesses",
        price: "$1,500",
        priceLabel: "flat fee",
        featured: false,
        features: [
            "High-Conversion Landing Page",
            "Local SEO Foundation",
            "Fast Mobile Loading",
            "Google Business Sync",
        ],
        cta: "Claim This Plan",
    },
    {
        name: "Market Leader",
        desc: "Dominate your local competition",
        price: "$3,500",
        priceLabel: "flat fee",
        featured: true,
        features: [
            "Up to 10 SEO-Optimized Pages",
            "AI-Powered Lead Capture Chat",
            "Full Conversion Funnel Setup",
            "Competitor Rank Analysis",
        ],
        cta: "Start Growing Now",
    },
    {
        name: "Custom Power",
        desc: "For high-volume established firms",
        price: "$7K+",
        priceLabel: "custom",
        featured: false,
        features: [
            "Unlimited Page Architecture",
            "Advanced CRM Integrations",
            "Professional Video Integration",
            "Dedicated Growth Strategist",
        ],
        cta: "Speak to a Pro",
    },
];

const monthly = [
    {
        name: "Basic Maintenance",
        desc: "For teams that need site upkeep",
        price: "$90",
        priceLabel: "/mo",
        featured: false,
        features: ["Hosting & SSL", "Weekly Backups", "Uptime Monitoring", "Security Patches"],
        cta: "Get Basic",
    },
    {
        name: "AI Evolution",
        desc: "Unlimited changes via AI",
        price: "$150",
        priceLabel: "/mo",
        featured: true,
        features: ["Everything in Basic", "Unlimited AI Changes", "Design Refreshes", "Priority Support"],
        cta: "Start Evolving",
    },
    {
        name: "Growth Engine",
        desc: "SEO & visibility domination",
        price: "$400",
        priceLabel: "/mo",
        featured: false,
        features: ["Everything in AI Plan", "Monthly SEO Reports", "Content Strategy", "Advanced Analytics"],
        cta: "Dominate Now",
    },
];

export default function Pricing() {
    const [mode, setMode] = useState<"project" | "monthly">("project");
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const data = mode === "project" ? tiers : monthly;

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gridRef.current?.children;
            if (!cards || cards.length < 3) return;

            // Media query for desktop animations
            const mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                const cardLeft = cards[0];
                const cardMiddle = cards[1];
                const cardRight = cards[2];

                gsap.set(cardLeft, { x: "100%", opacity: 0, zIndex: 1 });
                gsap.set(cardRight, { x: "-100%", opacity: 0, zIndex: 1 });
                gsap.set(cardMiddle, { zIndex: 10, scale: 1.05, opacity: 1 });

                gsap.to([cardLeft, cardRight], {
                    x: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [mode]);

    return (
        <section id="pricing" ref={containerRef} className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-navy mb-4 leading-tight">
                            Investment Options Built For{" "}
                            <span className="text-accent">Scale</span>.
                        </h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                            No fluff, no technical jargon. Just clear pricing for business owners who want to win online.
                        </p>
                    </div>

                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {(["project", "monthly"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === m
                                    ? "bg-white text-navy shadow-sm"
                                    : "bg-transparent text-slate-500 hover:text-navy"
                                    }`}
                            >
                                {m === "project" ? "One-Time Projects" : "Monthly Partners"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center" ref={gridRef}>
                    {data.map((tier) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col p-10 rounded-2xl transition-all duration-300 relative
                                ${tier.featured
                                    ? "border-4 border-accent bg-white shadow-2xl scale-105 z-10"
                                    : "border-2 border-slate-100 bg-slate-50/50 z-1 hover:border-accent hover:bg-white hover:-translate-y-2 md:hover:scale-100 md:scale-100 scale-100"
                                }`}
                        >
                            {tier.featured && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                                    Our Best Value
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="font-display text-2xl font-extrabold mb-2 text-navy">
                                    {tier.name}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium mb-6">{tier.desc}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`font-display text-4xl sm:text-5xl font-black ${tier.featured ? "text-accent" : "text-navy"}`}>
                                        {tier.price}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400 uppercase">
                                        {tier.priceLabel}
                                    </span>
                                </div>
                            </div>

                            <ul className="grow space-y-5 mb-10 list-none p-0">
                                {tier.features.map((f: string) => (
                                    <li
                                        key={f}
                                        className={`flex items-start gap-4 font-semibold ${tier.featured ? "text-navy" : "text-slate-600"}`}
                                    >
                                        <span className="text-accent text-xl leading-none shrink-0 font-bold">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#contact"
                                className={`block w-full py-4 rounded-xl text-center font-black text-sm uppercase tracking-wider transition-all duration-200
                                    ${tier.featured
                                        ? "bg-accent text-white shadow-xl hover:bg-orange-600"
                                        : "border-2 border-navy text-navy hover:bg-navy hover:text-white"
                                    }`}
                            >
                                {tier.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
