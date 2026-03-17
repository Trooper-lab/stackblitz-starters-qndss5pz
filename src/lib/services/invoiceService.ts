import { db } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, serverTimestamp, Timestamp, onSnapshot } from "firebase/firestore";
import { InvoiceData } from "@/types/database";
import { deepCleanData } from "@/lib/utils";

// Subscribe to all invoices (for admin)
export const subscribeAllInvoices = (onUpdate: (invoices: InvoiceData[]) => void) => {
    const q = query(
        collection(db, "invoices"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
        onUpdate(invoices);
    }, (error) => {
        console.error("Error subscribing to all invoices:", error);
    });
};

// Fetch all invoices (for admin)
export const getAllInvoices = async (): Promise<InvoiceData[]> => {
    try {
        const q = query(
            collection(db, "invoices"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching all invoices:", error);
        throw error;
    }
};


// Fetch invoices for a specific client
export const getClientInvoices = async (clientId: string): Promise<InvoiceData[]> => {
    try {
        const q = query(
            collection(db, "invoices"),
            where("clientId", "==", clientId),
            orderBy("createdAt", "desc")
        )
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching client invoices:", error);
        throw error;
    }
};

// Subscribe to all invoices for a client
export const subscribeClientInvoices = (
    clientId: string,
    onUpdate: (invoices: InvoiceData[]) => void
) => {
    const q = query(
        collection(db, "invoices"),
        where("clientId", "==", clientId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
        onUpdate(invoices);
    }, (error) => {
        console.error("Error subscribing to client invoices:", error);
    });
};

// Fetch invoices for a specific project
export const getProjectInvoices = async (projectId: string, clientId?: string): Promise<InvoiceData[]> => {
    try {
        let q = query(
            collection(db, "invoices"),
            where("projectId", "==", projectId),
            orderBy("createdAt", "desc")
        );

        if (clientId) {
            q = query(q, where("clientId", "==", clientId));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
    } catch (error) {
        console.error("Error fetching project invoices:", error);
        throw error;
    }
};

// Subscribe to invoices for a specific project
export const subscribeProjectInvoices = (
    projectId: string,
    onUpdate: (invoices: InvoiceData[]) => void,
    clientId?: string
) => {
    let q = query(
        collection(db, "invoices"),
        where("projectId", "==", projectId),
        orderBy("createdAt", "desc")
    );

    if (clientId) {
        q = query(q, where("clientId", "==", clientId));
    }

    return onSnapshot(q, (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceData));
        onUpdate(invoices);
    }, (error) => {
        console.error("Error subscribing to project invoices:", error);
    });
};

// Create a new invoice
export const createInvoice = async (data: Omit<InvoiceData, "id" | "createdAt">): Promise<string> => {
    try {
        const cleaned = deepCleanData(data);
        const docRef = await addDoc(collection(db, "invoices"), {
            ...cleaned,
            createdAt: serverTimestamp(),
            status: data.status || "draft",
            issuedAt: data.issuedAt || serverTimestamp()
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
        const cleaned = deepCleanData(data);
        await updateDoc(docRef, cleaned);
    } catch (error) {
        console.error("Error updating invoice:", error);
        throw error;
    }
};

// Generate commitment fee invoice
export const generateCommitmentFeeInvoice = async (
    projectId: string,
    clientId: string,
    amount: number,
    clientEmail?: string
): Promise<string> => {
    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

        const invoiceId = await createInvoice({
            projectId,
            clientId,
            clientEmail: clientEmail || "",
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount,
            description: "50% Commitment Fee - Investering voor start project",
            status: "draft",
            dueDate: Timestamp.fromDate(dueDate),
        });
        return invoiceId;
    } catch (error) {
        console.error("Error generating commitment fee invoice:", error);
        throw error;
    }
};

// Generate final invoice
export const generateFinalInvoice = async (
    projectId: string,
    clientId: string,
    amount: number,
    clientEmail?: string
): Promise<string> => {
    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days payment term

        const invoiceId = await createInvoice({
            projectId,
            clientId,
            clientEmail: clientEmail || "",
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount,
            description: "100% Oplevering - Finale facturatie project",
            status: "draft",
            dueDate: Timestamp.fromDate(dueDate),
        });
        return invoiceId;
    } catch (error) {
        console.error("Error generating final invoice:", error);
        throw error;
    }
};

// Generate maintenance invoice
export const generateMaintenanceInvoice = async (
    projectId: string,
    clientId: string,
    amount: number,
    billingCycle: "monthly" | "yearly",
    clientEmail?: string
): Promise<string> => {
    try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term for maintenance

        const invoiceId = await createInvoice({
            projectId,
            clientId,
            clientEmail: clientEmail || "",
            invoiceNumber: `MNT-${Date.now().toString().slice(-6)}`,
            amount,
            description: `${billingCycle === "monthly" ? "Maandelijkse" : "Jaarlijkse"} Onderhoud & Hosting`,
            status: "draft",
            type: "maintenance",
            billingCycle,
            dueDate: Timestamp.fromDate(dueDate),
        });
        return invoiceId;
    } catch (error) {
        console.error("Error generating maintenance invoice:", error);
        throw error;
    }
};
