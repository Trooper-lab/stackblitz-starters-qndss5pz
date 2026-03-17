import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore";
import { ProjectData, QAComment, LaunchSettings } from "@/types/database";
import { deepCleanData } from "@/lib/utils";

// Subscribe to all projects (for admin)
export const subscribeAllProjects = (onUpdate: (projects: ProjectData[]) => void) => {
    const q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
        onUpdate(projects);
    }, (error) => {
        console.error("Error subscribing to all projects:", error);
    });
};

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
        console.error("Error fetching all projects:", error);
        throw error;
    }
};


// Fetch projects for a specific client
// Supports both UID and email-based matching for permissions and shell linking
export const getClientProjects = async (uid: string, email?: string): Promise<ProjectData[]> => {
    if (!uid) return [];
    try {
        const queryConstraints = [where("clientId", "==", uid)];
        if (email) {
            queryConstraints.push(where("clientEmail", "==", email));
        }

        let q;
        if (email) {
            // Because Firestore 'or' queries can fail static analysis if one leg doesn't natively guarantee permission,
            // we will query strictly by clientEmail for users who provide it (ensures rule compliance).
            q = query(
                collection(db, "projects"),
                where("clientEmail", "==", email),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(
                collection(db, "projects"),
                queryConstraints[0],
                orderBy("createdAt", "desc")
            );
        }

        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));

        // Legacy fallback: check for customerId field if no projects found
        if (projects.length === 0) {
            const qLegacy = query(
                collection(db, "projects"),
                where("customerId", "==", uid)
            );
            const legacySnapshot = await getDocs(qLegacy);
            return legacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
        }

        return projects;
    } catch (error) {
        console.error("Error fetching client projects:", error);
        throw error;
    }
};

// Subscribe to projects for a specific client
export const subscribeClientProjects = (
    uid: string,
    onUpdate: (projects: ProjectData[]) => void,
    email?: string
) => {
    if (!uid) return () => { };

    // We follow the same logic as getClientProjects for consistency
    let q;
    if (uid) {
        q = query(
            collection(db, "projects"),
            where("clientId", "==", uid),
            orderBy("createdAt", "desc")
        );
    } else if (email) {
        q = query(
            collection(db, "projects"),
            where("clientEmail", "==", email),
            orderBy("createdAt", "desc")
        );
    } else {
        return () => { };
    }

    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
        onUpdate(projects);
    }, (error) => {
        console.error("Error subscribing to projects:", error);
    });
};

// Create a new project
export const createProject = async (data: Omit<ProjectData, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
        const cleaned = deepCleanData(data);
        const docRef = await addDoc(collection(db, "projects"), {
            ...cleaned,
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
        const cleaned = deepCleanData(data);
        await updateDoc(docRef, {
            ...cleaned,
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
                const updatedDesign = { ...design, status };
                if (feedback !== undefined) {
                    updatedDesign.feedback = feedback;
                }
                return updatedDesign;
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

// Add a QA comment
export const addQAComment = async (
    projectId: string, 
    comment: Omit<QAComment, "id" | "createdAt">
): Promise<void> => {
    try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Project not found");

        const projectData = docSnap.data() as ProjectData;
        const currentComments = projectData.qaComments || [];
        
        const newComment: QAComment = {
            ...comment,
            id: Date.now().toString(),
            createdAt: serverTimestamp()
        };

        const cleanedComment = deepCleanData(newComment);

        await updateDoc(docRef, {
            qaComments: [...currentComments, cleanedComment],
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding QA comment:", error);
        throw error;
    }
};

// Update launch settings
export const updateLaunchSettings = async (
    projectId: string,
    settings: Partial<LaunchSettings>
): Promise<void> => {
    try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Project not found");

        const projectData = docSnap.data() as ProjectData;
        const currentSettings = projectData.launchSettings || { option: "no_domain" };
        const cleanedSettings = deepCleanData({ ...currentSettings, ...settings });

        await updateDoc(docRef, {
            launchSettings: cleanedSettings,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating launch settings:", error);
        throw error;
    }
};
// Update a project name
export const updateProjectName = async (projectId: string, newName: string): Promise<void> => {
    try {
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            title: newName,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating project name:", error);
        throw error;
    }
};
