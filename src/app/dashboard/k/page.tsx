"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CustomerDashboardContent from "./CustomerDashboardContent";

export default function CustomerDashboard() {
    return (
        <ProtectedRoute allowedRoles={["client", "admin"]}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-navy text-white"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>}>
                <CustomerDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
