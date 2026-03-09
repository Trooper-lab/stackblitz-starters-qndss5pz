"use client";

export default function CTA() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-5xl mx-auto px-6">
                <div className="relative rounded-[3rem] bg-navy py-20 px-12 text-center text-white overflow-hidden shadow-2xl">
                    {/* Radial gradient overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent to-transparent" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold mb-8 tracking-tighter leading-tight">
                            Ready to Win Your <span className="text-accent italic">Market</span>?
                        </h2>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            Stop letting competitors steal your traffic. Build a high-performance website that converts visitors into profit today.
                        </p>
                        <button className="bg-white text-navy px-12 py-5 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all duration-300 shadow-xl">
                            Start Your Project
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
