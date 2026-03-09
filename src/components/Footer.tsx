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
                            Direct-response web design for the ambitious small business owner. Built for ROI, engineered for speed.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Company</h4>
                        <ul className="flex flex-col gap-4">
                            {["About Our Process", "Growth Partners", "ROI Case Studies"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Growth Plans</h4>
                        <ul className="flex flex-col gap-4">
                            {["Essential Launch", "Market Dominator", "Enterprise Custom"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-6">Legal</h4>
                        <ul className="flex flex-col gap-4">
                            {["Privacy Terms", "Service Agreement", "Lead Guarantee"].map(item => (
                                <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-accent font-bold transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-navy-light text-center">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        © 2026 AIleadsite.com. Engineered for growth.
                    </p>
                </div>
            </div>
        </footer>
    );
}
