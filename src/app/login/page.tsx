"use client";

import { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const { user, role, loading, signInWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (role === "admin") {
                router.push("/dashboard/a");
            } else {
                router.push("/dashboard/k");
            }
        }
    }, [user, role, loading, router]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsProcessing(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;

                // Update profile with name
                await updateProfile(newUser, { displayName: name });

                const userRef = doc(db, "users", newUser.uid);
                await setDoc(userRef, {
                    uid: newUser.uid,
                    email: newUser.email,
                    displayName: name,
                    role: "client",
                    createdAt: serverTimestamp(),
                }, { merge: true });
            }
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            console.error("Auth error:", err);
            
            // User friendly error messages
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError("Ongeldig e-mailadres of wachtwoord.");
            } else if (error.code === 'auth/email-already-in-use') {
                setError("Dit e-mailadres is al in gebruik.");
            } else if (error.code === 'auth/weak-password') {
                setError("Wachtwoord moet minimaal 6 karakters lang zijn.");
            } else {
                setError("Er is iets misgegaan. Probeer het opnieuw.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsProcessing(true);
        setError("");
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Google sign in failed:", error);
            setError("Inloggen met Google is mislukt.");
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-inter">
            {/* Left side - Branding & Value Prop */}
            <div className="hidden md:flex md:w-1/2 bg-navy text-white p-12 flex-col relative overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-accent rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft size={20} />
                        <span className="font-bold text-sm">Terug naar website</span>
                    </Link>
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-center max-w-lg mx-auto w-full">
                    <div className="mb-8">
                        <div className="w-16 h-1 bg-accent mb-6" />
                        <h1 className="text-4xl lg:text-5xl font-display font-extrabold leading-tight mb-6">
                            Welkom bij <br />
                            <span className="text-accent italic">AI Lead Site</span>
                        </h1>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed">
                            Beheer je website, chat met je AI assistent en bekijk je leads allemaal vanuit één centraal dashboard.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Jouw Persoonlijke AI</h3>
                                <p className="text-slate-400 text-sm">Vraag AI om nieuwe pagina's te maken, tekst te schrijven of het design aan te passen in real-time.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-1">
                                ⚡
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Geen Technische Kennis Nodig</h3>
                                <p className="text-slate-400 text-sm">Wij beheren de techniek, veiligheid en hosting. Jij focust op je bedrijf.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-auto pt-12 flex justify-between items-center text-sm text-slate-400 font-medium border-t border-white/10">
                    <span>© {new Date().getFullYear()} AI Lead Site</span>
                    <a href="mailto:support@aileadsite.nl" className="hover:text-white transition-colors">support@aileadsite.nl</a>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white relative">
                
                {/* Mobile back button */}
                <div className="md:hidden absolute top-6 left-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-display font-extrabold text-navy mb-3">
                            {isLogin ? "Welkom Terug" : "Maak Account Aan"}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isLogin ? "Log in op je dashboard om verder te gaan." : "Start vandaag nog met je gratis AI design."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-navy font-bold py-4 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm mb-6 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Ga verder met Google
                    </button>

                    <div className="relative flex items-center py-4 mb-6">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-black uppercase tracking-widest">of met e-mail</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Volledige Naam</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:font-normal placeholder:text-slate-400"
                                        placeholder="Voor- & Achternaam"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Zakelijke E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="naam@bedrijf.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-navy ml-1">Wachtwoord</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-11 text-navy font-bold focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Minimaal 6 karakters"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-accent text-white rounded-xl p-4 text-lg font-black uppercase tracking-wider shadow-xl shadow-accent/30 hover:bg-orange-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center mt-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : (isLogin ? "Inloggen" : "Account Aanmaken")}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            {isLogin ? "Heb je nog geen account?" : "Heb je al een account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-accent hover:text-orange-400 font-bold transition-colors"
                            >
                                {isLogin ? "Maak gratis account aan" : "Log in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}