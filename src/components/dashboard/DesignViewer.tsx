"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Monitor, CheckCircle2, XCircle, Loader2, MessageSquare, ChevronLeft, Sparkles, Send } from "lucide-react";
import { ProjectDesign } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";

interface DesignViewerProps {
    design: ProjectDesign;
    onClose: () => void;
    onApprove?: (designId: string, feedback?: string) => void;
    onReject?: (designId: string, feedback: string) => void;
    onEdit?: (design: ProjectDesign) => void;
    onSaveFeedback?: (designId: string, feedback: string) => void;
    isSubmitting?: boolean;
    isAdmin?: boolean;
}

export default function DesignViewer({ 
    design, 
    onClose, 
    onApprove, 
    onReject, 
    onEdit,
    onSaveFeedback,
    isSubmitting = false,
    isAdmin = false 
}: DesignViewerProps) {
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
    const [feedback, setFeedback] = useState(design.feedback || "");
    const [showSidebar, setShowSidebar] = useState(true);

    // Prevent body scroll when viewer is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleApprove = () => {
        if (onApprove) onApprove(design.id, feedback.trim());
    };

    const handleReject = () => {
        if (onReject && feedback.trim()) {
            onReject(design.id, feedback.trim());
        }
    };

    const handleSaveFeedback = () => {
        if (onSaveFeedback && feedback.trim()) {
            onSaveFeedback(design.id, feedback.trim());
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex bg-navy/95 backdrop-blur-2xl"
        >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Premium Toolbar */}
                <div className="h-20 bg-white/[0.03] backdrop-blur-3xl border-b border-white/10 flex items-center justify-between px-8 shrink-0 relative z-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                    <div className="flex items-center gap-6 relative">
                        <button 
                            onClick={onClose}
                            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                        </button>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <h2 className="text-white font-montserrat font-extrabold uppercase tracking-tight text-lg leading-none">{design.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/20">Concept v1</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Vibecheck</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 rounded-2xl p-1.5 flex items-center border border-white/10 gap-1">
                            <button
                                onClick={() => setViewMode("desktop")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === "desktop" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <Monitor className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Desktop</span>
                            </button>
                            <button
                                onClick={() => setViewMode("mobile")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === "mobile" ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                            >
                                <Smartphone className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Mobiel</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`p-3 rounded-2xl transition-all border ${showSidebar ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Viewport Container */}
                <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 md:p-12">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={viewMode}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className={`
                                relative shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white overflow-hidden
                                ${viewMode === "desktop" ? "w-full h-full rounded-2xl" : "w-[375px] h-[720px] rounded-[3.5rem] border-[14px] border-slate-900"}
                            `}
                        >
                            {viewMode === "mobile" && (
                                <>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-20 flex items-center justify-center">
                                        <div className="w-12 h-1 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/40 rounded-full z-20" />
                                </>
                            )}
                            <iframe
                                {...(design.htmlCode ? { srcDoc: design.htmlCode } : { src: design.htmlUrl })}
                                className="w-full h-full border-none"
                                title={design.name}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Background Gradients */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                </div>
            </div>

            {/* Premium Sidebar */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div 
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-navy border-l border-white/10 flex flex-col z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                </div>
                                <h3 className="font-display font-black uppercase tracking-tight text-white">Vibecheck</h3>
                            </div>
                            <button 
                                onClick={() => setShowSidebar(false)} 
                                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            {/* Status Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-accent" />
                                    Huidige Status
                                </label>
                                <div className={`p-4 rounded-[1.5rem] border flex items-center gap-4 ${
                                    design.status === "approved" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                    design.status === "rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                    "bg-accent/10 border-accent/20 text-accent"
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        design.status === "approved" ? "bg-green-500/20" :
                                        design.status === "rejected" ? "bg-red-500/20" :
                                        "bg-accent/20"
                                    }`}>
                                        {design.status === "approved" ? <CheckCircle2 size={20} /> : 
                                         design.status === "rejected" ? <XCircle size={20} /> : 
                                         <ClockIcon size={20} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black uppercase tracking-tight">
                                            {design.status === "approved" ? "Goedgekeurd" : design.status === "rejected" ? "Afgewezen" : "In Afwachting"}
                                        </span>
                                        <span className="text-[10px] opacity-60 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Vibecheck fase is actief</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                    &quot;In deze fase zijn we op zoek naar de juiste <strong>&apos;vibe&apos;</strong>. Passeert dit design de vibe check? Dan kunnen we door. De details schaven we later makkelijk bij.&quot;
                                </p>
                            </div>

                            {/* Description Section */}
                            {design.description && (
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-accent" />
                                        Toelichting van Designer
                                    </label>
                                    <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm text-slate-300 leading-relaxed italic relative">
                                        <div className="text-4xl text-accent/20 absolute -top-2 left-4 font-serif">&quot;</div>
                                        {design.description}
                                    </div>
                                </div>
                            )}

                            {/* Feedback Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-accent" />
                                    Jouw Feedback
                                </label>
                                <div className="group relative">
                                    <textarea
                                        placeholder="Wat vind je van de stijl? Kleuren? Opbouw? Laat het ons weten..."
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm text-white focus:border-accent/50 focus:bg-white/10 outline-none transition-all min-h-[180px] shadow-inner placeholder:text-slate-600 resize-none"
                                        value={feedback}
                                        readOnly={design.status !== "pending" && !isAdmin}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        {isAdmin && feedback !== design.feedback && (
                                            <button 
                                                onClick={handleSaveFeedback}
                                                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white transition-all shadow-lg"
                                                title="Feedback opslaan"
                                            >
                                                <Send size={14} />
                                            </button>
                                        )}
                                        <div className="opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity flex items-center">
                                            <Send size={16} className="text-accent" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-center">
                                    We gebruiken deze feedback om het ontwerp tot in de puntjes te verfijnen voor jouw business.
                                </p>
                            </div>
                        </div>

                        {/* Sticky Footer Actions */}
                        <div className="p-8 bg-white/5 border-t border-white/10">
                            {design.status === "pending" && !isAdmin ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting || !feedback.trim()}
                                        onClick={handleReject}
                                        className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-3xl text-slate-400 hover:text-red-400 transition-all group disabled:opacity-30 shadow-lg"
                                    >
                                        <XCircle className="w-8 h-8 mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Feedback geven</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.5)" }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isSubmitting}
                                        onClick={handleApprove}
                                        className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl text-white shadow-2xl shadow-blue-500/20 hover:brightness-110 transition-all group disabled:opacity-50 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        {isSubmitting ? (
                                            <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-8 h-8 mb-3" />
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Design Goedkeuren</span>
                                    </motion.button>
                                </div>
                            ) : isAdmin ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onEdit?.(design)}
                                        className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/30 text-slate-400 hover:text-white transition-all group shadow-lg"
                                    >
                                        <Sparkles className="w-8 h-8 mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bewerken</span>
                                    </motion.button>
                                    <div className="text-center py-4 px-2 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                                            {design.status === "pending" ? "Wachten op klant" : "Review voltooid"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-accent/10 rounded-2xl border border-accent/20">
                                    <p className="text-xs font-black uppercase tracking-widest text-accent">
                                        Review voltooid
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ClockIcon({ size }: { size: number }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
