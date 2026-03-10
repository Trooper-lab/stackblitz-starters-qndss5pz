import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { UserData } from "@/types/database";

// Create a new client
export const createClient = async (data: Partial<UserData>): Promise<string> => {
    try {
        // Generates a unique ID if not provided, though we usually use the Auth UID.
        // For manual creation without Auth (pre-registration), we generate a random ID.
        const newClientRef = doc(collection(db, "users"));
        const clientData: UserData = {
            uid: newClientRef.id,
            email: data.email || null,
            displayName: data.displayName || null,
            photoURL: null,
            role: "client",
            companyDetails: data.companyDetails,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...data
        };
        await setDoc(newClientRef, clientData);
        return newClientRef.id;
    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }
};

// Fetch all clients (users with role 'client')
export const getClients = async (): Promise<UserData[]> => {
    try {
        const q = query(
            collection(db, "users"),
            where("role", "==", "client"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as UserData);
    } catch (error) {
        console.error("Error fetching clients:", error);
        throw error;
    }
};

// Update client data
export const updateClientData = async (uid: string, data: Partial<UserData>): Promise<void> => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating client data:", error);
        throw error;
    }
};

// Fetch a single client
export const getClientById = async (uid: string): Promise<UserData | null> => {
    try {
        const userRef = doc(db, "users", uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return snapshot.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching client details:", error);
        throw error;
    }
}
