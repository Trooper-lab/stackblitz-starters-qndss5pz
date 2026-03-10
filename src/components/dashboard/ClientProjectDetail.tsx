"use client";

import { useState } from "react";
import { ProjectData, ProjectDesign, ProjectAsset } from "@/types/database";
import { updateDesignStatus } from "@/lib/services/projectService";
import { CheckCircle2, XCircle, ExternalLink, Download, FileText, ImageIcon, Loader2, Layout, Receipt } from "lucide-react";
import Image from "next/image";
import ClientInvoiceList from "./ClientInvoiceList";

interface ClientProjectDetailProps {
    project: ProjectData;
    onUpdate: () => void;
    onBack: () => void;
}

export default function ClientProjectDetail({ project, onUpdate, onBack }: ClientProjectDetailProps) {
    const [activeTab, setActiveTab] = useState<"designs" | "assets" | "invoices">("designs");
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);

    const handleApprove = async (designId: string) => {
        setSubmitting(designId);
        try {
            await updateDesignStatus(project.id, designId, "approved");
            onUpdate();
        } catch (error) {
            console.error("Error approving design:", error);
        } finally {
            setSubmitting(null);
        }
    };

    const handleReject = async (designId: string) => {
        if (!feedback[designId]) {
            setShowFeedbackInput(designId);
            return;
        }

        setSubmitting(designId);
        try {
            await updateDesignStatus(project.id, designId, "rejected", feedback[designId]);
            onUpdate();
            setShowFeedbackInput(null);
        } catch (error) {
            console.error("Error rejecting design:", error);
        } finally {
            setSubmitting(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "rejected": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-blue-400 bg-blue-400/10 border-blue-400/20";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                    ← Terug naar overzicht
                </button>
                <div className={`px-4 py-1 rounded-full border text-xs font-medium uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ")}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-3xl font-montserrat font-extrabold mb-2">{project.title}</h2>
                <p className="opacity-50">Hier kun je de voortgang van je project volgen, designs goedkeuren en facturen inzien.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab("designs")}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "designs" ? "text-blue-400" : "opacity-50 hover:opacity-100"}`}
                >
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Ontwerpen ({project.designs.length})
                    </div>
                    {activeTab === "designs" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />}
                </button>
                <button
                    onClick={() => setActiveTab("assets")}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "assets" ? "text-blue-400" : "opacity-50 hover:opacity-100"}`}
                >
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Assets ({project.assets.length})
                    </div>
                    {activeTab === "assets" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />}
                </button>
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === "invoices" ? "text-blue-400" : "opacity-50 hover:opacity-100"}`}
                >
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Facturen
                    </div>
                    {activeTab === "invoices" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />}
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === "designs" && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat">Ontwerpen ter Review</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {project.designs.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl opacity-40">
                                    Nog geen ontwerpen beschikbaar.
                                </div>
                            ) : (
                                project.designs.map((design: ProjectDesign) => (
                                    <div key={design.id} className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:border-white/20">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-lg">{design.name}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${getStatusColor(design.status)}`}>
                                                        {design.status}
                                                    </span>
                                                </div>
                                                {design.description && <p className="text-sm opacity-60">{design.description}</p>}
                                                {design.feedback && design.status === "rejected" && (
                                                    <div className="text-sm text-red-400 bg-red-400/5 p-3 rounded-lg border border-red-400/10">
                                                        <strong>Jouw feedback:</strong> {design.feedback}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <a
                                                    href={design.htmlUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Bekijk Ontwerp
                                                </a>

                                                {design.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            disabled={!!submitting}
                                                            onClick={() => handleApprove(design.id)}
                                                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-all"
                                                            title="Goedkeuren"
                                                        >
                                                            {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                        </button>
                                                        <button
                                                            disabled={!!submitting}
                                                            onClick={() => handleReject(design.id)}
                                                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
                                                            title="Afwijzen / Feedback"
                                                        >
                                                            {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {showFeedbackInput === design.id && (
                                            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <textarea
                                                    placeholder="Wat kan er beter? Geef hier je feedback..."
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                                    value={feedback[design.id] || ""}
                                                    onChange={(e) => setFeedback({ ...feedback, [design.id]: e.target.value })}
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setShowFeedbackInput(null)}
                                                        className="px-4 py-2 text-sm opacity-50 hover:opacity-100 transition-opacity"
                                                    >
                                                        Annuleren
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(design.id)}
                                                        disabled={!feedback[design.id]}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Feedback Versturen
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "assets" && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <ImageIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat">Project Assets</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {project.assets.length === 0 ? (
                                <div className="col-span-full p-8 text-center border border-dashed border-white/10 rounded-xl opacity-40">
                                    Nog geen assets geüpload.
                                </div>
                            ) : (
                                project.assets.map((asset: ProjectAsset) => (
                                    <div key={asset.id} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden aspect-square">
                                        {asset.type === "photo" ? (
                                            <Image src={asset.url} alt={asset.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                <FileText className="w-10 h-10 text-white/20 mb-2" />
                                                <span className="text-[10px] text-center opacity-50 truncate w-full">{asset.name}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <a
                                                href={asset.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                                                title="Downloaden"
                                            >
                                                <Download className="w-5 h-5 text-white" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "invoices" && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Receipt className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat">Facturen & Betalingen</h3>
                        </div>
                        <ClientInvoiceList projectId={project.id} />
                    </section>
                )}
            </div>
        </div>
    );
}
