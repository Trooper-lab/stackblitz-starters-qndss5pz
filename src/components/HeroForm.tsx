"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { 
    Check, 
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function HeroForm() {
    const { signInWithGoogle, user: authUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPhoneStep, setShowPhoneStep] = useState(false);
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    
    const formRef = useRef<HTMLDivElement>(null);

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
        } catch (error: any) {
            console.error("Google sign in failed:", error);
            setError("Google inloggen mislukt. Probeer het opnieuw.");
        } finally {
            setIsProcessing(false);
        }
    };

    const showSuccessState = () => {
         if (isAnimating) return;
        setIsAnimating(true);
        gsap.to(formRef.current, {
            opacity: 0,
            scale: 0.95,
            y: 10,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                setIsSubmitted(true);
                gsap.fromTo(formRef.current,
                    { opacity: 0, scale: 1.05, y: -10 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" }
                );
            }
        });
    }

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
            showSuccessState();
        } catch (err: any) {
            console.error("Sign up error:", err);
            setIsProcessing(false);
            if (err.code === 'auth/email-already-in-use') {
                setError("Dit e-mailadres is al in gebruik.");
            } else if (err.code === 'auth/weak-password') {
                setError("Wachtwoord is te zwak.");
            } else {
                setError("Er is iets misgegaan. Probeer het opnieuw.");
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
            showSuccessState();
        } catch (err: any) {
            console.error("Error updating phone:", err);
            setIsProcessing(false);
            setError("Kon telefoonnummer niet opslaan. Probeer het opnieuw.");
        }
    };

    if (isSubmitted) {
        return (
            <div
                ref={formRef}
                className="relative flex min-h-[580px] w-full max-w-lg lg:ml-auto flex-col items-center justify-center rounded-[2.5rem] border border-white/5 bg-navy-light/40 p-10 text-center shadow-2xl backdrop-blur-xl"
            >
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-accent blur-xl opacity-40 rounded-full animate-pulse" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-orange-400 text-white shadow-xl">
                        <Check className="h-12 w-12" strokeWidth={3} />
                    </div>
                </div>
                <h3 className="mb-4 font-display text-3xl font-extrabold text-white tracking-tight text-center">Account Aangemaakt!</h3>
                <p className="text-slate-300 leading-relaxed font-medium mb-8 text-center">Welkom bij AI Lead Site. Je account is succesvol aangemaakt.</p>
                <button 
                    onClick={() => router.push("/dashboard/k")}
                    className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-bold tracking-wide text-white transition-all hover:bg-orange-600 shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] hover:-translate-y-1"
                >
                    Ga naar Dashboard
                </button>
            </div>
        );
    }

    if (showPhoneStep) {
        return (
            <div
                ref={formRef}
                className="relative flex min-h-[580px] w-full max-w-lg lg:ml-auto flex-col rounded-[2.5rem] border border-white/5 bg-navy-light/40 shadow-2xl backdrop-blur-xl overflow-hidden p-10"
            >
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col flex-grow justify-center">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent mb-4">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">Bijna klaar!</h3>
                        <p className="text-sm text-slate-400 font-medium">Voeg je telefoonnummer toe zodat we je kunnen bereiken over je project.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                <Phone size={18} strokeWidth={2.5} />
                            </div>
                            <input
                                type="tel"
                                name="tel"
                                autoComplete="tel"
                                placeholder="06 12345678"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-6 font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-600 shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] overflow-hidden disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="relative z-10">Account Voltooien</span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={formRef}
            className="relative flex min-h-[580px] w-full max-w-lg lg:ml-auto flex-col rounded-[2.5rem] border border-white/5 bg-navy-light/40 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="flex flex-col flex-grow p-8 md:p-10 justify-center relative z-10">
                <div className="flex flex-col">
                    <div className="mb-10 text-center">
                        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">Start Gratis Account</h3>
                        <p className="text-sm text-slate-400 font-medium">Krijg direct toegang tot ons platform.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button 
                            type="button"
                            onClick={handleGoogleSignIn} 
                            disabled={isProcessing}
                            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white text-navy font-bold py-4 px-4 transition-all hover:bg-slate-100 shadow-sm active:scale-[0.98] disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin text-navy" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Ga verder met Google
                                </>
                            )}
                        </button>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-[11px] font-black uppercase tracking-widest">of</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                    <User size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Je volledige naam"
                                    required
                                    value={formData.name}
                                    onFocus={() => setIsExpanded(true)}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (e.target.value.length > 0) setIsExpanded(true);
                                    }}
                                    className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="overflow-hidden space-y-4 pt-2"
                                    >
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                                <Mail size={18} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                autoComplete="email"
                                                placeholder="jouw@bedrijf.com"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                                <Phone size={18} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="tel"
                                                autoComplete="tel"
                                                placeholder="Telefoonnummer"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors">
                                                <Lock size={18} strokeWidth={2.5} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="new-password"
                                                autoComplete="new-password"
                                                placeholder="Wachtwoord"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-12 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="flex items-start gap-3 py-1 group cursor-pointer">
                                            <div className="pt-0.5">
                                                <input type="checkbox" id="hero-privacy-agree" required checked={agreeToPrivacy} onChange={(e) => setAgreeToPrivacy(e.target.checked)} className="w-4 h-4 text-accent border-white/20 bg-white/5 rounded focus:ring-accent cursor-pointer transition-colors group-hover:border-accent" />
                                            </div>
                                            <label htmlFor="hero-privacy-agree" className="text-[12px] text-slate-400 font-medium leading-normal cursor-pointer select-none">
                                                Ik ga akkoord met het <Link href="/privacybeleid" className="text-accent hover:underline font-bold">Privacybeleid</Link>.
                                            </label>
                                        </div>
                                        <button type="submit" disabled={isProcessing || !formData.name || !formData.email || !formData.email.includes('@') || formData.password.length < 6 || !formData.phone || !agreeToPrivacy} className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-6 font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] overflow-hidden">
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="relative z-10">Maak Gratis Account</span>
                                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">Heb je al een account? <Link href="/login" className="text-accent hover:text-orange-400 font-medium transition-colors">Log in</Link></p>
                </div>
            </div>
        </div>
    );
}
