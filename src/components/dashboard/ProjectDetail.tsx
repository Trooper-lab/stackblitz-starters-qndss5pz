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
    clientStatus?: "lead" | "active";
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
    blue: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-500" },
    purple: { border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-500" },
    yellow: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-500" },
    green: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-500" },
};

export default function ProjectDetail({ project, clientId, clientStatus, onBack, onUpdate }: ProjectDetailProps) {
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
                <AddDesignModal 
                    onClose={() => setShowDesignModal(false)} 
                    onAdd={handleAddDesign} 
                    defaultName={designs.length === 0 && clientStatus === "lead" ? "Gratis Website Ontwerp V1" : ""}
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
                                                        <a
                                                            href={design.htmlUrl}
                                                            target="_blank"
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-xs font-medium bg-white"
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
                                    <button onClick={() => advanceToStep("intake")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                                        <ChevronLeft className="w-4 h-4" /> Terug
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

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <p className="text-sm text-emerald-800 font-medium">Website is opgeleverd aan de klant.</p>
                                </div>

                                <InvoiceManager project={project} clientId={clientId} />

                                <div className="flex justify-start">
                                    <button onClick={() => advanceToStep("development")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
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
