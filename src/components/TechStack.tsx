"use client";

const stack = [
    { icon: "🧠", name: "AI Strategie" },
    { icon: "🤖", name: "AI Assistent" },
    { icon: "🎯", name: "Conversie Optimalisatie" },
    { icon: "📈", name: "Data Gedreven Resultaat" },
    { icon: "⚡", name: "Supersnelle Hosting" },
];

export default function TechStack() {
    return (
        <section className="py-16 bg-navy text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-[11px] font-black text-accent uppercase tracking-[0.3em] mb-12">
                    ⚙️ De Motor Achter Jouw Succes
                </p>
                <div className="flex flex-wrap justify-center items-center gap-10 opacity-70">
                    {stack.map(({ icon, name }) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 transition-all duration-300 hover:scale-110 hover:opacity-100 cursor-default"
                        >
                            <span className="text-3xl drop-shadow-lg">{icon}</span>
                            <span className="font-extrabold text-lg">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
