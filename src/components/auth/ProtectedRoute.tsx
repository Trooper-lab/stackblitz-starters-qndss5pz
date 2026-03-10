"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ("admin" | "client")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (allowedRoles && role && !allowedRoles.includes(role)) {
                // If user is admin and tries to go to customer dashboard, we allow it?
                // Or if customer tries to go to admin dashboard, we redirect to dashboard.
                if (role === "client") {
                    router.push("/dashboard/k");
                } else {
                    router.push("/dashboard/a");
                }
            }
        }
    }, [user, loading, role, router, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user || (allowedRoles && role && !allowedRoles.includes(role))) {
        return null;
    }

    return <>{children}</>;
}
