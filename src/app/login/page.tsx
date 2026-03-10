"use client";

import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Image from "next/image";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

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
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update profile with name
                await updateProfile(user, { displayName: name });

                // Firestore user document creation is handled by AuthContext's onAuthStateChanged
                // but for name/email it might be safer to ensure it here if onAuthStateChanged is slow
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: name,
                    role: "client",
                    createdAt: serverTimestamp(),
                }, { merge: true });
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || "An error occurred");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white p-4 font-inter">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-montserrat font-extrabold mb-6 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>

                {error && <p className="text-red-400 text-sm mb-4 p-3 bg-red-400/10 rounded-lg">{error}</p>}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium mb-1 opacity-70">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Your Name"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-all shadow-lg"
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#020617] text-white/40">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-all"
                >
                    <Image src="https://www.google.com/favicon.ico" width={20} height={20} alt="Google" />
                    Google
                </button>

                <p className="mt-8 text-center text-sm text-white/40">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                        {isLogin ? "Create one" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
