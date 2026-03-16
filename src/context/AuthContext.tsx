"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserData, UserRole } from "@/types/database";
import { linkClientAccounts } from "@/lib/services/clientService";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    role: UserRole | null;
    signInWithGoogle: () => Promise<User | null>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<UserRole | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Fetch user metadata from Firestore
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const data = userSnap.data() as UserData;
                        
                        // Even if user document exists, they might have new unlinked data (shell profiles)
                        // associated with their email. Let's check for linking.
                        if (currentUser.email) {
                            try {
                                const linkedUser = await linkClientAccounts(currentUser.uid, currentUser.email);
                                if (linkedUser) {
                                    setUserData(linkedUser);
                                    setRole(linkedUser.role);
                                    setLoading(false);
                                    return;
                                }
                            } catch (err) {
                                console.error("Error during account linking fallback:", err);
                            }
                        }

                        setUserData(data);
                        setRole(data.role);
                    } else {
                        // This is a new UID. Check if we should link an existing shell profile.
                        let finalUserData: UserData | null = null;

                        if (currentUser.email) {
                            try {
                                const linkedUser = await linkClientAccounts(currentUser.uid, currentUser.email);
                                if (linkedUser) {
                                    finalUserData = linkedUser;
                                }
                            } catch (err) {
                                console.error("Error during account linking:", err);
                            }
                        }

                        if (!finalUserData) {
                            // Double check if the document was created while we were linking
                            const secondCheck = await getDoc(userRef);
                            if (secondCheck.exists()) {
                                finalUserData = secondCheck.data() as UserData;
                            } else {
                                // Create new user document
                                const newUser: UserData = {
                                    uid: currentUser.uid,
                                    email: currentUser.email || "",
                                    displayName: currentUser.displayName || "",
                                    photoURL: currentUser.photoURL || "",
                                    role: "client",
                                    status: "lead",
                                    createdAt: serverTimestamp(),
                                };
                                await setDoc(userRef, newUser);
                                finalUserData = newUser;
                            }
                        }

                        if (finalUserData) {
                            setUserData(finalUserData);
                            setRole(finalUserData.role);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setUserData(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            // Force account selection even if logged in
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            console.error("Error signing in with Google:", error.message);
            if (error.code === 'auth/popup-blocked') {
                alert('De pop-up is geblokkeerd door je browser. Sta pop-ups toe voor deze website.');
            } else if (error.code === 'auth/popup-closed-by-user') {
                // User closed the popup, no need to alert
            } else {
                alert('Er is een fout opgetreden bij het inloggen met Google. Probeer het later opnieuw.');
            }
            return null;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, role, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
