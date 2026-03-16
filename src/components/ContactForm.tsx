"use client";

import SignupForm from "./SignupForm";

export default function ContactForm() {
    return (
        <section id="contact" className="py-24 bg-navy text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-8 leading-tight">
                            Ontvang je <span className="text-accent italic">gratis</span> design<span className="text-accent">.</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium">
                           Maak een gratis account aan en ontvang een uniek design voor je homepage. Ons team maakt samen met AI een design dat is afgestemd op jouw bedrijf.
                        </p>

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                {/**/ /* (spacing/formatting fix if needed, but the original seems fine) */}
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Directe Toegang</p>
                                    <p className="text-xl font-extrabold tracking-tight">Geen creditcard nodig</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                    <span className="text-2xl">🚀</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Volledig overzicht</p>
                                    <p className="text-xl font-extrabold tracking-tight">Eigen dashboard voor je project</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <SignupForm 
                            variant="white" 
                            title="Start Gratis Account" 
                            subtitle="Krijg direct toegang tot het platform" 
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
