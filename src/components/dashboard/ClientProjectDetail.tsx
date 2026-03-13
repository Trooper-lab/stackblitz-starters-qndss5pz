"use client";

import { useState } from "react";
import { ProjectData, ProjectDesign, ProjectAsset } from "@/types/database";
import { updateClientData } from "@/lib/services/clientService";
import { updateDesignStatus, updateProject } from "@/lib/services/projectService";
import { generateCommitmentFeeInvoice } from "@/lib/services/invoiceService";
import { CheckCircle2, XCircle, ExternalLink, Download, FileText, ImageIcon, Loader2, Layout, Receipt } from "lucide-react";
import Image from "next/image";
import ClientInvoiceList from "./ClientInvoiceList";
import PackageSelectionWizard from "./PackageSelectionWizard";

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
    const [showWizardForDesign, setShowWizardForDesign] = useState<string | null>(null);

    const handleApproveClick = (designId: string) => {
        if (!project.packageSelection) {
            setShowWizardForDesign(designId);
        } else {
            handleApprove(designId);
        }
    };

    const handleWizardComplete = async (selection: { packageId: string; addons: string[]; billingCycle: "monthly" | "yearly"; commitmentFee: number }) => {
        if (!showWizardForDesign) return;
        setSubmitting(showWizardForDesign);
        try {
            const { commitmentFee, ...packageSelection } = selection;
            await updateProject(project.id, { packageSelection });
            await updateDesignStatus(project.id, showWizardForDesign, "approved");
            
            if (commitmentFee > 0) {
                await generateCommitmentFeeInvoice(project.id, project.clientId, commitmentFee);
            }

            // Convert lead to active client
            await updateClientData(project.clientId, { status: "active" });

            onUpdate();
            setShowWizardForDesign(null);
        } catch (error) {
            console.error("Error saving package and approving design:", error);
        } finally {
            setSubmitting(null);
        }
    };

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
            case "approved": return "text-green-700 bg-green-50 border-green-200";
            case "rejected": return "text-red-700 bg-red-50 border-red-200";
            default: return "text-navy bg-blue-50 border-blue-200";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-sm text-navy hover:text-navy-light transition-colors flex items-center gap-2"
                >
                    ← Terug naar overzicht
                </button>
                <div className={`px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ")}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-3xl font-montserrat font-extrabold mb-2 text-navy">{project.title}</h2>
                <p className="text-slate-500 text-lg">Hier kun je de voortgang van je project volgen, designs goedkeuren en facturen inzien.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("designs")}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "designs" ? "text-navy" : "text-slate-500 hover:text-slate-800"}`}
                >
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Ontwerpen ({project.designs.length})
                    </div>
                    {activeTab === "designs" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-navy" />}
                </button>
                <button
                    onClick={() => setActiveTab("assets")}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "assets" ? "text-navy" : "text-slate-500 hover:text-slate-800"}`}
                >
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Assets ({project.assets.length})
                    </div>
                    {activeTab === "assets" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-navy" />}
                </button>
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "invoices" ? "text-navy" : "text-slate-500 hover:text-slate-800"}`}
                >
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Facturen
                    </div>
                    {activeTab === "invoices" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-navy" />}
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === "designs" && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-navy" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat text-slate-800">Ontwerpen ter Review</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {project.designs.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 bg-slate-50">
                                    Nog geen ontwerpen beschikbaar.
                                </div>
                            ) : (
                                project.designs.map((design: ProjectDesign) => (
                                    <div key={design.id} className="bg-white border border-slate-200 rounded-xl p-6 transition-all hover:border-navy hover:shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-bold text-lg text-slate-900">{design.name}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(design.status)}`}>
                                                        {design.status}
                                                    </span>
                                                </div>
                                                {design.description && <p className="text-sm text-slate-600">{design.description}</p>}
                                                {design.feedback && design.status === "rejected" && (
                                                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 shadow-sm mt-3">
                                                        <strong>Jouw feedback:</strong> {design.feedback}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <a
                                                    href={design.htmlUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-navy text-white hover:bg-navy-light rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Bekijk Ontwerp
                                                </a>

                                                {design.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            disabled={!!submitting}
                                                            onClick={() => handleApproveClick(design.id)}
                                                            className="p-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg transition-all"
                                                            title="Goedkeuren"
                                                        >
                                                            {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                        </button>
                                                        <button
                                                            disabled={!!submitting}
                                                            onClick={() => handleReject(design.id)}
                                                            className="p-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg transition-all"
                                                            title="Afwijzen / Feedback"
                                                        >
                                                            {submitting === design.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {showFeedbackInput === design.id && (
                                            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 border-t border-slate-100 pt-6">
                                                <textarea
                                                    placeholder="Wat kan er beter? Geef hier je feedback..."
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all min-h-[100px] shadow-sm"
                                                    value={feedback[design.id] || ""}
                                                    onChange={(e) => setFeedback({ ...feedback, [design.id]: e.target.value })}
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setShowFeedbackInput(null)}
                                                        className="px-4 py-2 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors"
                                                    >
                                                        Annuleren
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(design.id)}
                                                        disabled={!feedback[design.id]}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 shadow-sm"
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
                            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <ImageIcon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat text-slate-800">Project Assets</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {project.assets.length === 0 ? (
                                <div className="col-span-full p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 bg-slate-50">
                                    Nog geen assets geüpload.
                                </div>
                            ) : (
                                project.assets.map((asset: ProjectAsset) => (
                                    <div key={asset.id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all">
                                        {asset.type === "photo" ? (
                                            <Image src={asset.url} alt={asset.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-all group-hover:scale-105 duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50">
                                                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                                                <span className="text-xs text-center font-medium text-slate-600 truncate w-full">{asset.name}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center duration-300 backdrop-blur-[2px]">
                                            <a
                                                href={asset.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white hover:bg-slate-50 text-navy rounded-full transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                title="Downloaden"
                                            >
                                                <Download className="w-5 h-5" />
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
                            <div className="p-2 bg-green-50 border border-green-100 rounded-lg">
                                <Receipt className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold font-montserrat text-slate-800">Facturen & Betalingen</h3>
                        </div>
                        <ClientInvoiceList projectId={project.id} />
                    </section>
                )}
            </div>

            {showWizardForDesign && (
                <PackageSelectionWizard
                    onClose={() => setShowWizardForDesign(null)}
                    onComplete={handleWizardComplete}
                    isSubmitting={!!submitting && submitting === showWizardForDesign}
                />
            )}
        </div>
    );
}
