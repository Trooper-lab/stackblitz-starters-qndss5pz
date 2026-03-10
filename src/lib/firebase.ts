import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
    if (!firebaseConfig.apiKey) {
        if (typeof window !== "undefined") {
            console.warn("Firebase API key is missing. Check your environment variables.");
        }
        // Provide a dummy app or handle missing config gracefully
        app = getApps().length > 0 ? getApp() : null;
    } else {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error("Firebase initialization failed:", error);
    app = null;
}

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
