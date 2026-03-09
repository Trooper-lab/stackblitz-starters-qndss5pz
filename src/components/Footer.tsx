"use client";

export default function Footer() {
    return (
        <footer className="bg-navy border-t border-navy-light py-20 text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-3xl">🚀</span>
                            <span className="text-2xl font-black font-display uppercase tracking-tighter">AIleadsite</span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                            Direct-response webdesign voor de ambitieuze MKB-eigenaar. Gebouwd voor ROI, ontworpen voor snelheid.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Bedrijf</h4>
                        <ul className="flex flex-col gap-4">
                            {["Over Ons Proces", "Groeipartners", "ROI-casestudy's"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Groeiplannen</h4>
                        <ul className="flex flex-col gap-4">
                            {["Essentiële Lancering", "Marktdominator", "Zakelijk Maatwerk"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Juridisch</h4>
                        <ul className="flex flex-col gap-4">
                            {["Privacyvoorwaarden", "Serviceovereenkomst", "Leadgarantie"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-navy-light text-center">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        © 2026 AIleadsite.com. Ontworpen voor groei.
                    </p>
                </div>
            </div>
        </footer>
    );
}
