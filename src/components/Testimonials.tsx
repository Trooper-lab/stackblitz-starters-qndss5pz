const testimonials = [
    {
        initials: "JD",
        name: "Jim Davidson",
        role: "Owner, Davidson HVAC",
        quote:
            '"My old site was just a business card. AIleadsite turned it into a 24/7 salesperson. Our phone hasn\'t stopped ringing."',
    },
    {
        initials: "SR",
        name: "Sarah Russo",
        role: "Founder, Bloom & Vine",
        quote:
            '"They promised a site in 48 hours and delivered. The speed and professionalism is unmatched in this industry."',
    },
    {
        initials: "MK",
        name: "Mark Knight",
        role: "Director, Zenith Auto",
        quote:
            '"Finally, a tech company that speaks \'business\'. No confusing jargon, just clear ROI and a massive boost in leads."',
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy uppercase tracking-tight mb-4">
                        Voices of <span className="text-accent">Growth</span>
                    </h2>
                    <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        Hear from real owners who stopped &ldquo;just having a website&rdquo; and started generating revenue.
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
                                    <span key={i} className="text-accent text-xl">★</span>
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
