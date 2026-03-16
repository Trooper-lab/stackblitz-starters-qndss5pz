"use client";

import { useState } from "react";
import { ProjectData, ProjectDesign, ProjectAsset, QAComment } from "@/types/database";
import { updateClientData } from "@/lib/services/clientService";
import { updateDesignStatus, updateProject } from "@/lib/services/projectService";
import { generateCommitmentFeeInvoice } from "@/lib/services/invoiceService";
import { updateLaunchSettings } from "@/lib/services/projectService";
import { CheckCircle2, XCircle, ExternalLink, Download, FileText, ImageIcon, Loader2, Layout, Receipt, ArrowLeft, ChevronRight, Sparkles, MessageSquare, Globe } from "lucide-react";
import Image from "next/image";
import ClientInvoiceList from "./ClientInvoiceList";
import PackageSelectionWizard from "./PackageSelectionWizard";
import DesignViewer from "./DesignViewer";
import LaunchWizard from "./LaunchWizard";
import { motion, AnimatePresence } from "framer-motion";
import { LaunchSettings } from "@/types/database";
import { Timestamp, serverTimestamp } from "firebase/firestore";

interface ClientProjectDetailProps {
    project: ProjectData;
    onUpdate?: () => void;
    onBack: () => void;
}

export default function ClientProjectDetail({ project, onUpdate, onBack }: ClientProjectDetailProps) {
    const [viewingDesign, setViewingDesign] = useState<ProjectDesign | null>(null);
    const [activeTab, setActiveTab] = useState<"designs" | "assets" | "invoices" | "dev">("designs");
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);
    const [showWizardForDesign, setShowWizardForDesign] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [sendingComment, setSendingComment] = useState(false);
    const [showLaunchWizard, setShowLaunchWizard] = useState(false);

    const handleApproveClick = (designId: string, feedbackText?: string) => {
        if (feedbackText) {
            setFeedback(prev => ({ ...prev, [designId]: feedbackText }));
        }
        setShowWizardForDesign(designId);
        setViewingDesign(null);
    };

    const handleWizardComplete = async (selection: { packageId: string; addons: string[]; billingCycle: "monthly" | "yearly"; commitmentFee: number }) => {
        if (!showWizardForDesign) return;
        setSubmitting(showWizardForDesign);
        try {
            const { commitmentFee, ...packageSelection } = selection;
            const updatedProjectData: Partial<ProjectData> = { packageSelection };
            
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
                setViewingDesign(prev => prev ? { ...prev, status: "rejected", feedback: textToUse } : null);
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
                createdAt: serverTimestamp()
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
            case "completed": return "from-green-500 to-emerald-600";
            case "in_progress": return "from-blue-500 to-indigo-600";
            case "on_hold": return "from-amber-500 to-orange-600";
            default: return "from-slate-500 to-slate-600";
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

            {/* Project Header Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0F1C] p-8 md:p-12 shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-blue-400" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-montserrat font-extrabold mb-4 text-white tracking-tight leading-tight">
                        {project.title}
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Beheer je project, bekijk de laatste ontwerpen en houd je administratie bij op één centrale plek.
                    </p>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("designs")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === "designs" 
                        ? "bg-white text-navy shadow-lg shadow-white/10" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <Layout className="w-4 h-4" />
                    <span>Vibecheck</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "designs" ? "bg-navy/10 text-navy" : "bg-white/10 text-slate-400"}`}>
                        {project.designs.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("assets")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === "assets" 
                        ? "bg-white text-navy shadow-lg shadow-white/10" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>Assets</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "assets" ? "bg-navy/10 text-navy" : "bg-white/10 text-slate-400"}`}>
                        {project.assets.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === "invoices" 
                        ? "bg-white text-navy shadow-lg shadow-white/10" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <Receipt className="w-4 h-4" />
                    <span>Facturen</span>
                </button>
                {(project.status === "development" || project.status === "qa" || project.testLink) && (
                    <button
                        onClick={() => setActiveTab("dev")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === "dev" 
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 border-blue-400" 
                            : "text-blue-400 hover:text-white hover:bg-blue-500/10 border-blue-500/30"
                        } border`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Preview & QA</span>
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === "designs" && (
                        <motion.section 
                            key="designs"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-baseline justify-between mb-2">
                                <h3 className="text-2xl font-bold font-montserrat text-white">Vibecheck</h3>
                                <p className="text-sm text-slate-500 font-medium">Klik op een ontwerp om de &apos;vibe&apos; te checken.</p>
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic mb-6">
                                &quot;In deze fase zijn we op zoek naar de juiste <strong>&apos;vibe&apos;</strong>. Passeert dit design de vibe check? Dan kunnen we door. De details schaven we later makkelijk bij.&quot;
                            </p>

                            <div className="grid grid-cols-1 gap-6">
                                {project.designs.length === 0 ? (
                                    <div className="relative overflow-hidden p-20 border border-white/10 rounded-[3rem] bg-white/[0.02] flex flex-col items-center justify-center text-center">
                                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                                        <div className="relative">
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-6 backdrop-blur-xl group-hover:scale-110 transition-all duration-500">
                                                <Layout className="w-12 h-12 text-slate-500" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">Geen ontwerpen gevonden</h4>
                                            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                                We hebben een design voor je klaar staan! Bekijk het hieronder en laat ons weten wat je ervan vindt. Je kunt direct feedback achterlaten of het design goedkeuren als het naar wens is.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    project.designs.map((design: ProjectDesign, index: number) => (
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
                                                            {design.status === 'pending' ? 'vibecheck' : design.status}
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
                                                        <span>Vibe Check</span>
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
                                <p className="text-sm text-slate-500 font-medium">Alle geüploade bestanden voor dit project.</p>
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

                    {activeTab === "dev" && (
                        <motion.section 
                            key="dev"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Website Preview */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold font-montserrat text-white flex items-center gap-2">
                                            Live Preview <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        </h3>
                                        <a href={project.testLink} target="_blank" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                            Open in nieuw tabblad <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    
                                    <div className="relative rounded-3xl border border-white/10 bg-white/5 overflow-hidden aspect-video shadow-2xl">
                                        {project.testLink ? (
                                            <iframe 
                                                src={project.testLink} 
                                                className="w-full h-full border-none bg-white"
                                                title="Website Preview"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                                                <Loader2 className="w-10 h-10 animate-spin opacity-20" />
                                                <p className="text-sm italic">Systeem wordt voorbereid...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: QA Chat */}
                                <div className="w-full md:w-96 flex flex-col space-y-4">
                                    <h3 className="text-2xl font-bold font-montserrat text-white flex items-center gap-2">
                                        Feedback Chat <MessageSquare className="w-5 h-5 text-blue-400" />
                                    </h3>
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[500px]">
                                        <div className="p-4 border-b border-white/10 bg-white/5">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct contact met de ontwikkelaar</p>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {(!project.qaComments || project.qaComments.length === 0) ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 text-center p-6">
                                                    <Sparkles className="w-8 h-8 opacity-20" />
                                                    <p className="text-xs italic">De website is nu live in testomgeving. Heb je opmerkingen of feedback? Laat het ons hier weten!</p>
                                                </div>
                                            ) : (
                                                project.qaComments.map((comment) => (
                                                    <div key={comment.id} className={`flex flex-col ${comment.authorRole === 'client' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                                            comment.authorRole === 'client' 
                                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                                                                : 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                                                        }`}>
                                                            {comment.text}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                                                            {comment.authorName || (comment.authorRole === 'admin' ? 'Admin' : 'Klant')} • {comment.createdAt instanceof Timestamp 
                                                                ? comment.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : comment.createdAt && typeof comment.createdAt === 'object' && 'seconds' in comment.createdAt
                                                                    ? new Date((comment.createdAt as { seconds: number }).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                    : comment.createdAt && typeof comment.createdAt === 'string'
                                                                        ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                        : 'Net geplaatst'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-4 bg-black/20 border-t border-white/10 flex gap-2">
                                            <input 
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                                placeholder="Geef feedback..."
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button 
                                                onClick={handleAddComment}
                                                disabled={sendingComment || !newComment.trim()}
                                                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
                                            >
                                                {sendingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Launch Settings Card */}
                            {(project.status === 'qa' || project.status === 'delivered') && (
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
                                                {project.launchSettings 
                                                    ? `Gekozen optie: ${project.launchSettings.option.split('_').join(' ')}`
                                                    : 'Configureer hoe we je website live gaan zetten voor de wereld.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowLaunchWizard(true)}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 transform whitespace-nowrap"
                                    >
                                        {project.launchSettings ? 'Configuratie Aanpassen' : 'Nu Configureren'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>

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

