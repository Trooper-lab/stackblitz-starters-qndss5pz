import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { InvoiceData } from "@/types/database";

// Fetch all invoices (for admin)
export const getAllInvoices = async (): Promise<InvoiceData[]> => {
    try {
        const q = query(
            collection(db, "invoices"),
            orderBy("issuedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
};

// Fetch invoices for a specific client
export const getClientInvoices = async (clientId: string): Promise<InvoiceData[]> => {
    try {
        const q = query(
            collection(db, "invoices"),
            where("clientId", "==", clientId),
            orderBy("issuedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching client invoices:", error);
        throw error;
    }
};

// Fetch invoices for a specific project
export const getProjectInvoices = async (projectId: string): Promise<InvoiceData[]> => {
    try {
        const q = query(
            collection(db, "invoices"),
            where("projectId", "==", projectId),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching project invoices:", error);
        throw error;
    }
};

// Create a new invoice
export const createInvoice = async (data: Omit<InvoiceData, "id" | "createdAt">): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "invoices"), {
            ...data,
            createdAt: serverTimestamp(),
            status: data.status || "draft"
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating invoice:", error);
        throw error;
    }
};

// Update invoice
export const updateInvoice = async (invoiceId: string, data: Partial<InvoiceData>): Promise<void> => {
    try {
        const docRef = doc(db, "invoices", invoiceId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating invoice:", error);
        throw error;
    }
};

// Generate commitment fee invoice
export const generateCommitmentFeeInvoice = async (
    projectId: string,
    clientId: string,
    amount: number
): Promise<string> => {
    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

        const invoiceId = await createInvoice({
            projectId,
            clientId,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount,
            description: "50% Commitment Fee - Investering voor start project",
            status: "draft",
            dueDate: dueDate as any, // In MVP we let Firestore auto-convert or store Date
        });
        return invoiceId;
    } catch (error) {
        console.error("Error generating commitment fee invoice:", error);
        throw error;
    }
};
