import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { ProjectData } from "@/types/database";

// Fetch all projects (for admin)
export const getAllProjects = async (): Promise<ProjectData[]> => {
    try {
        const q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
};

// Fetch projects for a specific client
// We standardise on 'clientId' but the rules now support both for safety
export const getClientProjects = async (uid: string): Promise<ProjectData[]> => {
    if (!uid) return [];
    try {
        const q = query(
            collection(db, "projects"),
            where("clientId", "==", uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));

        // Fallback: Als er geen projecten zijn met clientId, check legacy customerId
        if (projects.length === 0) {
            const qLegacy = query(
                collection(db, "projects"),
                where("customerId", "==", uid)
            );
            const legacySnapshot = await getDocs(qLegacy);
            const legacyProjects = legacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));

            // Handmatige sortering om index-error te voorkomen totdat de index is aangemaakt
            return legacyProjects.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
                const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
                return dateB - dateA;
            });
        }

        return projects;
    } catch (error) {
        console.error("Error fetching client projects:", error);
        throw error;
    }
};

// Create a new project
export const createProject = async (data: Omit<ProjectData, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "projects"), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

// Update a project
export const updateProject = async (projectId: string, data: Partial<ProjectData>): Promise<void> => {
    try {
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
};

// Update design status
export const updateDesignStatus = async (
    projectId: string,
    designId: string,
    status: "approved" | "rejected",
    feedback?: string
): Promise<void> => {
    try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Project not found");

        const projectData = docSnap.data() as ProjectData;
        const updatedDesigns = projectData.designs.map(design => {
            if (design.id === designId) {
                return { ...design, status, feedback };
            }
            return design;
        });

        await updateDoc(docRef, {
            designs: updatedDesigns,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating design status:", error);
        throw error;
    }
};
