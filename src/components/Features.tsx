"use client";

import { Clock, Rocket, Banknote } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "⚡ Levering in 5 dagen",
        description: "Volledig complete, op maat ontworpen websites geleverd in slechts 5 werkdagen. Geen excuses.",
        icon: <span className="text-4xl">⏱️</span>,
        gradient: "from-purple-500/10 to-transparent",
    },
    {
        title: "🏆 Kwaliteit van een bureau",
        description: "Hoogwaardig ontwerp en prestaties die wedijveren met 's werelds beste digitale bureaus.",
        icon: <span className="text-4xl">🏢</span>,
        gradient: "from-blue-500/10 to-transparent",
    },
    {
        title: "💰 Betaalbare prijs",
        description: "Eersteklas resultaten zonder de premium bureaukosten. Transparante prijzen voor elke schaal.",
        icon: <span className="text-4xl">💎</span>,
        gradient: "from-emerald-500/10 to-transparent",
    },
];

export default function Features() {
    return (
        <section id="services" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">🎯 Onze kernfocus</h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        We hebben het traditionele bureaumodel gedestilleerd in drie essentiële pijlers om u in recordtijd de beste resultaten te geven.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`glass p-10 rounded-[40px] relative overflow-hidden group hover:border-white/20 transition-all`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
