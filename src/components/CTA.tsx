"use client";

export default function CTA() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="relative rounded-[3rem] bg-navy py-20 px-12 text-center text-white overflow-hidden shadow-2xl">
                    {/* Radial gradient overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent to-transparent" />

                    <div className="relative z-10">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-accent mb-6">
                            De laatste website-migratie die je ooit zult doen.
                        </p>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold mb-8 tracking-tighter leading-tight">
                            Start je <span className="text-accent italic">AI-Transformatie</span> vandaag<span className="text-accent">.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-4 font-medium leading-relaxed">
                            Stop met investeren in websites die verouderen. Wij bouwen een intelligent systeem dat wekelijks met je meegroeit, leads genereert en zichzelf optimaliseert.
                        </p>
                        <p className="text-sm text-slate-400 max-w-lg mx-auto mb-12">
                            Eenmalige setup. Vaste maandelijkse investering. Geen uurtje-factuurtje. Geen verrassingen.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href="#contact" className="bg-accent text-white px-12 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 shadow-xl">
                                Bekijk je nieuwe Business OS
                            </a>
                            <a href="#pricing" className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all duration-300">
                                Bekijk de prijzen →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
