import Image from "next/image";

const testimonials = [
    {
        image: "/1.png",
        name: "Rob Disbergen",
        role: "Makelaar, Rob Disbergen",
        quote:
            '"AI Lead Site heeft een geweldige landingspagina voor ons gebouwd. We merken direct verschil in het aantal aanvragen dat via de site binnenkomt."',
    },
    {
        image: "/2.png",
        name: "Johan",
        role: "Eigenaar, Volopzon",
        quote:
            '"We begonnen met alleen advertising via een landingspagina, maar ze leverden zulk goed werk dat we uiteindelijk de hele website door hen hebben laten doen!"',
    },
    {
        image: "/3.png",
        name: "Tommy Vermeulen",
        role: "Oprichter, Check Mijn Huis",
        quote:
            '"Niet alleen hebben ze een superstrakke website gebouwd, maar ook een compleet custom CRM geïntegreerd én onze advertising opgepakt. Top service!"',
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
                        Hoor van echte ondernemers die stopten met &quot;gewoon een website hebben&quot; en begonnen met het genereren van inkomsten.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="bg-white p-10 rounded-2xl shadow-lg border-b-4 border-accent flex flex-col h-full"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-accent text-xl">⭐</span>
                                ))}
                            </div>
                            <p className="font-bold text-lg text-navy leading-relaxed mb-8 flex-grow">
                                {t.quote}
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm">
                                    <Image
                                        src={t.image}
                                        alt={`Profielfoto van ${t.name}`}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
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
