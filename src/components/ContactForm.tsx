"use client";

export default function ContactForm() {
    return (
        <section id="contact" className="py-24 bg-navy text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-8 leading-tight">
                            Vraag je gratis <span className="text-accent">groei-audit</span> aan.
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium">
                            We nemen een video van 5 minuten op waarin we je huidige site analyseren en laten je precies zien waar je geld verliest en hoe je dit kunt oplossen. Geheel vrijblijvend.
                        </p>

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                    <span className="text-2xl">✉️</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Direct Contact</p>
                                    <p className="text-xl font-extrabold tracking-tight">groei@aileadsite.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                    <span className="text-2xl">📞</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Bel het kantoor</p>
                                    <p className="text-xl font-extrabold tracking-tight">+1 (888) LEAD-GEN</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl shadow-2xl">
                        <form className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Jouw naam</label>
                                    <input type="text" placeholder="Voor- & achternaam" className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Zakelijke e-mail</label>
                                    <input type="email" placeholder="naam@bedrijf.com" className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-navy">Website URL</label>
                                <input type="url" placeholder="https://jouwwebsite.com" className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-navy">Maandelijks omzetdoel</label>
                                <select className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all">
                                    <option>Selecteer groeidoel...</option>
                                    <option>€5k - €10k meer/maand</option>
                                    <option>€10k - €50k meer/maand</option>
                                    <option>€50k+ meer/maand</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-accent text-white rounded-xl p-5 text-lg font-black uppercase tracking-wider cursor-pointer shadow-xl shadow-accent/30 hover:bg-orange-600 transition-all hover:translate-y-[-2px]">
                                Krijg mijn gratis auditvideo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
