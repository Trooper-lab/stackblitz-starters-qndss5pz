"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Receipt, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import ClientInvoiceList from "@/components/dashboard/ClientInvoiceList";
import { motion } from "framer-motion";

export default function ClientInvoicesPage() {
    const { user, signOut } = useAuth();

    return (
        <ProtectedRoute allowedRoles={["client", "admin"]}>
            <div className="min-h-screen bg-navy text-white font-inter selection:bg-accent/30">
                <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <Link href="/dashboard/k">
                                <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                    AIleadsite<span className="text-accent">.</span>
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6">
                            <nav className="hidden md:flex items-center gap-8">
                                <Link 
                                    href="/dashboard/k" 
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <LayoutDashboard size={14} /> Dashboard
                                </Link>
                                <Link 
                                    href="/dashboard/k/invoices" 
                                    className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 border-b-2 border-accent pb-1"
                                >
                                    <Receipt size={14} /> Facturen
                                </Link>
                            </nav>
                            <button onClick={signOut} className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                                <LogOut size={14} /> Uitloggen
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-8 py-12">
                    <div className="mb-12">
                        <Link 
                            href="/dashboard/k"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Terug naar Dashboard</span>
                        </Link>
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight uppercase italic">
                                    Mijn <span className="text-accent">Facturen</span>
                                </h1>
                                <p className="text-lg text-slate-400 font-medium max-w-2xl">
                                    Een overzicht van al je investeringen en lopende abonnementen.
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Receipt className="w-64 h-64 text-white" />
                        </div>
                        
                        <div className="relative z-10">
                            {user && <ClientInvoiceList clientId={user.uid} />}
                        </div>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8">
                            <h3 className="text-xl font-bold mb-2">Hulp nodig bij betaling?</h3>
                            <p className="text-slate-400 text-sm mb-6">Heb je vragen over een factuur of lukt de betaling niet? Ons team staat voor je klaar om te helpen.</p>
                            <a href="mailto:support@aileadsite.nl" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:underline">
                                Neem contact op met support <ArrowLeft size={14} className="rotate-180" />
                            </a>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-xl font-bold mb-2">Factuurgegevens wijzigen?</h3>
                            <p className="text-slate-400 text-sm mb-6">Wil je de bedrijfsnaam of het adres op je facturen aanpassen? Dit kan in je profielinstellingen.</p>
                            <Link href="/dashboard/k?step=1" className="inline-flex items-center gap-2 text-slate-300 font-bold hover:underline">
                                Gegevens beheren <ArrowLeft size={14} className="rotate-180" />
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
