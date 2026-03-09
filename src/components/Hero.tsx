"use client";

import HeroForm from "./HeroForm";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-navy py-16 md:py-24 text-white">
            {/* Background accent skew remains */}
            <div className="absolute top-0 right-0 h-full w-full md:w-1/2 bg-primary/5 translate-x-12 md:translate-x-32 skew-x-12 pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="flex flex-col gap-8 text-center lg:text-left">
                        <div className="mx-auto lg:mx-0 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">
                                Guaranteed ROI
                            </span>
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight">
                            Stop Losing Customers To{" "}
                            <span className="text-primary italic">Outdated</span>{" "}
                            Websites.
                        </h1>

                        <p className="mx-auto lg:mx-0 max-w-xl text-lg md:text-xl text-slate-300 leading-relaxed">
                            We build high-performance websites for busy business owners who need more leads, not more headaches. Get a site that works as hard as you do.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
                            <a
                                href="#contact"
                                className="w-full sm:w-auto inline-block rounded-xl bg-primary px-8 py-4 text-center text-sm md:text-base font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(255,107,0,0.25)] transition-colors hover:bg-accent"
                            >
                                Get a Free Audit
                            </a>
                            <a
                                href="#work"
                                className="w-full sm:w-auto inline-block rounded-xl border-2 border-white/20 bg-transparent px-8 py-4 text-center text-sm md:text-base font-bold text-white transition-colors hover:border-white"
                            >
                                View Our Work
                            </a>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-400 mt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-8 rounded-full border-2 border-navy bg-navy-light bg-cover bg-center"
                                        style={{ backgroundImage: `url('https://i.pravatar.cc/100?u=${i}')` }}
                                    />
                                ))}
                            </div>
                            <span className="font-medium text-xs sm:text-sm">Trusted by 500+ Local Business Owners</span>
                        </div>
                    </div>

                    {/* Right Visual - Lead Form */}
                    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
                        <HeroForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
