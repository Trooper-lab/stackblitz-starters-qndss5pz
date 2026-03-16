import { db } from "@/lib/firebase";
import {
    collection, doc, getDocs, addDoc, updateDoc,
    query, where, orderBy, serverTimestamp, Timestamp
} from "firebase/firestore";

export interface ClientNotification {
    id: string;
    clientId: string;
    clientEmail?: string;
    type: "review_design" | "pay_invoice" | "action_required" | "info" | "project_update";
    title: string;
    message: string;
    isRead: boolean;
    relatedId?: string; // projectId or invoiceId
    createdAt: Timestamp;
}

// Fetch unread (or all) notifications for a client
export const getClientNotifications = async (clientId: string, clientEmail?: string): Promise<ClientNotification[]> => {
    try {
        const notificationsRef = collection(db, "notifications");
        let q;

        if (clientEmail) {
            // Because Firestore 'or' queries can fail static analysis if one leg doesn't natively guarantee permission,
            // we will query strictly by clientEmail for users who provide it (ensures rule compliance).
            q = query(
                notificationsRef,
                where("clientEmail", "==", clientEmail),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(
                notificationsRef,
                where("clientId", "==", clientId),
                orderBy("createdAt", "desc")
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientNotification));
    } catch (error) {
        console.error("Error in getClientNotifications:", error);
        throw error;
    }
};

// Admin sends a notification to a client
export const sendClientNotification = async (
    clientId: string,
    type: ClientNotification["type"],
    title: string,
    message: string,
    relatedId?: string,
    clientEmail?: string // Added clientEmail for permission-safe reading
): Promise<string> => {
    const docRef = await addDoc(collection(db, "notifications"), {
        clientId,
        clientEmail: clientEmail || null,
        type,
        title,
        message,
        isRead: false,
        relatedId: relatedId || null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// Mark a notification as read
export const markNotificationRead = async (notificationId: string): Promise<void> => {
    await updateDoc(doc(db, "notifications", notificationId), { isRead: true });
};

// Shorthand helpers for common notification types
export const notifyReviewDesign = (clientId: string, projectId: string, projectTitle: string, clientEmail?: string) =>
    sendClientNotification(clientId, "review_design", "📐 Nieuw ontwerp klaar voor review!", `Je nieuwe ontwerp voor "${projectTitle}" is klaar. Bekijk en geef je goedkeuring.`, projectId, clientEmail);

export const notifyPayInvoice = (clientId: string, invoiceId: string, amount: number, clientEmail?: string) =>
    sendClientNotification(clientId, "pay_invoice", "🧾 Factuur klaarstaan voor betaling", `Er staat een factuur van €${amount.toFixed(2)} open. Bekijk de details en rond de betaling af.`, invoiceId, clientEmail);

export const notifyProjectUpdate = (clientId: string, projectId: string, message: string, clientEmail?: string) =>
    sendClientNotification(clientId, "project_update", "🚀 Project Update", message, projectId, clientEmail);
