"use client";

import { useState, memo } from "react";
import { ProjectData, ProjectDesign, ProjectAsset, QAComment } from "@/types/database";
import { updateClientData } from "@/lib/services/clientService";
import { updateDesignStatus, updateProject } from "@/lib/services/projectService";
import { generateCommitmentFeeInvoice } from "@/lib/services/invoiceService";
import { updateLaunchSettings } from "@/lib/services/projectService";
import { CheckCircle2, XCircle, ExternalLink, Download, FileText, ImageIcon, Loader2, Layout, Receipt, ArrowLeft, ChevronRight, Sparkles, MessageSquare, Globe, Play, FileCode, Wrench, Maximize2, Monitor, Sidebar, Clock } from "lucide-react";
import Image from "next/image";
import ClientInvoiceList from "./ClientInvoiceList";
import PackageSelectionWizard from "./PackageSelectionWizard";
import DesignViewer from "./DesignViewer";
import LaunchWizard from "./LaunchWizard";
import FileUpload from "./FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { LaunchSettings } from "@/types/database";
import { Timestamp } from "firebase/firestore";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { pricingAddons } from "@/lib/config/pricing";

interface WebsitePreviewProps {
    testLink?: string;
}

const WebsitePreview = memo(({ testLink }: WebsitePreviewProps) => {
    if (!testLink) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin opacity-20" />
                <p className="text-sm italic">Systeem wordt voorbereid...</p>
            </div>
        );
    }

    return (
        <iframe 
            src={testLink} 
            className="w-full h-full border-none bg-white block m-0 p-0"
            title="Website Preview"
        />
    );
});

WebsitePreview.displayName = "WebsitePreview";

interface ChatMessagesProps {
    comments?: QAComment[];
}

const ChatMessages = memo(({ comments = [] }: ChatMessagesProps) => {
    if (!comments || comments.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 text-center p-8">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Sparkles className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-xs italic leading-relaxed">
                    Welkom in je feedback kanaal! <br/>
                    Heb je vragen over de voortgang of specifieke wensen? Laat het ons hier direct weten.
                </p>
            </div>
        );
    }

    return (
        <>
            {comments.map((comment) => (
                <div key={comment.id} className={`flex flex-col ${comment.authorRole === 'client' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed shadow-xl ${
                        comment.authorRole === 'client' 
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' 
                            : 'bg-white/10 border border-white/10 text-white rounded-tl-none backdrop-blur-md'
                    }`}>
                        {comment.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 px-1 font-medium">
                        {comment.authorName || (comment.authorRole === 'admin' ? 'Designer' : 'Klant')} • {comment.createdAt instanceof Timestamp 
                            ? comment.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : comment.createdAt && typeof comment.createdAt === 'object' && 'seconds' in comment.createdAt
                                ? new Date((comment.createdAt as { seconds: number }).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : comment.createdAt && typeof comment.createdAt === 'string'
                                    ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'Net geplaatst'}
                    </span>
                </div>
            ))}
        </>
    );
});

ChatMessages.displayName = "ChatMessages";

interface ProjectChatProps {
    project: ProjectData;
    newComment: string;
    setNewComment: (s: string) => void;
    handleAddComment: () => void;
    sendingComment: boolean;
    chatScrollRef: React.RefObject<HTMLDivElement | null>;
}

const ProjectChat = memo(({ 
    project, 
    newComment, 
    setNewComment, 
    handleAddComment, 
    sendingComment, 
    chatScrollRef 
}: ProjectChatProps) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0A0F1C]/40 backdrop-blur-sm">
            <div 
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
                <ChatMessages comments={project.qaComments} />
            </div>
            
            <div className="p-6 bg-white/5 border-t border-white/10 mt-auto">
                <div className="flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
                    <input 
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Typ je bericht..."
                        className="flex-1 bg-transparent border-none text-sm text-white px-3 py-2 outline-none placeholder:text-slate-600"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={sendingComment || !newComment.trim()}
                        className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
});

ProjectChat.displayName = "ProjectChat";

interface ClientProjectDetailProps {
    project: ProjectData;
    onUpdate?: () => void;
    onBack: () => void;
}


export default function ClientProjectDetail({ project, onUpdate, onBack }: ClientProjectDetailProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL-based state
    const defaultTab = 
        project.status === 'upload' ? "assets" :
        (project.status === 'development' || project.status === 'qa' || project.status === 'delivered' || project.status === 'completed') ? "dev" : 
        "designs";

    const activeTab = (searchParams.get("tab") as "designs" | "assets" | "invoices" | "dev") || defaultTab;
    const viewingDesignId = searchParams.get("design");
    const showLaunchWizard = searchParams.get("launch") === "true";

    const viewingDesign = project.designs.find(d => d.id === viewingDesignId) || null;

    const [submitting, setSubmitting] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);
    const [showWizardForDesign, setShowWizardForDesign] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [sendingComment, setSendingComment] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showFeedbackMode, setShowFeedbackMode] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (showChat && chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [project.qaComments, showChat]);

    // Helpers
    const setActiveTab = useCallback((tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const setViewingDesign = useCallback((design: ProjectDesign | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (design) params.set("design", design.id);
        else params.delete("design");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const setShowLaunchWizard = useCallback((show: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (show) params.set("launch", "true");
        else params.delete("launch");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Force tab sync when status changes to one that doesn't support current tab
    useEffect(() => {
        if (project.status === 'upload' && activeTab === 'designs') {
            setActiveTab('assets');
        } else if (project.status === 'design_review' && activeTab === 'assets') {
            setActiveTab('designs');
        }
    }, [project.status, activeTab, setActiveTab]);

    const handleDirectApprove = async (designId: string, feedbackText?: string) => {
        setSubmitting(designId);
        try {
            await updateDesignStatus(project.id, designId, "approved", feedbackText);
            
            // Advance status logic
            const nextStatus: Partial<ProjectData> = {};
            if (project.status === 'vibecheck') {
                nextStatus.status = 'upload';
            } else if (project.status === 'design_review' && project.packageSelection) {
                // If they already somehow have a package, go to development
                nextStatus.status = 'development';
            }
            
            if (Object.keys(nextStatus).length > 0) {
                await updateProject(project.id, nextStatus);
            }
            
            onUpdate?.();
        } catch (error) {
            console.error("Error approving design:", error);
        } finally {
            setSubmitting(null);
        }
    };

    const handleApproveClick = (designId: string, feedbackText?: string) => {
        if (feedbackText) {
            setFeedback(prev => ({ ...prev, [designId]: feedbackText }));
        }
        
        // Only show package wizard if they haven't selected one yet AND they are approving the final design
        if (project.status === 'design_review' && !project.packageSelection) {
            setShowWizardForDesign(designId);
        } else {
            handleDirectApprove(designId, feedbackText);
        }
        setViewingDesign(null);
    };

    const handleWizardComplete = async (selection: { packageId: string; addons: string[]; billingCycle: "monthly" | "yearly"; commitmentFee: number }) => {
        if (!showWizardForDesign) return;
        setSubmitting(showWizardForDesign);
        try {
            const { commitmentFee, ...packageSelection } = selection;
            const updatedProjectData: Partial<ProjectData> = { 
                packageSelection,
                status: 'development' // Move to development after package selection and design approval
            };
            
            // Only generate a new commitment fee invoice if they hadn't been invoiced for a commitment fee yet
            if (commitmentFee > 0 && !project.commitmentFeeInvoiced) {
                await generateCommitmentFeeInvoice(project.id, project.clientId, commitmentFee, project.clientEmail);
                updatedProjectData.commitmentFeeInvoiced = true;
            }

            await updateProject(project.id, updatedProjectData);
            const feedbackText = feedback[showWizardForDesign];
            await updateDesignStatus(project.id, showWizardForDesign, "approved", feedbackText);

            // Convert lead to active client
            await updateClientData(project.clientId, { status: "active" });

            onUpdate?.();
            setShowWizardForDesign(null);
        } catch (error) {
            console.error("Error saving package and approving design:", error);
        } finally {
            setSubmitting(null);
        }
    };


    const handleReject = async (designId: string, feedbackText?: string) => {
        const textToUse = feedbackText || feedback[designId];
        if (!textToUse) {
            setShowFeedbackInput(designId);
            return;
        }

        setSubmitting(designId);
        try {
            await updateDesignStatus(project.id, designId, "rejected", textToUse);
            onUpdate?.();
            setShowFeedbackInput(null);
            if (viewingDesign?.id === designId) {
                // Derived state will update automatically via props
            }
        } catch (error) {
            console.error("Error rejecting design:", error);
        } finally {
            setSubmitting(null);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || sendingComment) return;
        setSendingComment(true);
        try {
            const comment: QAComment = {
                id: Math.random().toString(36).substr(2, 9),
                authorId: project.clientId,
                authorName: "Klant",
                authorRole: "client",
                text: newComment,
                createdAt: Timestamp.now()
            };
            
            const updatedComments = [...(project.qaComments || []), comment];
            await updateProject(project.id, { qaComments: updatedComments });
            setNewComment("");
            onUpdate?.();
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setSendingComment(false);
        }
    };

    const handleAssetUpload = async (asset: ProjectAsset) => {
        const updatedAssets = [...(project.assets || []), asset];
        await updateProject(project.id, { assets: updatedAssets });
        onUpdate?.();
    };

    const handleLaunchComplete = async (settings: LaunchSettings) => {
        setSubmitting("launch");
        try {
            await updateLaunchSettings(project.id, settings);
            onUpdate?.();
            setShowLaunchWizard(false);
        } catch (error) {
            console.error("Error saving launch settings:", error);
        } finally {
            setSubmitting(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "pending": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    const getProjectStatusColor = (status: string) => {
        switch (status) {
            case "vibecheck": return "from-blue-500 to-indigo-600";
            case "upload": return "from-amber-400 to-orange-500";
            case "design_review": return "from-purple-500 to-indigo-600";
            case "development": return "from-amber-400 to-orange-500";
            case "qa": return "from-green-400 to-emerald-500";
            case "delivered": return "from-emerald-400 to-teal-500";
            case "completed": return "from-slate-400 to-slate-600";
            case "on_hold": return "from-slate-400 to-slate-500";
            default: return "from-blue-400 to-indigo-500";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "vibecheck": return "Vibecheck & Design Concept";
            case "upload": return "Upload Fase";
            case "design_review": return "Ontwerp Review";
            case "development": return "In Ontwikkeling";
            case "qa": return "Kwaliteitscontrole";
            case "delivered": return "Geleverd (Live)";
            case "completed": return "Afgerond";
            case "on_hold": return "Gepauzeerd";
            default: return status;
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Design Viewer Overlay */}
            <AnimatePresence>
                {viewingDesign && (
                    <DesignViewer 
                        design={viewingDesign}
                        onClose={() => setViewingDesign(null)}
                        onApprove={handleApproveClick}
                        onReject={handleReject}
                        isSubmitting={!!submitting}
                        isAdmin={false}
                    />
                )}
            </AnimatePresence>

            {/* Back Button & Project Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all w-fit"
                >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Terug naar projecten</span>
                </button>
                
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.1em] shadow-lg bg-gradient-to-r text-white ${getProjectStatusColor(project.status)} border-white/20`}>
                    {project.status.replace("_", " ")}
                </div>
            </div>

            {/* Project Journey Stepper */}
            {project.status !== 'delivered' && project.status !== 'completed' && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 px-2">
                    {['vibecheck', 'upload', 'design_review', 'development', 'qa', 'delivered'].map((s) => {
                        const statusOrder = ['vibecheck', 'upload', 'design_review', 'development', 'qa', 'delivered', 'completed'];
                        const isCompleted = statusOrder.indexOf(project.status) > statusOrder.indexOf(s);
                        const isActive = project.status === s;
                        
                        return (
                            <div key={s} className="flex flex-col gap-2">
                                <div className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-white/10'
                                }`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                    {s === 'vibecheck' ? 'Vibe' : 
                                     s === 'upload' ? 'Upload' : 
                                     s === 'design_review' ? 'Design' : 
                                     s === 'development' ? 'Bouw' : 
                                     s === 'qa' ? 'Check' : 
                                     'Live'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Project Header Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0F1C] p-10 md:p-14 shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    {project.status === 'vibecheck' && <Sparkles className="w-48 h-48 text-blue-400" />}
                    {(project.status === 'development' || project.status === 'qa') && <Wrench className="w-48 h-48 text-amber-500" />}
                    {(project.status === 'delivered' || project.status === 'completed') && <Globe className="w-48 h-48 text-emerald-500" />}
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getProjectStatusColor(project.status)} shadow-lg`}>
                            {project.status === 'vibecheck' ? <Sparkles className="text-white w-6 h-6" /> : 
                             project.status === 'development' || project.status === 'qa' ? <Wrench className="text-white w-6 h-6" /> :
                             <Globe className="text-white w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">Project Workspace</p>
                            <h2 className={`font-bold leading-none tracking-tight ${
                                project.status === 'vibecheck' ? 'text-indigo-400' :
                                project.status === 'upload' ? 'text-blue-400' :
                                project.status === 'design_review' ? 'text-purple-400' :
                                project.status === 'development' ? 'text-yellow-400' :
                                project.status === 'qa' ? 'text-orange-400' :
                                'text-green-400'
                            }`}>{getStatusLabel(project.status)}</h2>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-black mb-6 text-white tracking-tighter leading-[0.9]">
                        {project.title}
                    </h1>
                    
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                        {project.status === 'vibecheck' && "We leggen momenteel de creatieve basis voor je website. Check de 'vibe' en geef je feedback."}
                        {project.status === 'development' && "Je website wordt momenteel tot leven gewekt. Bekijk de voortgang in de live preview."}
                        {project.status === 'qa' && "De techniek staat. Tijd voor de laatste puntjes op de i en jouw definitieve feedback."}
                        {(project.status === 'delivered' || project.status === 'completed') && "Gefeliciteerd! Je project is live. Beheer hier je assets en administratie."}
                    </p>
                </div>
            </motion.div>

            {/* Conditional Navigation / Header based on Stage */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        {project.status === 'vibecheck' && <Sparkles className="w-3 h-3 text-blue-400" />}
                        {project.status === 'upload' && <FileText className="w-3 h-3 text-blue-400" />}
                        {project.status === 'development' && <Wrench className="w-3 h-3 text-amber-500" />}
                        {project.status === 'qa' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                        {(project.status === 'delivered' || project.status === 'completed') && <Globe className="w-3 h-3 text-emerald-500" />}
                        {getStatusLabel(project.status)}
                    </h3>
                    <h2 className="text-3xl font-black text-white font-display tracking-tight leading-none">
                        {project.status === 'vibecheck' ? 'Vibecheck' : 
                         project.status === 'upload' ? 'Upload gegevens' :
                         project.status === 'development' || project.status === 'qa' ? 'Ontwikkeling' :
                         'Jouw Project'}
                    </h2>
                </div>

                {/* Tab Navigation - Only show when multiple tabs are relevant */}
                {(project.status !== 'vibecheck') && (
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm self-start md:self-auto mb-8">
                        {(project.status === 'upload' || project.status === 'development' || project.status === 'qa' || project.status === 'delivered' || project.status === 'completed') && (
                            <button
                                onClick={() => setActiveTab(project.status === 'upload' ? "assets" : "dev")}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    ((activeTab === 'dev') || (activeTab === 'assets' && project.status === 'upload')) ? "bg-white text-navy shadow-lg" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {project.status === 'upload' ? <FileCode className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {project.status === 'upload' ? 'Assets' : 'Preview & Chat'}
                            </button>
                        )}
                        
                        {(project.status === 'delivered' || project.status === 'completed') && (
                            <button
                                onClick={() => setActiveTab("designs")}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "designs" ? "bg-white text-navy shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                                <Layout className="w-4 h-4" />
                                Design
                            </button>
                        )}
                        
                        {(project.status !== 'upload' && (project.status === 'development' || project.status === 'qa' || project.status === 'delivered' || project.status === 'completed')) && (
                            <button
                                onClick={() => setActiveTab("assets")}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "assets" ? "bg-white text-navy shadow-lg" : "text-slate-400 hover:text-white"}`}
                            >
                                <FileCode className="w-4 h-4" />
                                Assets
                            </button>
                        )}

                        {(project.status === 'delivered' || project.status === 'completed') && (
                            <>
                                <button
                                    onClick={() => setActiveTab("invoices")}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "invoices" ? "bg-white text-navy shadow-lg" : "text-slate-400 hover:text-white"}`}
                                >
                                    <Receipt className="w-4 h-4" />
                                    Facturen
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="popLayout" initial={false}>
                    {activeTab === "designs" && (project.status === 'vibecheck' || project.status === 'design_review') && (
                        <motion.section 
                            key="designs"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-baseline justify-between mb-2">
                                <h3 className="text-2xl font-bold font-montserrat text-white">
                                    {project.status === 'vibecheck' ? 'Vibecheck' : 'Design Check'}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {project.status === 'vibecheck' ? 'Klik op een concept om de vibe te bepalen.' : 'Bekijk het design ontwerp voor jouw website.'}
                                </p>
                            </div>
                            <div className="text-sm text-slate-400 font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic mb-6">
                                {project.status === 'vibecheck' ? (
                                    <>In deze fase zijn we op zoek naar de juiste <strong>&apos;vibe&apos;</strong>. Passeert dit design de vibe check? Dan kunnen we door naar het verzamelen van je content.</>
                                ) : (
                                    <>Dit is het <strong>definitieve ontwerp</strong> gebaseerd op jouw vibe en aangeleverde content. Na goedkeuring kiezen we je pakket en starten we direct met de bouw!</>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {project.designs.filter(d => 
                                    project.status === 'vibecheck' 
                                        ? (d.phase === 'vibecheck' || !d.phase) 
                                        : (d.phase === 'design_review')
                                ).length === 0 ? (
                                    <div className="relative overflow-hidden p-20 border border-white/10 rounded-[3rem] bg-white/[0.02] flex flex-col items-center justify-center text-center">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6 backdrop-blur-xl group-hover:scale-110 transition-all duration-500">
                                            <Layout className="w-12 h-12 text-slate-500" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-2">Geen ontwerpen gevonden</h4>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                            We zijn druk bezig met je design! Zodra er een ontwerp klaarstaat, ontvang je direct een seintje en kun je het hier bekijken.
                                        </p>
                                    </div>
                                ) : (
                                    project.designs
                                        .filter(d => 
                                            project.status === 'vibecheck' 
                                                ? (d.phase === 'vibecheck' || !d.phase) 
                                                : (d.phase === 'design_review')
                                        )
                                        .map((design: ProjectDesign, index: number) => (
                                        <motion.div 
                                            key={design.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                                            className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-black/20"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-xl text-white group-hover:text-blue-400 transition-colors">{design.name}</h4>
                                                        <span className={`text-[9px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(design.status)}`}>
                                                            {design.status === 'pending' 
                                                                ? (project.status === 'vibecheck' ? 'Vibecheck' : 'Design Check') 
                                                                : (design.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen')}
                                                        </span>
                                                    </div>
                                                    {design.description && <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{design.description}</p>}
                                                    
                                                    {design.status === "rejected" && design.feedback && (
                                                        <div className="inline-flex items-start gap-3 text-sm text-red-300 bg-red-500/10 p-4 rounded-xl border border-red-500/20 w-fit backdrop-blur-md">
                                                            <div className="p-1.5 rounded-lg bg-red-500/20">
                                                                <XCircle className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className="block font-bold mb-1">Feedback van jou:</span>
                                                                <span className="opacity-80 leading-relaxed font-medium">{design.feedback}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <button
                                                        onClick={() => setViewingDesign(design)}
                                                        className="px-6 py-3 bg-white text-navy hover:bg-blue-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-black/20 group/btn"
                                                    >
                                                        <span>Bekijk Design</span>
                                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>

                                                    {design.status === "pending" && (
                                                        <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                                                            <button
                                                                disabled={!!submitting}
                                                                onClick={() => handleApproveClick(design.id)}
                                                                className="group/approve p-2.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                                                                title="Goedkeuren"
                                                            >
                                                                {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover/approve:scale-110 transition-transform" />}
                                                            </button>
                                                            <div className="w-px h-6 bg-white/10" />
                                                            <button
                                                                disabled={!!submitting}
                                                                onClick={() => handleReject(design.id)}
                                                                className="group/reject p-2.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                                                title="Afwijzen / Feedback"
                                                            >
                                                                {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5 group-hover/reject:scale-110 transition-transform" />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {showFeedbackInput === design.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-8 space-y-4 border-t border-white/5 pt-8"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Wat kan er beter?</span>
                                                    </div>
                                                    <textarea
                                                        placeholder="Geef hier je feedback door aan onze designers..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all min-h-[140px] shadow-inner placeholder:text-slate-600 font-medium"
                                                        value={feedback[design.id] || ""}
                                                        onChange={(e) => setFeedback({ ...feedback, [design.id]: e.target.value })}
                                                    />
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setShowFeedbackInput(null)}
                                                            className="px-6 py-2.5 text-sm text-slate-400 font-bold hover:text-white transition-colors"
                                                        >
                                                            Annuleren
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(design.id)}
                                                            disabled={!feedback[design.id]}
                                                            className="px-8 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-xl shadow-red-900/20"
                                                        >
                                                            Feedback Versturen
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}



                    {activeTab === "assets" && (
                        <motion.section 
                            key="assets"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                             <div className="flex items-baseline justify-between">
                                <h3 className="text-2xl font-bold font-montserrat text-white">Project Assets</h3>
                                <div className="flex items-center gap-4">
                                    <p className="hidden md:block text-sm text-slate-500 font-medium">Alle geüploade bestanden voor dit project.</p>
                                    <FileUpload projectId={project.id} onUploadComplete={handleAssetUpload} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {project.assets.length === 0 ? (
                                    <div className="col-span-full py-24 border border-white/10 rounded-[3rem] bg-white/[0.02] flex flex-col items-center justify-center text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                                        <div className="relative">
                                            <div className="inline-flex p-6 rounded-3xl bg-white/5 border border-white/10 mb-6 backdrop-blur-xl">
                                                <ImageIcon className="w-12 h-12 text-slate-500" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">Je mediabibliotheek is leeg</h4>
                                            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                                Geüploade logo&apos;s, foto&apos;s en documenten verschijnen hier overzichtelijk bij elkaar.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    project.assets.map((asset: ProjectAsset) => (
                                        <div key={asset.id} className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden aspect-square shadow-xl transition-all hover:bg-white/10 hover:border-white/20">
                                            {asset.type === "photo" ? (
                                                <Image src={asset.url} alt={asset.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110 duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400">
                                                    <div className="p-4 rounded-2xl bg-white/5 mb-3 group-hover:bg-white/10 transition-all group-hover:scale-110 duration-500">
                                                        <FileText className="w-10 h-10" />
                                                    </div>
                                                    <span className="text-xs font-bold text-center truncate w-full px-2 uppercase tracking-tighter">{asset.name}</span>
                                                </div>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 duration-500 backdrop-blur-md">
                                                <span className="text-white text-xs font-bold uppercase tracking-widest px-4 text-center">{asset.name}</span>
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 bg-white text-navy rounded-2xl transition-all shadow-2xl hover:scale-110 active:scale-95 transform translate-y-4 group-hover:translate-y-0 duration-500"
                                                    title="Downloaden"
                                                >
                                                    <Download className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.section>
                    )}

                    {activeTab === "invoices" && (
                        <motion.section 
                            key="invoices"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-2xl font-bold font-montserrat text-white">Factuuroverzicht</h3>
                                <p className="text-sm text-slate-500 font-medium">Download je facturen en bekijk de betaalstatus.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-2">
                                <ClientInvoiceList projectId={project.id} clientId={project.clientId} />
                            </div>
                        </motion.section>
                    )}
                                        {(activeTab === "dev" || (project.status === 'development' || project.status === 'qa') && activeTab !== "assets" && activeTab !== "designs" && activeTab !== "invoices" && activeTab !== "addons") && (project.status === 'development' || project.status === 'qa' || project.status === 'delivered' || project.status === 'completed') && (
                        <motion.section 
                            key="dev"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-white font-montserrat tracking-tight">Feedback & Voortgang</h3>
                                        <p className="text-slate-400 font-medium">Communiceer direct met ons team over de bouw van je website.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowFeedbackMode(true)}
                                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-3 group active:scale-95"
                                    >
                                        <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col items-start leading-tight">
                                            <span className="text-sm">Bekijk Preview</span>
                                            <span className="text-[10px] opacity-70 uppercase tracking-widest font-black">Full Screen Mode</span>
                                        </div>
                                        <Maximize2 className="w-4 h-4 ml-2 opacity-30 group-hover:opacity-100" />
                                    </button>
                                </div>

                                <div className="bg-[#0A0F1C]/40 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl h-[700px] flex flex-col relative group/chat">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                                    <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between relative z-10 backdrop-blur-md">
                                          <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                  <MessageSquare className="w-6 h-6 text-white" />
                                              </div>
                                              <div>
                                                  <h3 className="font-bold text-lg text-white font-montserrat tracking-tight">Support Kanaal</h3>
                                                  <div className="flex items-center gap-2">
                                                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team is Stand-by</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Live in touch</span>
                                          </div>
                                    </div>
                                    <ProjectChat 
                                        project={project}
                                        newComment={newComment}
                                        setNewComment={setNewComment}
                                        handleAddComment={handleAddComment}
                                        sendingComment={sendingComment}
                                        chatScrollRef={chatScrollRef}
                                    />
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Launch Settings Card & Process */}
                {project.status === 'qa' && (
                    <div className="space-y-6 mt-8">
                        {project.launchSettings && project.launchSettings.option !== 'no_domain' ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Globe className="w-32 h-32 text-blue-400 animate-pulse" />
                                </div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                                    <div className="p-6 bg-blue-500 rounded-3xl shadow-xl shadow-blue-500/40">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">We gaan bijna live!</h4>
                                            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">In Behandeling</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-2xl">
                                            Je configuratie is doorgegeven. We zijn nu bezig met de technische uitrol. Dit proces duurt doorgaans <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">maximaal 24 uur</span>.
                                        </p>
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Gekozen Strategie</p>
                                                <p className="text-sm font-bold text-white capitalize">{project.launchSettings.option.split('_').join(' ')}</p>
                                            </div>
                                            {project.launchSettings.domainName && (
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Doeldomein</p>
                                                    <p className="text-sm font-bold text-white">{project.launchSettings.domainName}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowLaunchWizard(true)}
                                        className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                    >
                                        Wijzigen
                                    </button>
                                </div>
                                
                                <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-4 text-sm text-slate-400 italic">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span>We sturen direct een update zodra de website live staat op je domein.</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                                    <div className="p-4 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                        <Globe className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-white">Livegang Configuratie</h4>
                                        <p className="text-sm text-slate-400 mt-1 max-w-sm">
                                            Configureer hoe we je website live gaan zetten voor de wereld.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowLaunchWizard(true)}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 transform whitespace-nowrap"
                                >
                                    Nu Configureren
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Project Add-ons & Upgrades - ONLY show if launched */}
                {(project.status === 'delivered' || project.status === 'completed') && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white font-montserrat tracking-tight uppercase italic text-shadow-sm">Project Add-ons</h3>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Beheer en schaal je website functionaliteit</p>
                            </div>
                            <button 
                                onClick={() => setShowWizardForDesign('package')}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Configureer Pakket
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pricingAddons.map((addon) => {
                                const isActive = project.packageSelection?.addons?.includes(addon.id);
                                
                                return (
                                    <div 
                                        key={addon.id} 
                                        className={`group p-6 rounded-[2.5rem] border transition-all ${
                                            isActive 
                                                ? 'bg-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-500/5' 
                                                : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            {isActive ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Actief</span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setShowWizardForDesign('package')}
                                                    className="text-[8px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest"
                                                >
                                                    Activeer Nu
                                                </button>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white mb-1">{addon.name}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{addon.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Full Screen Feedback Overlay */}
            <AnimatePresence>
                {showFeedbackMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[100] bg-[#0A0F1C] flex flex-col"
                    >
                        {/* Control Bar */}
                        <div className="h-20 border-b border-white/10 bg-[#0A0F1C]/80 backdrop-blur-2xl flex items-center justify-between px-10 relative z-20">
                             <div className="flex items-center gap-8">
                                 <button 
                                     onClick={() => setShowFeedbackMode(false)}
                                     className="group p-4 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 rounded-[1.5rem] text-white transition-all shadow-xl active:scale-95"
                                     title="Terug naar dashboard"
                                 >
                                     <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                 </button>
                                 <div className="flex flex-col">
                                     <div className="flex items-center gap-3">
                                         <h2 className="text-2xl font-black text-white font-montserrat tracking-tight uppercase">Feedback Mode</h2>
                                         <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                             <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Live Preview</span>
                                         </div>
                                     </div>
                                     <p className="text-sm text-slate-500 font-medium">Navigeer door je nieuwe website en deel direct je feedback.</p>
                                 </div>
                             </div>

                             <div className="flex items-center gap-6">
                                 <a 
                                     href={project.testLink} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
                                 >
                                     <ExternalLink className="w-4 h-4" />
                                     <span>Open Extern</span>
                                 </a>
                                 <div className="hidden lg:block w-px h-10 bg-white/10 mx-2" />
                                 <button 
                                     onClick={() => setShowChat(!showChat)}
                                     className={`px-8 py-3 rounded-2xl border transition-all flex items-center gap-3 text-sm font-bold shadow-2xl ${
                                         showChat 
                                             ? "bg-white text-navy border-white hover:bg-blue-50" 
                                             : "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
                                     }`}
                                 >
                                     <MessageSquare className="w-5 h-5" />
                                     <span>{showChat ? 'Verberg Chat' : 'Open Sidebar Chat'}</span>
                                 </button>
                             </div>
                        </div>

                        {/* Layout Workspace */}
                        <div className="flex-1 flex overflow-hidden relative">
                             {/* The actual website in full glory */}
                             <div className="flex-1 relative bg-white overflow-hidden shadow-2xl">
                                 <WebsitePreview testLink={project.testLink} />
                                 
                                 {/* Floating Toggle if Sidebar is closed */}
                                 {!showChat && (
                                     <motion.button 
                                         initial={{ scale: 0, opacity: 0 }}
                                         animate={{ scale: 1, opacity: 1 }}
                                         onClick={() => setShowChat(true)}
                                         className="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:scale-110 active:scale-90 transition-all flex items-center justify-center z-50 group"
                                     >
                                         <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                         <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-4 border-[#0A0F1C] rounded-full animate-bounce" />
                                     </motion.button>
                                 )}
                             </div>

                             {/* Sidebar Chat System */}
                             <AnimatePresence>
                                 {showChat && (
                                     <motion.div 
                                         initial={{ width: 0, opacity: 0 }}
                                         animate={{ width: 450, opacity: 1 }}
                                         exit={{ width: 0, opacity: 0 }}
                                         className="border-l border-white/10 bg-[#0A0F1C] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-20"
                                     >
                                         <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                             <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                                    <Sidebar className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white font-montserrat uppercase tracking-tight">Direct Feedback</h3>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chat & Revisions</p>
                                                </div>
                                             </div>
                                             <button 
                                                onClick={() => setShowChat(false)} 
                                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                             >
                                                  <XCircle className="w-5 h-5" />
                                             </button>
                                         </div>
                                         <ProjectChat 
                                            project={project}
                                            newComment={newComment}
                                            setNewComment={setNewComment}
                                            handleAddComment={handleAddComment}
                                            sendingComment={sendingComment}
                                            chatScrollRef={chatScrollRef}
                                         />
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launch Wizard */}
            {showLaunchWizard && (
                <LaunchWizard 
                    onClose={() => setShowLaunchWizard(false)}
                    onComplete={handleLaunchComplete}
                    isSubmitting={submitting === "launch"}
                    initialSettings={project.launchSettings}
                />
            )}

            {/* Wizard for Design Approval */}
            {showWizardForDesign && (
                <PackageSelectionWizard
                    onClose={() => setShowWizardForDesign(null)}
                    onComplete={handleWizardComplete}
                    isSubmitting={!!submitting && submitting === showWizardForDesign}
                    initialSelection={project.packageSelection}
                />
            )}
        </div>
    );
}

