"use client";

import { RefreshCw, Clock, Brain } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "🔄 Adaptive Design",
        description: "Nooit meer verouderd. Je site past zich wekelijks aan de markt aan — zonder extra kosten of wachttijden.",
        icon: <RefreshCw className="w-10 h-10 text-purple-400" />,
        gradient: "from-purple-500/10 to-transparent",
    },
    {
        title: "⚡ 5 Dagen Levertijd",
        description: "Van concept naar conversie in één werkweek. Jouw leadmachine staat live terwijl concurrenten nog briefen.",
        icon: <Clock className="w-10 h-10 text-blue-400" />,
        gradient: "from-blue-500/10 to-transparent",
    },
    {
        title: "🧠 AI Business OS",
        description: "Geïntegreerd AI-native CRM. Je website en sales-backend zijn één slim organisme dat meegroeit zonder extra licentiekosten.",
        icon: <Brain className="w-10 h-10 text-emerald-400" />,
        gradient: "from-emerald-500/10 to-transparent",
    },
];

export default function Features() {
    return (
        <section id="services" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">🎯 Waarom het AI Business OS anders is</h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Geen statische website. Geen uurtje-factuurtje. Eén intelligent systeem dat met je meebeweegt, leads genereert en zichzelf continu optimaliseert.
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
