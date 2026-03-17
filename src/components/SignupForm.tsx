"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

interface SignupFormProps {
    variant?: "glass" | "white";
    title?: string;
    subtitle?: string;
}

export default function SignupForm({ 
    variant = "glass", 
    title = "Claim Je 3 Gratis Homepage Designs",
    subtitle = "Geen creditcard nodig. Volledig vrijblijvend."
}: SignupFormProps) {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const formWrapperRef = useRef<HTMLDivElement>(null);

    const showSuccessState = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        gsap.to(formWrapperRef.current, {
            opacity: 0,
            scale: 0.95,
            y: 10,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
                setIsSubmitted(true);
                gsap.fromTo(formWrapperRef.current,
                    { opacity: 0, scale: 1.05, y: -10 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" }
                );
            }
        });
    }

    const handleGoogleSignIn = async () => {
        setIsProcessing(true);
        setError("");
        try {
            const user = await signInWithGoogle();
            if (user) {
                router.push("/dashboard/k");
            }
        } catch (err: unknown) {
            console.error("Google sign in failed:", err);
            setError("Google inloggen mislukt. Probeer het opnieuw.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeToPrivacy) return;

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
                role: "client",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            setIsProcessing(false);
            showSuccessState();
        } catch (err: unknown) {
            const error = err as { code?: string };
            console.error("Sign up error:", err);
            setIsProcessing(false);
            if (error.code === 'auth/email-already-in-use') {
                setError("Dit e-mailadres is al in gebruik.");
            } else if (error.code === 'auth/weak-password') {
                setError("Wachtwoord is te zwak.");
            } else {
                setError("Er is iets misgegaan. Probeer het opnieuw.");
            }
        }
    };

    if (isSubmitted) {
        return (
            <div
                ref={formWrapperRef}
                className={`relative flex min-h-[580px] w-full max-w-lg mx-auto flex-col items-center justify-center rounded-[2.5rem] p-10 text-center shadow-2xl backdrop-blur-xl ${
                    variant === "glass" ? "border border-white/5 bg-navy-light/40" : "bg-white text-navy"
                }`}
            >
                {variant === "glass" && <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />}
                <div className="mb-8 relative">
                    <div className={`absolute inset-0 blur-xl opacity-40 rounded-full animate-pulse ${variant === "glass" ? "bg-accent" : "bg-accent/60"}`} />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-accent to-orange-400 text-white shadow-xl">
                        <Check className="h-12 w-12" strokeWidth={3} />
                    </div>
                </div>
                <h3 className={`mb-4 font-display text-3xl font-extrabold tracking-tight ${variant === "glass" ? "text-white" : "text-navy"}`}>
                    Account Aangemaakt!
                </h3>
                <p className={`leading-relaxed font-medium mb-8 ${variant === "glass" ? "text-slate-300" : "text-slate-500"}`}>
                    Welkom bij AI Lead Site. Je account is succesvol aangemaakt.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard/k")}
                        className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-bold tracking-wide text-white transition-all hover:bg-orange-600 shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] hover:-translate-y-1"
                    >
                        Ga naar Dashboard
                    </button>
                    <p className={`text-xs ${variant === "glass" ? "text-slate-500" : "text-slate-400"}`}>
                        Je wordt automatisch doorverwezen...
                    </p>
                </div>
            </div>
        );
    }

    const inputClasses = variant === "glass" 
        ? "w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-4 text-[15px] font-medium text-white placeholder:text-slate-500 outline-none transition-all focus:bg-white/10 focus:border-accent focus:ring-1 focus:ring-accent"
        : "w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all";

    const labelClasses = variant === "glass"
        ? "hidden"
        : "text-[10px] font-black uppercase tracking-widest text-navy ml-1 mb-1 block";

    const containerClasses = variant === "glass"
        ? "relative flex min-h-[580px] w-full max-w-lg lg:ml-auto flex-col rounded-[2.5rem] border border-white/5 bg-navy-light/40 shadow-2xl backdrop-blur-xl overflow-hidden"
        : "bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col min-h-[580px] justify-center text-navy w-full max-w-lg mx-auto";

    return (
        <div ref={formWrapperRef} className={containerClasses}>
            {variant === "glass" && <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />}
            <div className={`flex flex-col flex-grow ${variant === "glass" ? "p-8 md:p-10" : ""} justify-center relative z-10`}>
                <div className="mb-10 text-center">
                    <h3 className={`font-display text-2xl md:text-3xl font-extrabold tracking-tight mb-2 ${variant === "glass" ? "text-white" : "text-navy"}`}>
                        {title}
                    </h3>
                    <p className={`text-sm font-medium ${variant === "glass" ? "text-slate-400" : "text-slate-500"}`}>
                        {subtitle}
                    </p>
                </div>

                {error && (
                    <div className={`mb-6 p-4 border rounded-xl text-sm font-bold text-center ${
                        variant === "glass" 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : "bg-red-50 border-red-100 text-red-600"
                    }`}>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isProcessing}
                        className={`flex items-center justify-center gap-3 w-full rounded-2xl font-bold py-4 px-4 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 ${
                            variant === "glass"
                            ? "bg-white text-navy hover:bg-slate-100"
                            : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
                        }`}
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
                        <div className={`flex-grow border-t ${variant === "glass" ? "border-white/10" : "border-slate-200"}`}></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-[11px] font-black uppercase tracking-widest">of</span>
                        <div className={`flex-grow border-t ${variant === "glass" ? "border-white/10" : "border-slate-200"}`}></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            {variant === "white" && <label className={labelClasses}>Volledige naam</label>}
                            <div className={`absolute ${variant === "glass" ? "inset-y-0" : "bottom-0 top-6"} left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors`}>
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
                                className={inputClasses}
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
                                        {variant === "white" && <label className={labelClasses}>Zakelijke e-mail</label>}
                                        <div className={`absolute ${variant === "glass" ? "inset-y-0" : "bottom-0 top-6"} left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors`}>
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
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div className="relative group">
                                        {variant === "white" && <label className={labelClasses}>Wachtwoord</label>}
                                        <div className={`absolute ${variant === "glass" ? "inset-y-0" : "bottom-0 top-6"} left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent transition-colors`}>
                                            <Lock size={18} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="new-password"
                                            autoComplete="new-password"
                                            placeholder="Wachtwoord (min. 6 tekens)"
                                            required
                                            minLength={6}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className={`${inputClasses} pr-12`}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className={`absolute ${variant === "glass" ? "inset-y-0" : "bottom-0 top-6"} right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors`}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-3 py-1 group cursor-pointer">
                                        <div className="pt-0.5">
                                            <input 
                                                type="checkbox" 
                                                id="signup-privacy-agree" 
                                                required 
                                                checked={agreeToPrivacy} 
                                                onChange={(e) => setAgreeToPrivacy(e.target.checked)} 
                                                className="w-4 h-4 text-accent border-slate-300 bg-white/5 rounded focus:ring-accent cursor-pointer transition-colors group-hover:border-accent" 
                                            />
                                        </div>
                                        <label htmlFor="signup-privacy-agree" className="text-[12px] text-slate-400 font-medium leading-normal cursor-pointer select-none">
                                            Ik ga akkoord met het <Link href="/privacybeleid" className="text-accent hover:underline font-bold">Privacybeleid</Link>.
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isProcessing || !formData.name || !formData.email || !formData.email.includes('@') || formData.password.length < 6 || !agreeToPrivacy} 
                                        className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 px-6 font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 shadow-[0_10px_20px_-10px_rgba(255,125,41,0.5)] overflow-hidden"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="relative z-10">{variant === "glass" ? "Claim Je Gratis Design" : "Maak Gratis Account"}</span>
                                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className={`text-sm ${variant === "glass" ? "text-slate-400" : "text-slate-500"}`}>
                        Heb je al een account? <Link href="/login" className="text-accent hover:text-orange-400 font-medium transition-colors">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
