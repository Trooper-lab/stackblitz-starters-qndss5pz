"use client";

import { useState } from "react";

const faqs = [
    {
        q: "How long until I see more leads?",
        a: "Our sites are built for conversion from day one. While SEO takes 30–90 days to fully ramp up, many clients see increased lead flow within the first 14 days of launch due to better site performance and professional design.",
    },
    {
        q: "Is this going to take up all my time?",
        a: "No. We built this process for busy people. We only need two 30-minute calls: one to start and one to hand over the keys. We handle all the heavy lifting in between.",
    },
    {
        q: "What happens after the site is launched?",
        a: "You own it. 100%. We offer optional monthly growth plans to handle hosting and ongoing SEO, but you are never locked in or held hostage by your website provider.",
    },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-extrabold text-navy mb-3">
                        You Ask, We Answer
                    </h2>
                    <p className="text-slate-500 font-medium">Clear answers for busy entrepreneurs.</p>
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
