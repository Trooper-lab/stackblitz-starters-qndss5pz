"use client";

const stack = [
    { icon: "⚛️", name: "ReactJS" },
    { icon: "⚡", name: "Bolt.new" },
    { icon: "🗄️", name: "Supabase" },
    { icon: "🚀", name: "Antigravity" },
    { icon: "🧠", name: "Claude" },
    { icon: "✨", name: "Gemini" },
];

export default function TechStack() {
    return (
        <section className="py-16 bg-navy text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-[11px] font-black text-accent uppercase tracking-[0.3em] mb-12">
                    The Engine Behind Your Success
                </p>
                <div className="flex flex-wrap justify-center items-center gap-10 opacity-70">
                    {stack.map(({ icon, name }) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 grayscale transition-all duration-300 hover:grayscale-0 cursor-default"
                        >
                            <span className="text-3xl">{icon}</span>
                            <span className="font-extrabold text-lg">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
