"use client";

import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { Check, Star } from "lucide-react";
import HeroForm from "./HeroForm";
import gsap from "gsap";

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);
    const titleContainerRef = useRef<HTMLDivElement>(null);
    const [titleFontSize, setTitleFontSize] = useState("10vw");

    useEffect(() => {
        const calculateFontSize = () => {
            if (!titleContainerRef.current) return;
            const containerWidth = titleContainerRef.current.clientWidth;
            const newFontSize = (containerWidth / 15.5);
            const clampedSize = Math.max(26, Math.min(newFontSize, 110));
            setTitleFontSize(`${clampedSize}px`);
        };
        calculateFontSize();
        window.addEventListener("resize", calculateFontSize);
        return () => window.removeEventListener("resize", calculateFontSize);
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.1 });

            tl.fromTo(
                ".hero-title-line",
                { opacity: 0, filter: "blur(20px)", y: 30, x: -20 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
            )
            .fromTo(
                ".hero-subtitle",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, ease: "power3.out" },
                "-=0.7"
            )
            .fromTo(
                ".hero-divider",
                { opacity: 0, scaleX: 0, transformOrigin: "left center" },
                { opacity: 1, scaleX: 1, duration: 0.8, ease: "power3.out" },
                "-=0.6"
            )
            .fromTo(
                ".hero-usp",
                { opacity: 0, filter: "blur(10px)", y: 20, x: -10 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
                "-=0.6"
            )
            .fromTo(
                ".hero-social",
                { opacity: 0, filter: "blur(5px)", y: 10, x: -5 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 0.6, ease: "power3.out" },
                "-=0.5"
            );

            tl.fromTo(
                ".hero-form-wrapper",
                { opacity: 0, filter: "blur(30px)", y: 50, x: 30 },
                { opacity: 1, filter: "blur(0px)", y: 0, x: 0, duration: 1.2, ease: "power3.out" },
                0.4
            );

            gsap.to(".bg-shape-1", {
                x: "-5%",
                y: "2%",
                rotation: "+=2",
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(".bg-shape-2", {
                x: "5%",
                y: "-2%",
                rotation: "-=2",
                duration: 25,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative overflow-hidden bg-navy pt-32 pb-16 md:pt-40 md:pb-24 text-white min-h-[90vh] flex items-center w-full">
            <div className="absolute top-0 right-0 h-full w-full pointer-events-none overflow-hidden">
                <div className="bg-shape-1 absolute -top-[10%] -right-[5%] w-[60%] h-[120%] bg-slate-800/20 rotate-12 origin-top-right transform -skew-x-12" />
                <div className="bg-shape-2 absolute top-[20%] right-[15%] w-[30%] h-[80%] bg-navy-light/40 -rotate-6 transform skew-x-6" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="mb-12 w-full" ref={titleContainerRef}>
                    <h1
                        className="font-display font-extrabold leading-[1.05] tracking-tight text-white flex flex-col items-start gap-1 w-full"
                        style={{ fontSize: titleFontSize, transition: "font-size 0.1s ease-out" }}
                    >
                        <span className="opacity-0 hero-title-line pr-4 leading-tight">Van statisch naar slim.</span>
                        <span className="opacity-0 hero-title-line pr-4 leading-tight">
                            <span className="text-accent italic">Jouw AI-Leadmachine </span>in 5 dagen<span className="text-accent">.</span>
                        </span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    <div className="flex flex-col gap-10 lg:col-span-5 pt-4">
                        <div className="flex flex-col gap-6">
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-md opacity-0 hero-subtitle">
                                Stop met investeren in statische websites. Wij bouwen een intelligent systeem dat wekelijks met je meegroeit, leads genereert en zichzelf optimaliseert via AI.
                            </p>

                            <div className="flex items-center gap-4 text-sm text-slate-400 opacity-0 hero-social">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-10 rounded-full border-2 border-navy bg-navy-light bg-cover bg-center shadow-lg"
                                            style={{ backgroundImage: `url('/${i}.png')` }}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1 text-accent">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} size={14} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="font-medium text-xs sm:text-sm mt-0.5 text-white">Bewezen resultaat (4.9/5)</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px w-3/4 bg-white/20 opacity-0 origin-left hero-divider" />

                        <div className="grid grid-cols-1 gap-y-5 text-sm md:text-[16px] font-bold text-slate-100">
                            <div className="flex items-center gap-3 opacity-0 hero-usp">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-4 w-4 text-accent" strokeWidth={3} />
                                </div>
                                <span>De laatste website-migratie die je ooit zult doen</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 hero-usp">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-4 w-4 text-accent" strokeWidth={3} />
                                </div>
                                <span>Aanpassingen in de flow, geen uurtje-factuurtje</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 hero-usp">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 shrink-0">
                                    <Check className="h-4 w-4 text-accent" strokeWidth={3} />
                                </div>
                                <span>AI-native CRM dat meegroeit zonder extra licentiekosten</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full max-w-xl mx-auto lg:max-w-none lg:col-span-7 lg:pl-10 opacity-0 hero-form-wrapper">
                        <HeroForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
