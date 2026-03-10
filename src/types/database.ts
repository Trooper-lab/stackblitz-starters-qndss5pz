import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "client";

export interface CompanyDetails {
    name: string;
    address: string;
    kvk: string;
    vat: string;
}

export interface DomainInfo {
    currentDomain: string;
    provider: string;
    loginDetails: string;
    sslStatus: "active" | "inactive" | "unknown";
}

export interface ProjectContext {
    goals: string;
    targetAudience: string;
    currentWebsiteContent: string;
    competitors: string;
}

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    companyDetails?: CompanyDetails;
    domainInfo?: DomainInfo;
    projectContext?: ProjectContext;
    createdAt: Timestamp; // Firestore Timestamp
    updatedAt?: Timestamp; // Firestore Timestamp
}

export interface ProjectAsset {
    id: string; // URL or path
    name: string;
    url: string;
    type: "logo" | "photo" | "document" | "other";
    uploadedAt: Timestamp;
}

export interface ProjectDesign {
    id: string;
    name: string;
    description?: string;
    htmlUrl: string; // URL to the hosted HTML design
    status: "pending" | "approved" | "rejected";
    feedback?: string;
    createdAt: Timestamp;
}

export type ProjectStatus = "intake" | "design_review" | "development" | "delivered";

export interface ProjectData {
    id: string;
    clientId: string;
    title: string;
    status: ProjectStatus;
    assets: ProjectAsset[];
    designs: ProjectDesign[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface InvoiceData {
    id: string;
    projectId: string;
    clientId: string;
    invoiceNumber: string;
    amount: number;
    description: string;
    status: "draft" | "sent" | "paid" | "overdue";
    pdfUrl?: string; // Firebase storage URL
    issuedAt?: Timestamp;
    dueDate?: Timestamp;
    paidAt?: Timestamp;
    createdAt: Timestamp;
}
