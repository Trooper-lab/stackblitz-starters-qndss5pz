export default function Stats() {
    const stats = [
        { value: "🔓 Adaptive", label: "Website", desc: "Nooit meer verouderd. Je site past zich wekelijks aan de markt aan, zonder extra kosten." },
        { value: "🚀 5 Dagen", label: "Levertijd", desc: "Van concept naar conversie in één werkweek. Jouw leadmachine live terwijl concurrenten nog briefen." },
        { value: "✨ AI First", label: "Geïntegreerd systeem", desc: "Website én sales-backend als één slim organisme. AI-native CRM dat meegroeit zonder extra licentiekosten." },
    ];

    return (
        <section className="relative z-20 px-6 -mt-10">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-3">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`p-10 text-center border-slate-100 
                                ${i === 0 ? 'border-t-0 md:border-l-0' : 'border-t md:border-t-0 md:border-l'}`}
                        >
                            <div className="font-display text-4xl sm:text-5xl font-extrabold text-accent mb-2">
                                {s.value}
                            </div>
                            <p className="font-bold text-lg text-navy mb-2">{s.label}</p>
                            <p className="text-sm text-slate-500 font-medium">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
