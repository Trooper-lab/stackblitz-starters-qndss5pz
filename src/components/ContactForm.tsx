"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Phone, User, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ContactForm() {
    const { signInWithGoogle, user: authUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPhoneStep, setShowPhoneStep] = useState(false);
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    // Dutch phone number validation regex
    const validateDutchPhone = (number: string) => {
        const regex = /^((\+31|0031|0)6[1-9][0-9]{7})$/;
        const cleaned = number.replace(/\s/g, '');
        return regex.test(cleaned);
    };

    const handleGoogleSignIn = async () => {
        setIsProcessing(true);
        setError("");
        try {
            const user = await signInWithGoogle();
            if (user) {
                setShowPhoneStep(true);
            }
        } catch (error) {
            console.error("Google sign in failed:", error);
            setError("Google inloggen mislukt.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeToPrivacy) return;

        if (!validateDutchPhone(formData.phone)) {
            setError("Voer een geldig Nederlands 06-nummer in.");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: formData.name });
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: formData.email,
                displayName: formData.name,
                phone: formData.phone.replace(/\s/g, ''),
                role: "client",
                createdAt: serverTimestamp(),
            });
            setIsProcessing(false);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error("Sign up error:", err);
            setIsProcessing(false);
            if (err.code === 'auth/email-already-in-use') {
                setError("Dit e-mailadres is al in gebruik.");
            } else {
                setError("Er is iets misgegaan.");
            }
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser) return;

        if (!validateDutchPhone(formData.phone)) {
            setError("Voer een geldig Nederlands 06-nummer in.");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            const userRef = doc(db, "users", authUser.uid);
            await updateDoc(userRef, {
                phone: formData.phone.replace(/\s/g, '')
            });
            setIsProcessing(false);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error("Error updating phone:", err);
            setIsProcessing(false);
            setError("Kon telefoonnummer niet opslaan.");
        }
    };

    if (isSubmitted) {
        return (
            <section id="contact" className="py-24 bg-navy text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl shadow-2xl backdrop-blur-xl text-center max-w-2xl mx-auto">
                        <h3 className="mb-4 font-display text-3xl font-extrabold text-white tracking-tight text-center">
                            Account Aangemaakt!
                        </h3>
                        <p className="text-slate-300 leading-relaxed font-medium mb-8 text-center">
                            Welkom bij AI Lead Site. Je account is succesvol aangemaakt.
                        </p>
                        <button 
                            onClick={() => router.push("/dashboard/k")}
                            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-4 text-lg font-black uppercase tracking-wider text-white transition-all hover:bg-orange-600 shadow-xl shadow-accent/30 hover:translate-y-[-2px]"
                        >
                            Ga naar Dashboard
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-24 bg-navy text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-8 leading-tight">
                            Maak je <span className="text-accent italic">gratis</span> account aan<span className="text-accent">.</span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium">
                            Start vandaag nog met het genereren van leads. Krijg direct toegang tot ons platform en begin met het bouwen van hoog converterende websites.
                        </p>

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                    <span className="text-2xl">⚡</span>
                                </div>
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

                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col min-h-[580px] justify-center text-navy">
                        {showPhoneStep ? (
                            <div className="flex flex-col flex-grow justify-center py-10 text-center">
                                <div className="mb-8 text-center text-navy">
                                    <h3 className="font-display text-2xl font-extrabold tracking-tight mb-2">
                                        Laatste stap!
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium text-center">
                                        Voeg je telefoonnummer toe om je account te voltooien.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                                    <div className="flex flex-col gap-2 text-left">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Telefoonnummer</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="tel"
                                                autoComplete="tel"
                                                placeholder="06 12345678"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full bg-accent text-white rounded-xl p-5 text-lg font-black uppercase tracking-wider cursor-pointer shadow-xl shadow-accent/30 hover:bg-orange-600 transition-all hover:translate-y-[-2px] flex justify-center items-center"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : "Account Voltooien"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <div className="mb-10 text-center">
                                    <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                                        Start Gratis Account
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium text-center">
                                        Krijg direct toegang tot het platform
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={isProcessing}
                                        className="flex items-center justify-center gap-3 w-full rounded-xl border border-slate-200 bg-white text-navy font-bold py-4 px-4 transition-all hover:bg-slate-50 shadow-sm disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                        fill="#4285F4"
                                                    />
                                                    <path
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                        fill="#34A853"
                                                    />
                                                    <path
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                        fill="#FBBC05"
                                                    />
                                                    <path
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                        fill="#EA4335"
                                                    />
                                                </svg>
                                                Ga verder met Google
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-slate-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-black uppercase tracking-widest">of</span>
                                        <div className="flex-grow border-t border-slate-200"></div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="flex flex-col gap-2 text-left">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                    <User size={18} />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    name="name"
                                                    autoComplete="name"
                                                    placeholder="Voor- & achternaam" 
                                                    required
                                                    value={formData.name}
                                                    onFocus={() => setIsExpanded(true)}
                                                    onChange={(e) => {
                                                        setFormData({...formData, name: e.target.value});
                                                        if (e.target.value.length > 0) setIsExpanded(true);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                                                />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                                    className="overflow-hidden space-y-5 pt-2"
                                                >
                                                    <div className="flex flex-col gap-2 text-left">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Zakelijke e-mail</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                                <Mail size={18} />
                                                            </div>
                                                            <input 
                                                                type="email" 
                                                                name="email"
                                                                autoComplete="email"
                                                                placeholder="naam@bedrijf.com" 
                                                                required
                                                                value={formData.email}
                                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-2 text-left">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Telefoonnummer</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                                <Phone size={18} />
                                                            </div>
                                                            <input 
                                                                type="tel" 
                                                                name="tel"
                                                                autoComplete="tel"
                                                                placeholder="06 12345678" 
                                                                required
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-2 text-left">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Wachtwoord</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                                <Lock size={18} />
                                                            </div>
                                                            <input 
                                                                type={showPassword ? "text" : "password"} 
                                                                name="new-password"
                                                                autoComplete="new-password"
                                                                placeholder="Wachtwoord" 
                                                                required
                                                                minLength={6}
                                                                value={formData.password}
                                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 pr-12 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-navy transition-colors"
                                                            >
                                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 py-2 group cursor-pointer text-left">
                                                        <div className="pt-0.5">
                                                            <input 
                                                                type="checkbox" 
                                                                id="privacy-agree"
                                                                required
                                                                checked={agreeToPrivacy}
                                                                onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                                                                className="w-4 h-4 text-accent border-slate-300 rounded focus:ring-accent cursor-pointer transition-colors group-hover:border-accent"
                                                            />
                                                        </div>
                                                        <label htmlFor="privacy-agree" className="text-xs text-slate-500 font-medium leading-normal cursor-pointer select-none">
                                                            Ik ga akkoord met de verwerking van mijn gegevens zoals beschreven in het <Link href="/privacybeleid" className="text-accent hover:underline font-bold">Privacybeleid</Link>.
                                                        </label>
                                                    </div>
                                                    
                                                    <button 
                                                        type="submit" 
                                                        disabled={isProcessing || !formData.name || !formData.email || !formData.email.includes('@') || formData.password.length < 6 || !formData.phone || !agreeToPrivacy}
                                                        className="w-full bg-accent text-white rounded-xl p-5 text-lg font-black uppercase tracking-wider cursor-pointer shadow-xl shadow-accent/30 hover:bg-orange-600 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center"
                                                    >
                                                        {isProcessing ? <Loader2 className="animate-spin" /> : "Maak Gratis Account"}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </form>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-sm font-medium text-slate-500">
                                        Heb je al een account?{" "}
                                        <Link href="/login" className="text-accent hover:text-orange-400 font-bold transition-colors">
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
