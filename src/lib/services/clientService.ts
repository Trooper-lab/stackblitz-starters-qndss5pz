import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc, query, where, orderBy, serverTimestamp, writeBatch, onSnapshot } from "firebase/firestore";
import { UserData } from "@/types/database";
import { deepCleanData } from "@/lib/utils";

// Create a new client
export const createClient = async (data: Partial<UserData>): Promise<string> => {
    try {
        const newClientRef = doc(collection(db, "users"));
        const cleanedMetadata = deepCleanData(data);
        const clientData: UserData = {
            uid: newClientRef.id,
            email: data.email || null,
            displayName: data.displayName || null,
            photoURL: null,
            role: "client",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...cleanedMetadata
        };
        await setDoc(newClientRef, clientData);
        return newClientRef.id;
    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }
};

// Subscribe to all clients (for admin)
export const subscribeClients = (onUpdate: (clients: UserData[]) => void) => {
    const q = query(
        collection(db, "users"),
        where("role", "==", "client"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const clients = snapshot.docs.map(doc => doc.data() as UserData);
        onUpdate(clients);
    }, (error) => {
        console.error("Error subscribing to clients:", error);
    });
};

// Fetch all clients (for admin)
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
        const cleaned = deepCleanData(data);
        await updateDoc(userRef, {
            ...cleaned,
            updatedAt: serverTimestamp()
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

// Link a shell profile to a real Auth UID
export const linkClientAccounts = async (authUid: string, email: string): Promise<UserData | null> => {
    try {
        console.log(`[linkClientAccounts] Starting linking for email: ${email}, authUid: ${authUid}`);
        
        // 1. Search for shell profiles with this email
        console.log("[linkClientAccounts] 1. Searching for shell profile...");
        const q = query(
            collection(db, "users"),
            where("email", "==", email),
            where("role", "==", "client"),
            where("uid", "!=", authUid) // Crucial: Don't find yourself if already linked
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log("[linkClientAccounts] No shell profile found matching email.");
            return null;
        }

        const shellDoc = snapshot.docs[0];
        const shellId = shellDoc.id;
        const shellData = shellDoc.data() as UserData;
        
        console.log(`[linkClientAccounts] Found shell profile: ${shellId}. Preparing batch...`);

        const batch = writeBatch(db);

        // 2. Create the new user document with the Auth UID
        const newUserRef = doc(db, "users", authUid);
        const newData: UserData = {
            ...shellData,
            uid: authUid,
            email: email,
            updatedAt: serverTimestamp()
        };
        batch.set(newUserRef, newData);
        console.log(`[linkClientAccounts] Batch: Set new user doc ${authUid}`);

        // 3. Update related collections to use the new UID
        console.log("[linkClientAccounts] 3(a). Querying projects...");
        const projectsQuery = query(collection(db, "projects"), where("clientEmail", "==", email));
        const projectsSnap = await getDocs(projectsQuery);
        console.log(`[linkClientAccounts] Found ${projectsSnap.size} projects to update.`);
        projectsSnap.forEach((d) => {
            if (d.data().clientId !== authUid) {
                batch.update(doc(db, "projects", d.id), { clientId: authUid });
            }
        });

        console.log("[linkClientAccounts] 3(b). Querying invoices...");
        const invoicesQuery = query(collection(db, "invoices"), where("clientEmail", "==", email));
        const invoicesSnap = await getDocs(invoicesQuery);
        console.log(`[linkClientAccounts] Found ${invoicesSnap.size} invoices to update.`);
        invoicesSnap.forEach((d) => {
            if (d.data().clientId !== authUid) {
                batch.update(doc(db, "invoices", d.id), { clientId: authUid });
            }
        });

        console.log("[linkClientAccounts] 3(c). Querying notifications...");
        const notifsQuery = query(collection(db, "notifications"), where("clientEmail", "==", email));
        const notifsSnap = await getDocs(notifsQuery);
        console.log(`[linkClientAccounts] Found ${notifsSnap.size} notifications to update.`);
        notifsSnap.forEach((d) => {
            if (d.data().clientId !== authUid) {
                batch.update(doc(db, "notifications", d.id), { clientId: authUid });
            }
        });

        // 4. Delete the old shell document
        batch.delete(shellDoc.ref);
        console.log(`[linkClientAccounts] Batch: Delete shell doc ${shellId}`);

        // Commit the batch
        console.log("[linkClientAccounts] 5. Committing batch...");
        await batch.commit();
        console.log("[linkClientAccounts] Batch committed successfully!");

        return newData;
    } catch (error) {
        console.error("[linkClientAccounts] CRITICAL Error linking client accounts:", error);
        throw error;
    }
};
