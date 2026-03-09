"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const steps = [
    {
        num: "00",
        title: "🔍 Het Voorwerk",
        desc: "We brengen je bedrijf in kaart. Wat zijn de kernwaarden, wie is de doelgroep en wat is de visie?",
    },
    {
        num: "01",
        title: "🎨 Drie Ontwerpen",
        desc: "We maken 3 unieke ontwerpen. Jij kiest vervolgens de stijl die het allerbeste aansluit bij jou.",
    },
    {
        num: "02",
        title: "🛠️ Live Ontwikkeling",
        desc: "We bouwen de website op een afgeschermde testlocatie zodat jij de ontwikkeling 'live' kunt bijhouden.",
    },
    {
        num: "03",
        title: "🔄 Iteraties",
        desc: "Klopt de inhoud? We sturen bij waar nodig, finetunen de details en optimaliseren de funnel.",
    },
    {
        num: "04",
        title: "🚀 Publiceren",
        desc: "We lanceren de website, stellen de SEO in en verzorgen nette doorverwijzingen (redirects) vanaf de oude website etc.",
    },
];

export default function Process() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animeer elke stap naar binnen wanneer je erheen scrolt
            gsap.utils.toArray(".process-step").forEach((step: any, i) => {
                const isEven = i % 2 === 0;
                gsap.fromTo(
                    step,
                    { 
                        opacity: 0, 
                        y: 50, 
                        x: isEven ? -30 : 30, // Schuif in vanaf de zijkanten
                        filter: "blur(10px)" 
                    },
                    {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        filter: "blur(0px)",
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: step,
                            start: "top 80%", // Start animatie wanneer de bovenkant van het element op 80% van het scherm is
                            toggleActions: "play none none reverse" // Speelt af omlaag, draait terug omhoog
                        },
                    }
                );
            });

            // Animeer de connectielijn tussen de stappen
            gsap.fromTo(
                ".process-line",
                { height: 0 },
                {
                    height: "100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".process-line-container",
                        start: "top center",
                        end: "bottom center",
                        scrub: 1, // Koppel aan scrollpositie (vloeiend met 1s vertraging)
                    }
                }
            );

            // Animeer de bolletjes in de tijdlijn
            gsap.utils.toArray(".process-dot").forEach((dot: any) => {
                gsap.fromTo(dot,
                    { scale: 0, backgroundColor: "#e2e8f0" },
                    {
                        scale: 1,
                        backgroundColor: "#FF7D29", // Accent kleur
                        duration: 0.5,
                        ease: "back.out(2)",
                        scrollTrigger: {
                            trigger: dot,
                            start: "top center",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="py-24 bg-white relative overflow-hidden" id="werkwijze">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Header Sectie */}
                <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-navy mb-6 leading-tight">
                        🗺️ Onze <span className="text-accent">Werkwijze</span>
                    </h2>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
                        Geen eindeloze vergaderingen of onduidelijke trajecten. Een strak en transparant stappenplan van visie tot lancering.
                    </p>
                    
                    {/* Gemiddelde Tijd Badge */}
                    <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 shadow-md px-8 py-4 rounded-full hover:border-accent/50 transition-colors">
                        <div className="bg-accent/10 p-2 rounded-full">
                            <Clock className="text-accent w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-navy uppercase tracking-widest text-sm md:text-base">
                            Gemiddelde tijd is 5 dagen
                        </span>
                    </div>
                </div>

                {/* Tijdlijn Sectie */}
                <div className="relative max-w-5xl mx-auto process-line-container pb-12">
                    
                    {/* De centrale lijn (Grijze basislijn) */}
                    <div className="absolute left-[38px] md:left-1/2 top-4 bottom-0 w-1 bg-slate-100 -translate-x-1/2 rounded-full" />
                    
                    {/* De geanimeerde Oranje (Accent) Lijn die groeit bij het scrollen */}
                    <div className="absolute left-[38px] md:left-1/2 top-4 w-1 bg-gradient-to-b from-accent to-orange-400 -translate-x-1/2 rounded-full process-line z-0" style={{ height: '0%' }} />

                    {/* De stappen */}
                    <div className="space-y-16 relative z-10">
                        {steps.map((step, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <div key={step.num} className="process-step relative flex flex-col md:flex-row items-start md:items-center w-full">
                                    
                                    {/* Desktop: Linker of Rechter Kant positionering */}
                                    <div className={`md:w-1/2 w-full pl-20 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:order-2 md:pl-16"}`}>
                                        
                                        {/* De Inhoud Kaart */}
                                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-accent/30 hover:shadow-[0_20px_60px_-15px_rgba(255,125,41,0.15)] transition-all duration-300 group relative overflow-hidden">
                                            
                                            {/* Groot achtergrond getal */}
                                            <div className={`absolute top-4 ${isEven ? "right-6" : "left-6"} text-7xl font-display font-black text-slate-50 group-hover:text-accent/5 transition-colors select-none pointer-events-none`}>
                                                {step.num}
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-2xl md:text-3xl font-bold text-navy mb-4 font-display">
                                                    {step.title}
                                                </h3>
                                                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Het Bolletje op de tijdlijn */}
                                    <div className="absolute left-[38px] md:left-1/2 w-10 h-10 bg-white border-4 border-slate-200 rounded-full -translate-x-1/2 flex items-center justify-center shadow-lg z-20 md:top-1/2 md:-translate-y-1/2 top-10 md:mt-0 process-dot transition-colors duration-300">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                    </div>

                                    {/* Spacing Div voor de andere kant op Desktop */}
                                    <div className={`hidden md:block md:w-1/2 ${isEven ? "md:order-2" : ""}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
