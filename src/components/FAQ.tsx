"use client";

import { useState } from "react";

const faqs = [
    {
        q: "📈 Hoe lang duurt het voordat ik meer leads zie?",
        a: "Onze sites zijn vanaf dag één gebouwd voor conversie. Hoewel het 30-90 dagen duurt voordat SEO volledig is opgestart, zien veel klanten een verhoogde leadstroom binnen de eerste 14 dagen na de lancering dankzij betere siteprestaties en een professioneel ontwerp.",
    },
    {
        q: "⏳ Gaat dit al mijn tijd in beslag nemen?",
        a: "Nee. We hebben dit proces gebouwd voor drukke mensen. We hebben slechts twee gesprekken van 30 minuten nodig: één om te beginnen en één om de sleutels te overhandigen. Wij doen al het zware werk tussendoor.",
    },
    {
        q: "🚀 Wat gebeurt er nadat de site is gelanceerd?",
        a: "Jij bent de eigenaar. 100%. We bieden optionele maandelijkse groeiplannen om hosting en doorlopende SEO af te handelen, maar je zit nooit vast aan je websiteprovider.",
    },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-navy mb-3">
                        🤔 U vraagt, wij antwoorden
                    </h2>
                    <p className="text-slate-500 font-medium">Duidelijke antwoorden voor drukke ondernemers.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="flex items-center justify-between w-full p-6 text-left font-bold text-navy text-lg hover:bg-slate-100 transition-colors"
                            >
                                <span>{faq.q}</span>
                                <span
                                    className={`text-2xl font-black text-accent transition-transform duration-200 shrink-0 ml-4 leading-none
                                        ${open === i ? "rotate-45" : "rotate-0"}
                                    `}
                                >
                                    +
                                </span>
                            </button>
                            {open === i && (
                                <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
