import { Bell, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { User } from "firebase/auth";
import { motion } from "framer-motion";

interface CustomerWaitPageProps {
    user: User | null;
    onContinue: () => void;
}

export default function CustomerWaitPage({ user, onContinue }: CustomerWaitPageProps) {
    return (
        <main className="flex-grow flex items-center justify-center p-6 py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full text-center"
            >
                <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <Sparkles size={40} className="text-accent animate-pulse" />
                    <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-20" />
                </div>

                <h1 className="text-4xl md:text-7xl font-display font-black mb-6 uppercase tracking-tighter italic">We gaan voor je aan de slag<span className="text-accent">!</span></h1>
                
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 mb-10 text-center relative overflow-hidden group">
                    <p className="text-slate-300 text-xl font-medium leading-relaxed mb-6">
                        Top, <span className="text-white font-black italic">{user?.displayName?.split(' ')[0]}</span>! Je gegevens zijn binnen en onze designers hebben alle informatie die ze nodig hebben.
                    </p>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm font-bold">
                            <Bell className="w-4 h-4" />
                            <span>We nemen contact met je op om de verwachtingen van onze workflow af te stemmen.</span>
                        </div>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Binnen <span className="text-white font-bold italic">24 uur</span> staan de eerste ontwerpen voor je klaar in je dashboard.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
                    <button
                        onClick={onContinue}
                        className="w-full md:w-auto bg-accent text-white px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest shadow-2xl shadow-accent/40 hover:bg-primary transition-all flex items-center justify-center gap-4 italic group"
                    >
                        Ga door naar dashboard <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        { title: "Design Fase", desc: "Wij maken de eerste homepage concepten op basis van jouw input." },
                        { title: "Review & Keuze", desc: "Kies je favoriete richting en geef feedback voor de puntjes op de i." },
                        { title: "Bouw & Live", desc: "Na jouw akkoord bouwen we de site en zetten we hem direct live." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:bg-white/10 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={100} />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-accent text-sm font-black flex items-center justify-center text-white italic">{i + 1}</div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-accent italic">{item.title}</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed text-slate-400 relative z-10">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-6 bg-white/5 border border-white/10 rounded-[2rem] inline-flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status: <span className="text-white font-bold">Wachten op eerste ontwerpen</span></span>
                </div>
            </motion.div>
        </main>
    );
}
