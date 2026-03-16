import { Timestamp, FieldValue } from "firebase/firestore";

export type UserRole = "admin" | "client";

export interface CompanyDetails {
    name: string;
    address: string;
    email: string;
    phone: string;
    kvk?: string;
    vat?: string;
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

export type ClientStatus = "new_lead" | "contacted" | "design_pipeline" | "active_client" | "lost" | "lead" | "active";

export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    status?: ClientStatus;
    companyDetails?: CompanyDetails;
    domainInfo?: DomainInfo;
    projectContext?: ProjectContext;
    selectedPackage?: PackageSelection;
    createdAt: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}

export interface ProjectAsset {
    id: string; // URL or path
    name: string;
    url: string;
    type: "logo" | "photo" | "document" | "other";
    uploadedAt: Timestamp | FieldValue;
}

export interface ProjectDesign {
    id: string;
    name: string;
    description?: string;
    htmlUrl?: string; // URL to the hosted HTML design (optional now)
    htmlCode?: string; // The full HTML code pasted by the admin
    status: "pending" | "approved" | "rejected";
    feedback?: string;
    createdAt: Timestamp | FieldValue;
}

export type ProjectStatus = "intake" | "design_review" | "development" | "qa" | "delivered";

export interface PackageSelection {
    packageId: string;
    addons: string[];
    billingCycle: "monthly" | "yearly";
    totalPrice?: number;
    maintenancePrice?: number;
    timestamp?: Timestamp | FieldValue;
}

export interface QAComment {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    text: string;
    createdAt: Timestamp | FieldValue;
}

export type LaunchFlowOption = "no_domain" | "move_domain" | "full_migration" | "self_dns";

export interface LaunchSettings {
    option: LaunchFlowOption;
    domainName?: string;
    currentProvider?: string;
    loginDetails?: string;
    confirmedMove?: boolean;
    confirmedBackup?: boolean;
    dnsSent?: boolean;
    completedAt?: Timestamp | FieldValue;
}

export interface ProjectData {
    id: string;
    clientId: string;
    clientEmail?: string;
    title: string;
    status: ProjectStatus;
    assets: ProjectAsset[];
    designs: ProjectDesign[];
    packageSelection?: PackageSelection;
    commitmentFeeInvoiced?: boolean;
    finalInvoiceInvoiced?: boolean;
    testLink?: string;
    qaComments?: QAComment[];
    launchSettings?: LaunchSettings;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export interface AdminTask {
    id: string;
    type: "review_design" | "overdue_invoice" | "new_lead" | "general";
    title: string;
    description?: string;
    relatedId?: string; // clientId or projectId
    isCompleted: boolean;
    createdAt: Timestamp | FieldValue;
    dueDate?: Timestamp | FieldValue;
}

export interface InvoiceData {
    id: string;
    projectId: string;
    clientId: string;
    clientEmail?: string;
    invoiceNumber: string;
    amount: number;
    description: string;
    status: "draft" | "sent" | "paid" | "overdue";
    type?: "one_time" | "maintenance";
    billingCycle?: "monthly" | "yearly";
    isAutomated?: boolean;
    pdfUrl?: string; // Firebase storage URL
    issuedAt?: Timestamp | FieldValue;
    dueDate?: Timestamp | FieldValue;
    paidAt?: Timestamp | FieldValue;
    createdAt: Timestamp | FieldValue;
}
