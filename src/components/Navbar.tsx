"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Growth Solutions", href: "#pricing" },
        { name: "Success Stories", href: "#work" },
        { name: "Pricing", href: "#pricing" },
    ];

    return (
        <header className="fixed top-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
            <div
                className={`mx-auto max-w-7xl transition-all duration-500 pointer-events-auto
                    ${scrolled
                        ? "bg-white/80 backdrop-blur-lg shadow-xl shadow-navy/5 border border-white/40 py-3 px-6 rounded-2xl"
                        : "bg-transparent py-4 px-8"
                    }`}
            >
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🚀</span>
                        <span className={`font-display text-xl lg:text-2xl font-black tracking-tighter uppercase transition-colors duration-500
                            ${scrolled ? "text-navy" : "text-white"}`}>
                            AIleadsite<span className="text-accent">.</span>
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500
                                    ${scrolled ? "text-navy/70 hover:text-accent" : "text-white/80 hover:text-white"}`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-lg
                            ${scrolled
                                ? "bg-navy text-white hover:bg-navy-light shadow-navy/20"
                                : "bg-white text-navy hover:bg-slate-100 shadow-white/10"
                            }`}>
                            Get My Free Audit
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`lg:hidden p-2 rounded-lg transition-colors duration-500
                            ${scrolled ? "text-navy bg-white/50 hover:bg-white/80" : "text-white bg-white/10 hover:bg-white/20"}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-black uppercase tracking-widest text-navy p-4 hover:bg-slate-50 rounded-xl transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button className="bg-accent text-white py-5 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                            Get My Free Audit
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
