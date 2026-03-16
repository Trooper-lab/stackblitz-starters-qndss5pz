"use client";

import { useState, useEffect } from "react";
import { ProjectData, ProjectAsset, ProjectDesign, ProjectStatus, ClientStatus, QAComment } from "@/types/database";
import { updateProject } from "@/lib/services/projectService";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import FileUpload from "./FileUpload";
import { ChevronLeft, Check, CheckCircle, FileText, Upload, ExternalLink, ArrowRight, Layout, Plus, MessageSquare, Bell, Wrench, Globe, Receipt } from "lucide-react";
import Image from "next/image";
import { notifyReviewDesign, notifyProjectUpdate } from "@/lib/services/notificationService";
import AddDesignModal from "./AddDesignModal";
import DesignViewer from "./DesignViewer";
import InvoiceManager from "./InvoiceManager";

const STEPS = [
    { key: "intake" as const, label: "Intake", desc: "Logo, foto's & content", icon: FileText, color: "blue" },
    { key: "design_review" as const, label: "Design", desc: "Design goedkeuring", icon: Layout, color: "purple" },
    { key: "development" as const, label: "Development", desc: "Bouwen & Techniek", icon: Wrench, color: "amber" },
    { key: "qa" as const, label: "QA Check", desc: "Testen & Feedback", icon: CheckCircle, color: "orange" },
    { key: "delivered" as const, label: "Oplevering", desc: "Live & Facturatie", icon: Receipt, color: "emerald" },
];

const COLOR = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", ring: "ring-blue-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", ring: "ring-purple-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", ring: "ring-amber-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", ring: "ring-orange-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "ring-emerald-500" },
};

interface ProjectDetailProps {
    project: ProjectData;
    clientId: string;
    clientStatus?: ClientStatus;
    clientEmail?: string;
    onBack: () => void;
    onUpdate: (updated: ProjectData) => void;
}

export default function ProjectDetail({ project: initialProject, clientId, clientStatus, clientEmail, onBack, onUpdate }: ProjectDetailProps) {
    const [project, setProject] = useState<ProjectData>(initialProject);
    const [status, setStatus] = useState<ProjectStatus>(project.status);
    const [saving, setSaving] = useState(false);
    const [assets, setAssets] = useState<ProjectAsset[]>(project.assets || []);
    const [designs, setDesigns] = useState<ProjectDesign[]>(project.designs || []);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [editingDesign, setEditingDesign] = useState<ProjectDesign | null>(null);
    const [viewingDesign, setViewingDesign] = useState<ProjectDesign | null>(null);
    const [notifSent, setNotifSent] = useState<string | null>(null);
    const [testLink, setTestLink] = useState(project.testLink || "");
    const [qaComments, setQaComments] = useState<QAComment[]>(project.qaComments || []);
    const [newComment, setNewComment] = useState("");

    // Real-time listener for project updates
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "projects", initialProject.id), (doc) => {
            if (doc.exists()) {
                const updatedData = { id: doc.id, ...doc.data() } as ProjectData;
                setProject(prev => {
                    // Only update testLink if it changed on the server to avoid overwriting user input
                    if (updatedData.testLink !== prev.testLink) {
                        setTestLink(updatedData.testLink || "");
                    }
                    return updatedData;
                });
                setStatus(updatedData.status);
                setAssets(updatedData.assets || []);
                setDesigns(updatedData.designs || []);
                setQaComments(updatedData.qaComments || []);
                onUpdate(updatedData);
            }
        });
        return () => unsub();
    }, [initialProject.id, onUpdate]);

    const sendNotification = async (type: "design" | "qa" | "delivered") => {
        try {
            const email = clientEmail || project.clientEmail;
            if (type === "design") {
                const latestDesign = designs[designs.length - 1];
                await notifyReviewDesign(clientId, project.id, latestDesign?.name || project.title, email);
            } else if (type === "qa") {
                await notifyProjectUpdate(clientId, project.id, `Je website "${project.title}" is klaar voor QA. Neem contact op als je feedback hebt.`, email);
            } else {
                await notifyProjectUpdate(clientId, project.id, `Goed nieuws! Je website "${project.title}" is opgeleverd.`, email);
            }
            setNotifSent(type);
            setTimeout(() => setNotifSent(null), 3000);
        } catch (e) { console.error(e); }
    };

    const currentIdx = STEPS.findIndex(s => s.key === status);
    const currentStep = STEPS[currentIdx];
    const c = COLOR[currentStep.color as keyof typeof COLOR];

    const advanceToStep = async (newStatus: ProjectStatus) => {
        setSaving(true);
        try {
            await updateProject(project.id, { status: newStatus });
            setStatus(newStatus);
            onUpdate({ ...project, status: newStatus, assets, designs });
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleAssetUpload = async (newAsset: ProjectAsset) => {
        const updated = [...assets, newAsset];
        setAssets(updated);
        await updateProject(project.id, { assets: updated });
        onUpdate({ ...project, assets: updated, designs });
    };

    const handleAddDesign = async (design: ProjectDesign) => {
        // If editing, find and replace the existing design
        const existingIdx = designs.findIndex(d => d.id === design.id);
        let updated: ProjectDesign[];
        
        if (existingIdx >= 0) {
            updated = [...designs];
            updated[existingIdx] = design;
        } else {
            updated = [...designs, design];
        }
        
        setDesigns(updated);
        await updateProject(project.id, { designs: updated });
        onUpdate({ ...project, designs: updated, assets });
        setShowDesignModal(false);
        setEditingDesign(null);
    };

    const handleUpdateDesignFeedback = async (designId: string, feedback: string) => {
        const updated = designs.map(d => 
            d.id === designId ? { ...d, feedback } : d
        );
        setDesigns(updated);
        await updateProject(project.id, { designs: updated });
        onUpdate({ ...project, designs: updated, assets });
    };

    const handleSaveTestLink = async () => {
        setSaving(true);
        try {
            await updateProject(project.id, { testLink });
            onUpdate({ ...project, testLink, assets, designs, qaComments });
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSaving(true);
        try {
            const comment: QAComment = {
                id: Math.random().toString(36).substr(2, 9),
                authorId: "admin",
                authorName: "Admin",
                authorRole: "admin",
                text: newComment,
                createdAt: serverTimestamp()
            };
            const updated = [...qaComments, comment];
            setQaComments(updated);
            await updateProject(project.id, { qaComments: updated });
            setNewComment("");
            onUpdate({ ...project, qaComments: updated, assets, designs, testLink });
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <>
            {showDesignModal && (
                <AddDesignModal 
                    onClose={() => {
                        setShowDesignModal(false);
                        setEditingDesign(null);
                    }} 
                    onAdd={handleAddDesign} 
                    defaultName={designs.length === 0 && clientStatus === "lead" ? "Gratis Website Ontwerp V1" : ""}
                    initialDesign={editingDesign}
                />
            )}
            {viewingDesign && (
                <DesignViewer 
                    design={viewingDesign} 
                    onClose={() => setViewingDesign(null)}
                    isAdmin={true}
                    onEdit={(design) => {
                        setEditingDesign(design);
                        setViewingDesign(null);
                        setShowDesignModal(true);
                    }}
                    onSaveFeedback={(designId, feedback) => handleUpdateDesignFeedback(designId, feedback)}
                />
            )}

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Back button */}
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Terug naar projecten
                </button>

                {/* Title */}
                <div>
                    <div className="flex items-center gap-3 items-end mb-1">
                        <h2 className="text-3xl font-extrabold font-montserrat text-navy leading-none">{project.title}</h2>
                        {clientStatus === "lead" && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-200">
                                Lead Project
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500">Project ID: {project.id.slice(0, 12)}...</p>
                </div>

                {/* Package Selection Details (if active/converted) */}
                {project.packageSelection && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Gekozen pakket: <span className="text-emerald-600">{project.packageSelection.packageId}</span></h4>
                                <p className="text-xs text-slate-500">
                                    Facturatie: {project.packageSelection.billingCycle === "monthly" ? "Per maand" : "Per jaar"}
                                    {project.packageSelection.addons.length > 0 && ` • Add-ons: ${project.packageSelection.addons.join(", ")}`}
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                            Klant Geconverteerd
                        </div>
                    </div>
                )}

                {/* ── 5-STEP STEPPER ── */}
                <div className="grid grid-cols-5 gap-3">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isDone = i < currentIdx;
                        const isActive = i === currentIdx;
                        const sc = COLOR[step.color as keyof typeof COLOR];
                        return (
                            <button
                                key={step.key}
                                onClick={() => !saving && advanceToStep(step.key)}
                                disabled={saving}
                                className={`relative flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all ${isActive
                                    ? `${sc.border} ${sc.bg} ring-2 ${sc.ring}/20`
                                    : isDone
                                        ? "border-slate-200 bg-white hover:bg-slate-50"
                                        : "border-slate-100 bg-slate-50/50 opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive || isDone ? sc.bg : "bg-slate-100"}`}>
                                    {isDone
                                        ? <Check className={`w-4 h-4 ${sc.text}`} />
                                        : <Icon className={`w-4 h-4 ${isActive ? sc.text : "text-slate-400"}`} />
                                    }
                                </div>
                                <div>
                                    <p className={`text-xs font-bold ${isActive ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-500'}`}>{step.label}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                                </div>
                                {isActive && (
                                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-${step.color}-500 animate-pulse`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── STEP CONTENT ── */}
                <div className={`rounded-2xl border ${c.border} ${c.bg} p-1`}>
                    <div className="bg-white rounded-xl p-6 space-y-6 shadow-sm">

                        {/* STEP 1: INTAKE */}
                        {status === "intake" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
                                        <div>
                                            <h3 className="font-bold text-lg text-navy">Intake & Assets</h3>
                                            <p className="text-xs text-slate-500">Upload logo&apos;s, foto&apos;s en documenten van de klant</p>
                                        </div>
                                    </div>
                                    <FileUpload projectId={project.id} onUploadComplete={handleAssetUpload} />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {assets.length === 0 ? (
                                        <div className="col-span-full py-16 flex flex-col items-center gap-3 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-slate-500">
                                            <Upload className="w-8 h-8 opacity-40" />
                                            <p className="text-sm">Nog geen assets geüpload</p>
                                        </div>
                                    ) : (
                                        assets.map((asset, i) => (
                                            <div key={i} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden aspect-square hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                                                {asset.type === "photo" || asset.type === "logo" ? (
                                                    <Image src={asset.url} alt={asset.name} width={200} height={200} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-500">
                                                        <FileText className="w-7 h-7 opacity-20 mb-2" />
                                                        <span className="text-[10px] truncate w-full">{asset.name}</span>
                                                    </div>
                                                )}
                                                <a href={asset.url} target="_blank" className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                                    <div className="bg-white text-blue-600 p-2 rounded-full shadow-lg">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </div>
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => advanceToStep("design_review")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white hover:bg-navy-light font-bold text-sm transition-all shadow-lg shadow-navy/20 disabled:opacity-50"
                                    >
                                        Naar Design Review <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DESIGN REVIEW */}
                        {status === "design_review" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-xl"><Layout className="w-5 h-5 text-purple-600" /></div>
                                        <div>
                                            <h3 className="font-bold text-lg text-navy">Designs voor Review</h3>
                                            <p className="text-xs text-slate-500">Voeg design-links toe die de klant kan bekijken en goedkeuren</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDesignModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        <Plus className="w-4 h-4" /> Design Toevoegen
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {designs.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center gap-3 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-slate-500">
                                            <Layout className="w-8 h-8 opacity-40" />
                                            <p className="text-sm">Nog geen designs toegevoegd</p>
                                            {clientStatus === "lead" && (
                                                <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                                                    <p className="text-xs text-purple-600 font-medium px-4 py-1 bg-purple-50 border border-purple-100 rounded-full">
                                                        ✨ Tip: Start met het eerste gratis ontwerp voor deze lead
                                                    </p>
                                                    <button
                                                        onClick={() => setShowDesignModal(true)}
                                                        className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                                                    >
                                                        Gratis Ontwerp Toevoegen
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        designs.map((design) => {
                                            const statusColor = design.status === "approved"
                                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                : design.status === "rejected"
                                                    ? "text-red-700 bg-red-50 border-red-200"
                                                    : "text-amber-700 bg-amber-50 border-amber-200";
                                            return (
                                                <div key={design.id} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                            <Layout className="w-5 h-5 text-slate-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{design.name}</p>
                                                            {design.description && <p className="text-xs text-slate-500 mt-0.5">{design.description}</p>}
                                                            {design.feedback && (
                                                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                                    <MessageSquare className="w-3 h-3" /> {design.feedback}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${statusColor}`}>
                                                            {design.status === "approved" ? "Goedgekeurd" : design.status === "rejected" ? "Afgewezen" : "In Review"}
                                                        </span>
                                                        <button
                                                            onClick={() => setViewingDesign(design)}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-xs font-medium bg-white"
                                                        >
                                                            Bekijk <ExternalLink className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => sendNotification("design")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            notifSent === "design"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                        }`}
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                        {notifSent === "design" ? "✓ Notificatie Verzonden!" : "Klant Notificeren"}
                                    </button>
                                    <button
                                        onClick={() => advanceToStep("development")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white hover:bg-navy-light font-bold text-sm transition-all shadow-lg shadow-navy/20 disabled:opacity-50"
                                    >
                                        Naar Development <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DEVELOPMENT */}
                        {status === "development" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl"><Wrench className="w-5 h-5 text-amber-600" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-navy">Development</h3>
                                        <p className="text-xs text-slate-500">Bouw- en technische fase. Houd hier interne voortgang bij.</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ExternalLink className="w-4 h-4 text-amber-600" />
                                        <h4 className="font-bold text-sm text-amber-900">Website Test Link</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="url" 
                                            value={testLink}
                                            onChange={(e) => setTestLink(e.target.value)}
                                            placeholder="https://test-omgeving.nl"
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm"
                                        />
                                        <button 
                                            onClick={handleSaveTestLink}
                                            disabled={saving || testLink === project.testLink}
                                            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all disabled:opacity-50"
                                        >
                                            Opslaan
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-amber-700/70 italic">Deze link wordt getoond in het dashboard van de klant voor directe preview.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: "Approved Designs", value: designs.filter(d => d.status === "approved").length, total: designs.length, color: "green" },
                                        { label: "Assets Beschikbaar", value: assets.length, total: null, color: "blue" },
                                        { label: "In Review", value: designs.filter(d => d.status === "pending").length, total: null, color: "yellow" },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                            <p className="text-2xl font-extrabold font-montserrat text-slate-900">
                                                {stat.value}{stat.total !== null && <span className="text-sm text-slate-400">/{stat.total}</span>}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={() => advanceToStep("design_review")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug
                                    </button>
                                    <button
                                        onClick={() => advanceToStep("qa")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white hover:bg-navy-light font-bold text-sm transition-all shadow-lg shadow-navy/20 disabled:opacity-50"
                                    >
                                        Naar QA Testen <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: QA */}
                        {status === "qa" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl"><CheckCircle className="w-5 h-5 text-orange-600" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-navy">Quality Assurance (QA)</h3>
                                        <p className="text-xs text-slate-500">Controleer op bugs en stuur voor laatste test naar klant.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
                                        <ExternalLink className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs font-medium text-slate-700">Test Link:</span>
                                        <a href={testLink} target="_blank" className="text-xs text-blue-600 hover:underline truncate flex-1">{testLink}</a>
                                    </div>

                                    {/* Admin View: Launch Settings (Read-Only/Summary) */}
                                    {project.launchSettings && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4">
                                            <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                                                <Globe className="w-5 h-5 text-blue-600" />
                                                <h4 className="font-bold text-sm text-navy uppercase tracking-wider">Launch Configuratie</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <p className="text-slate-500 font-medium">Gekozen Optie</p>
                                                    <p className="text-navy font-bold mt-0.5">{project.launchSettings.option.split('_').join(' ').toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 font-medium">Domeinnaam</p>
                                                    <p className="text-navy font-bold mt-0.5">{project.launchSettings.domainName}</p>
                                                </div>
                                                {project.launchSettings.currentProvider && (
                                                    <div>
                                                        <p className="text-slate-500 font-medium">Huidige Provider</p>
                                                        <p className="text-navy font-bold mt-0.5">{project.launchSettings.currentProvider}</p>
                                                    </div>
                                                )}
                                                {project.launchSettings.loginDetails && (
                                                    <div>
                                                        <p className="text-slate-500 font-medium">Login Details / Token</p>
                                                        <p className="text-navy font-bold mt-0.5">{project.launchSettings.loginDetails}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {project.launchSettings.confirmedMove && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold">✓ Toestemming</span>}
                                                {project.launchSettings.confirmedBackup && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold">✓ Backup Bevestigd</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* QA Chat Area */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                                        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-navy">QA Feedback Chat</h4>
                                            <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-full">Klant & Admin</span>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {qaComments.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                                    <p className="text-xs italic">Nog geen feedback ontvangen</p>
                                                </div>
                                            ) : (
                                                qaComments.map((comment) => (
                                                    <div key={comment.id} className={`flex flex-col ${comment.authorRole === 'admin' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                                            comment.authorRole === 'admin' 
                                                                ? 'bg-navy text-white rounded-tr-none' 
                                                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                                        }`}>
                                                            {comment.text}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                                                            {comment.authorName || (comment.authorRole === 'admin' ? 'Admin' : 'Klant')} • {
                                                                comment.createdAt instanceof Timestamp 
                                                                    ? comment.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                    : (comment.createdAt && typeof comment.createdAt === 'object' && 'seconds' in comment.createdAt)
                                                                        ? new Date((comment.createdAt as { seconds: number }).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                        : comment.createdAt && typeof comment.createdAt === 'string'
                                                                            ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                            : '...'
                                                            }
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
                                            <input 
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                                placeholder="Typ een bericht..."
                                                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-navy/5"
                                            />
                                            <button 
                                                onClick={handleAddComment}
                                                disabled={saving || !newComment.trim()}
                                                className="p-2 bg-navy text-white rounded-xl hover:bg-navy-light transition-all disabled:opacity-50"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => sendNotification("qa")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            notifSent === "qa"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                        }`}
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                        {notifSent === "qa" ? "✓ Notificatie Verzonden!" : "Klant Notificeren"}
                                    </button>
                                    <button
                                        onClick={() => advanceToStep("delivered")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white hover:bg-navy-light font-bold text-sm transition-all shadow-lg shadow-navy/20 disabled:opacity-50"
                                    >
                                        Markeer als Opgeleverd <CheckCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: DELIVERED */}
                        {status === "delivered" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl"><Receipt className="w-5 h-5 text-emerald-600" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-navy">Oplevering & Facturatie</h3>
                                        <p className="text-xs text-slate-500">Project is afgerond. Genereer en verstuur de factuur.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <p className="text-sm text-emerald-800 font-medium">Website is opgeleverd aan de klant.</p>
                                    </div>
                                    <button
                                        onClick={() => sendNotification("delivered")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                                            notifSent === "delivered"
                                                ? "bg-green-100 text-green-700 border-green-300"
                                                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                        }`}
                                    >
                                        <Bell className="w-3.5 h-3.5" />
                                        {notifSent === "delivered" ? "✓ Verzonden!" : "Klant Notificeren"}
                                    </button>
                                </div>

                                <InvoiceManager project={project} clientId={clientId} clientEmail={clientEmail || project.clientEmail} />

                                <div className="flex justify-start">
                                    <button onClick={() => advanceToStep("qa")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug naar QA
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
