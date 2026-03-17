"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboardContent from "./AdminDashboardContent";

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-navy text-white">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            }>
                <AdminDashboardContent />
            </Suspense>
        </ProtectedRoute>
    );
}
