"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createProject, subscribeClientProjects } from "@/lib/services/projectService";
import { updateClientData } from "@/lib/services/clientService";
import { ProjectData, CompanyDetails, DomainInfo, ProjectContext } from "@/types/database";
import ClientProjectDetail from "@/components/dashboard/ClientProjectDetail";
import ClientNotificationBanner from "@/components/dashboard/ClientNotificationBanner";
import { ClientNotification } from "@/lib/services/notificationService";

import { LayoutDashboard, Receipt, LogOut, Loader2, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import CustomerOnboardingForm from "@/components/dashboard/customer/CustomerOnboardingForm";
import CustomerWaitPage from "@/components/dashboard/customer/CustomerWaitPage";
import CustomerDashboardHome from "@/components/dashboard/customer/CustomerDashboardHome";

export default function CustomerDashboardContent() {
    const { user, userData, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [projects, setProjects] = useState<ProjectData[]>([]);
    const selectedProjectId = searchParams.get("project");
    
    const [onboardingStep, setOnboardingStepState] = useState<1 | 2 | 4>(1); // 1: Form, 2: Wait, 4: Dashboard
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Navigation helpers
    const setOnboardingStep = useCallback((step: 1 | 2 | 4) => {
        setOnboardingStepState(step); // Update local state
        const params = new URLSearchParams(searchParams.toString());
        params.set("step", step.toString());
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const setSelectedProject = useCallback((project: ProjectData | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (project) {
            params.set("project", project.id);
        } else {
            params.delete("project");
        }
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
        name: "",
        address: "",
        email: "",
        phone: "",
        kvk: "",
        vat: ""
    });

    const [domainInfo, setDomainInfo] = useState<DomainInfo>({
        currentDomain: "",
        provider: "",
        loginDetails: "Geen inloggegevens verstrekt", // Default message
        sslStatus: "unknown"
    });

    const [projectContext, setProjectContext] = useState<ProjectContext>({
        goals: "",
        targetAudience: "",
        currentWebsiteContent: "",
        competitors: ""
    });

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    useEffect(() => {
        if (userData && !hasInitialized) {
            if (userData.companyDetails) setCompanyDetails(userData.companyDetails);
            if (userData.domainInfo) setDomainInfo(userData.domainInfo);
            if (userData.projectContext) setProjectContext(userData.projectContext);
            if (userData.onboardingStep) setOnboardingStepState(userData.onboardingStep as 1 | 2 | 4);
            setHasInitialized(true);

            // AUTO-NAVIGATION based on status (only if no step/project is already in URL)
            const hasExplicitState = searchParams.has("step") || searchParams.has("project");
            
            if (!hasExplicitState) {
                if (projects.length === 0 && !userData?.onboardingStep) {
                    setOnboardingStep(1); // Default to Intake
                } else if (userData?.onboardingStep === 2) {
                    setOnboardingStep(2); // Wait/Confirmation
                } else if (projects.length > 0) {
                    setOnboardingStep(4); // Dashboard
                    const firstProj = projects[0];
                    if (firstProj) setSelectedProject(firstProj);
                }
            }
        }
    }, [userData, projects, searchParams, setOnboardingStep, setSelectedProject, hasInitialized]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeClientProjects(
            user.uid,
            (data) => {
                setProjects(data);
                
                // Auto-redirect to dashboard only if they have projects and aren't in Step 1/2
                // Or if the user record explicitly says they are on Step 4
                if (data.length > 0 && onboardingStep === 1 && !isSubmitting && !userData?.onboardingStep) {
                    setOnboardingStep(4);
                } else if (userData?.onboardingStep === 4 && onboardingStep !== 4) {
                    setOnboardingStep(4);
                }
                
                setLoading(false);
            },
            user.email || undefined
        );

        return () => unsubscribe();
    }, [user, onboardingStep, setOnboardingStep, isSubmitting, userData?.onboardingStep]);

    const handleOnboardingSubmit = async (newCompanyDetails: CompanyDetails, newDomainInfo: DomainInfo, newProjectContext: ProjectContext) => {
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            setCompanyDetails(newCompanyDetails);
            setDomainInfo(newDomainInfo);
            setProjectContext(newProjectContext);

            // 1. Update user document
            await updateClientData(user.uid, {
                companyDetails: newCompanyDetails,
                domainInfo: newDomainInfo,
                projectContext: newProjectContext,
                onboardingStep: 2
            });

            // 2. Create the initial project
            await createProject({
                clientId: user.uid,
                clientEmail: user.email || undefined,
                title: `${newCompanyDetails.name}${newDomainInfo.currentDomain ? ` - ${newDomainInfo.currentDomain.replace(/^https?:\/\//, "")}` : ""}`,
                status: 'vibecheck',
                uploadData: {
                    companyDetails: newCompanyDetails,
                    domainInfo: newDomainInfo,
                    projectContext: newProjectContext
                },
                designs: [],
                assets: [],
                qaComments: [],
                testLink: '',
                launchSettings: {
                    option: 'no_domain',
                }
            });

            // 3. Explicitly set to Step 2 (Wait Page)
            setOnboardingStep(2);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Onboarding submission error:", error);
            setError(error.message || "Er is een fout opgetreden bij het opslaan.");
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    if (onboardingStep === 1 && !loading) {
        return (
            <div className="min-h-screen bg-navy text-white flex flex-col">
                <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <Link href="/">
                            <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                AIleadsite<span className="text-accent">.</span>
                            </span>
                        </Link>
                    </div>
                    <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <LogOut size={16} /> Uitloggen
                    </button>
                </nav>

                {/* Error Banner */}
                {error && (
                    <div className="max-w-4xl mx-auto px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm mb-6">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
                    {onboardingStep === 1 && (
                        <CustomerOnboardingForm 
                            user={user} 
                            loading={loading} 
                            onSaveSuccess={handleOnboardingSubmit} 
                            initialCompanyDetails={companyDetails}
                            initialDomainInfo={domainInfo}
                            initialProjectContext={projectContext}
                        />
                    )}
                </div>
            </div>
        );
    }

    if (onboardingStep === 2 && !loading) {
        return (
            <div className="min-h-screen bg-navy text-white flex flex-col">
                <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-navy/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <Link href="/">
                            <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                AIleadsite<span className="text-accent">.</span>
                            </span>
                        </Link>
                    </div>
                    <button onClick={signOut} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <LogOut size={16} /> Uitloggen
                    </button>
                </nav>

                <CustomerWaitPage 
                    user={user}
                    onContinue={() => setOnboardingStep(4)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white font-inter selection:bg-accent/30">
            <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <Link href="/dashboard/k">
                            <span className="font-display text-xl lg:text-2xl font-black tracking-tighter uppercase text-white cursor-pointer">
                                AIleadsite<span className="text-accent">.</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-8 mr-4">
                            <Link 
                                href="/dashboard/k" 
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${!pathname.includes('invoices') ? 'text-white border-b-2 border-accent pb-1' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutDashboard size={14} /> Dashboard
                            </Link>
                            <Link 
                                href="/dashboard/k/invoices" 
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${pathname.includes('invoices') ? 'text-white border-b-2 border-accent pb-1' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Receipt size={14} /> Facturen
                            </Link>
                        </nav>
                        {user && (
                            <ClientNotificationBanner
                                clientId={user.uid}
                                onActionClick={(notif: ClientNotification) => {
                                    if (notif.relatedId) {
                                        const proj = projects.find(p => p.id === notif.relatedId);
                                        if (proj) setSelectedProject(proj);
                                    }
                                }}
                            />
                        )}
                        <button onClick={signOut} className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                            <LogOut size={14} /> Uitloggen
                        </button>
                    </div>
                </div>
            </nav>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest opacity-40">Gegevens ophalen...</p>
                </div>
            ) : selectedProject ? (
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <ClientProjectDetail
                        project={selectedProject}
                        onBack={() => setSelectedProject(null)}
                    />
                </div>
            ) : (
                <CustomerDashboardHome
                    user={user}
                    projects={projects}
                    onSelectProject={setSelectedProject}
                />
            )}
        </div>
    );
}
