const testimonials = [
    {
        initials: "JD",
        name: "Jim de Vries",
        role: "🔧 Eigenaar, de Vries HVAC",
        quote:
            '"Mijn oude site was slechts een visitekaartje. AIleadsite veranderde het in een 24/7 verkoper. Onze telefoon is niet gestopt met rinkelen."',
    },
    {
        initials: "SR",
        name: "Sarah de Ruiter",
        role: "💐 Oprichter, Bloom & Vine",
        quote:
            '"Ze beloofden een site in 48 uur en hebben geleverd. De snelheid en professionaliteit is ongeëvenaard in deze branche."',
    },
    {
        initials: "MK",
        name: "Mark de Ridder",
        role: "🚗 Directeur, Zenith Auto",
        quote:
            '"Eindelijk een techbedrijf dat \'zaken\' spreekt. Geen verwarrend jargon, gewoon duidelijke ROI en een enorme toename in leads."',
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy uppercase tracking-tight mb-4">
                        📣 Stemmen van Groei<span className="text-accent">.</span>
                    </h2>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        Hoor van echte ondernemers die stopten met "gewoon een website hebben" en begonnen met het genereren van inkomsten.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="bg-white p-10 rounded-2xl shadow-lg border-b-4 border-accent"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-accent text-xl">⭐</span>
                                ))}
                            </div>
                            <p className="font-bold text-lg text-navy leading-relaxed mb-8">
                                {t.quote}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-black text-sm shrink-0">
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="font-extrabold text-navy mb-1">{t.name}</p>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                        {t.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
