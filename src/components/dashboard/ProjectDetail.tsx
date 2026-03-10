"use client";

import { useState } from "react";
import { ProjectData, ProjectAsset, ProjectDesign, ProjectStatus } from "@/types/database";
import { updateProject } from "@/lib/services/projectService";
import FileUpload from "./FileUpload";
import InvoiceManager from "./InvoiceManager";
import AddDesignModal from "./AddDesignModal";
import {
    FileText, Layout, Wrench, CheckCircle, ExternalLink, MessageSquare,
    Plus, Check, ArrowRight, Upload, Receipt, ChevronLeft
} from "lucide-react";
import Image from "next/image";

interface ProjectDetailProps {
    project: ProjectData;
    clientId: string;
    onBack: () => void;
    onUpdate: (updatedProject: ProjectData) => void;
}

const STEPS: { key: ProjectStatus; label: string; icon: React.ElementType; desc: string; color: string }[] = [
    { key: "intake", label: "1. Intake", icon: FileText, desc: "Briefing & assets", color: "blue" },
    { key: "design_review", label: "2. Design Review", icon: Layout, desc: "HTML designs & review", color: "purple" },
    { key: "development", label: "3. Development", icon: Wrench, desc: "Bouw & techniek", color: "yellow" },
    { key: "delivered", label: "4. Oplevering", icon: CheckCircle, desc: "Factuur & oplevering", color: "green" },
];

const COLOR = {
    blue: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500" },
    purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500" },
    yellow: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400", ring: "ring-yellow-500" },
    green: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-400", ring: "ring-green-500" },
};

export default function ProjectDetail({ project, clientId, onBack, onUpdate }: ProjectDetailProps) {
    const [status, setStatus] = useState<ProjectStatus>(project.status);
    const [saving, setSaving] = useState(false);
    const [assets, setAssets] = useState<ProjectAsset[]>(project.assets || []);
    const [designs, setDesigns] = useState<ProjectDesign[]>(project.designs || []);
    const [showDesignModal, setShowDesignModal] = useState(false);

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
        const updated = [...designs, design];
        setDesigns(updated);
        await updateProject(project.id, { designs: updated });
        onUpdate({ ...project, designs: updated, assets });
        setShowDesignModal(false);
    };

    return (
        <>
            {showDesignModal && (
                <AddDesignModal onClose={() => setShowDesignModal(false)} onAdd={handleAddDesign} />
            )}

            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Back button */}
                <button onClick={onBack} className="flex items-center gap-2 text-sm opacity-40 hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-4 h-4" /> Terug naar projecten
                </button>

                {/* Title */}
                <div>
                    <h2 className="text-3xl font-extrabold font-montserrat">{project.title}</h2>
                    <p className="text-sm opacity-40 mt-1">Project ID: {project.id.slice(0, 12)}...</p>
                </div>

                {/* ── 4-STEP STEPPER ── */}
                <div className="grid grid-cols-4 gap-3">
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
                                        ? "border-white/10 bg-white/5 opacity-60 hover:opacity-100"
                                        : "border-white/5 bg-white/2 opacity-30 hover:opacity-60"
                                    }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive || isDone ? sc.bg : "bg-white/5"}`}>
                                    {isDone
                                        ? <Check className={`w-4 h-4 ${sc.text}`} />
                                        : <Icon className={`w-4 h-4 ${isActive ? sc.text : "text-white/30"}`} />
                                    }
                                </div>
                                <div>
                                    <p className={`text-xs font-bold ${isActive ? sc.text : isDone ? "text-white/70" : "text-white/30"}`}>{step.label}</p>
                                    <p className="text-[10px] opacity-50 mt-0.5">{step.desc}</p>
                                </div>
                                {isActive && (
                                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${sc.bg.replace("/10", "")} animate-pulse`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── STEP CONTENT ── */}
                <div className={`rounded-2xl border ${c.border}/30 ${c.bg} p-1`}>
                    <div className="bg-[#0a1020] rounded-xl p-6 space-y-6">

                        {/* STEP 1: INTAKE */}
                        {status === "intake" && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/20 rounded-xl"><FileText className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <h3 className="font-bold text-lg">Intake & Assets</h3>
                                            <p className="text-xs opacity-40">Upload logo&apos;s, foto&apos;s en documenten van de klant</p>
                                        </div>
                                    </div>
                                    <FileUpload projectId={project.id} onUploadComplete={handleAssetUpload} />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {assets.length === 0 ? (
                                        <div className="col-span-full py-16 flex flex-col items-center gap-3 border border-dashed border-white/10 rounded-xl opacity-40">
                                            <Upload className="w-8 h-8" />
                                            <p className="text-sm">Nog geen assets geüpload</p>
                                        </div>
                                    ) : (
                                        assets.map((asset, i) => (
                                            <div key={i} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden aspect-square hover:border-blue-500/50 transition-all">
                                                {asset.type === "photo" || asset.type === "logo" ? (
                                                    <Image src={asset.url} alt={asset.name} width={200} height={200} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                                                        <FileText className="w-7 h-7 opacity-20 mb-2" />
                                                        <span className="text-[10px] truncate w-full">{asset.name}</span>
                                                    </div>
                                                )}
                                                <a href={asset.url} target="_blank" className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => advanceToStep("design_review")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
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
                                        <div className="p-2.5 bg-purple-500/20 rounded-xl"><Layout className="w-5 h-5 text-purple-400" /></div>
                                        <div>
                                            <h3 className="font-bold text-lg">Designs voor Review</h3>
                                            <p className="text-xs opacity-40">Voeg design-links toe die de klant kan bekijken en goedkeuren</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDesignModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        <Plus className="w-4 h-4" /> Design Toevoegen
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {designs.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center gap-3 border border-dashed border-white/10 rounded-xl opacity-40">
                                            <Layout className="w-8 h-8" />
                                            <p className="text-sm">Nog geen designs toegevoegd</p>
                                        </div>
                                    ) : (
                                        designs.map((design) => {
                                            const statusColor = design.status === "approved"
                                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                                : design.status === "rejected"
                                                    ? "text-red-400 bg-red-400/10 border-red-400/20"
                                                    : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
                                            return (
                                                <div key={design.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                                            <Layout className="w-5 h-5 text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{design.name}</p>
                                                            {design.description && <p className="text-xs opacity-40 mt-0.5">{design.description}</p>}
                                                            {design.feedback && (
                                                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                                    <MessageSquare className="w-3 h-3" /> {design.feedback}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${statusColor}`}>
                                                            {design.status === "approved" ? "Goedgekeurd" : design.status === "rejected" ? "Afgewezen" : "In Review"}
                                                        </span>
                                                        <a
                                                            href={design.htmlUrl}
                                                            target="_blank"
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-xs font-medium"
                                                        >
                                                            Bekijk <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={() => advanceToStep("intake")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm opacity-40 hover:opacity-100 hover:bg-white/5 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug
                                    </button>
                                    <button
                                        onClick={() => advanceToStep("development")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 font-bold text-sm transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50"
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
                                    <div className="p-2.5 bg-yellow-500/20 rounded-xl"><Wrench className="w-5 h-5 text-yellow-400" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg">Development</h3>
                                        <p className="text-xs opacity-40">Bouw- en technische fase. Houd hier interne voortgang bij.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: "Approved Designs", value: designs.filter(d => d.status === "approved").length, total: designs.length, color: "green" },
                                        { label: "Assets Beschikbaar", value: assets.length, total: null, color: "blue" },
                                        { label: "In Review", value: designs.filter(d => d.status === "pending").length, total: null, color: "yellow" },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <p className="text-2xl font-extrabold font-montserrat">
                                                {stat.value}{stat.total !== null && <span className="text-sm opacity-40">/{stat.total}</span>}
                                            </p>
                                            <p className="text-xs opacity-40 mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={() => advanceToStep("design_review")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm opacity-40 hover:opacity-100 hover:bg-white/5 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug
                                    </button>
                                    <button
                                        onClick={() => advanceToStep("delivered")}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold text-sm transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
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
                                    <div className="p-2.5 bg-green-500/20 rounded-xl"><Receipt className="w-5 h-5 text-green-400" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg">Oplevering & Facturatie</h3>
                                        <p className="text-xs opacity-40">Project is afgerond. Genereer en verstuur de factuur.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                    <p className="text-sm text-green-300">Website is opgeleverd aan de klant.</p>
                                </div>

                                <InvoiceManager project={project} clientId={clientId} />

                                <div className="flex justify-start">
                                    <button onClick={() => advanceToStep("development")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm opacity-40 hover:opacity-100 hover:bg-white/5 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug naar Development
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
