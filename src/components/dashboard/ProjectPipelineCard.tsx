"use client";

import { ProjectData, UserData } from "@/types/database";
import { Calendar, CheckCircle, FileText, Wrench, AlertCircle, Sparkles, Layout } from "lucide-react";
import { Timestamp, FieldValue } from "firebase/firestore";

const STEPS = [
    { key: "vibecheck", label: "Vibe", icon: Sparkles, color: "blue" },
    { key: "upload", label: "Upload", icon: FileText, color: "blue" },
    { key: "design_review", label: "Design", icon: Layout, color: "purple" },
    { key: "development", label: "Dev", icon: Wrench, color: "yellow" },
    { key: "qa", label: "QA", icon: AlertCircle, color: "orange" },
    { key: "delivered", label: "Live", icon: CheckCircle, color: "green" },
] as const;

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

const COLOR_MAP: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50 border-blue-200 shadow-sm",
    purple: "text-purple-700 bg-purple-50 border-purple-200 shadow-sm",
    yellow: "text-yellow-700 bg-yellow-50 border-yellow-200 shadow-sm",
    orange: "text-orange-700 bg-orange-50 border-orange-200 shadow-sm",
    green: "text-green-700 bg-green-50 border-green-200 shadow-sm",
};

interface ProjectPipelineCardProps {
    project: ProjectData;
    client?: UserData;
    onClick: () => void;
}

export default function ProjectPipelineCard({ project, client, onClick }: ProjectPipelineCardProps) {
    const currentIdx = stepIndex(project.status);
    const currentStep = STEPS[currentIdx] ?? STEPS[0];
    const StepIcon = currentStep.icon;
    const colorClass = COLOR_MAP[currentStep.color];

    const pendingDesigns = project.designs.filter(d => d.status === "pending").length;
    const approvedDesigns = project.designs.filter(d => d.status === "approved").length;

    const getDaysAgo = (date: Timestamp | FieldValue | undefined) => {
        if (!date) return null;
        let ts: Timestamp | null = null;
        if (date instanceof Timestamp) {
            ts = date;
        } else {
            const d = date as unknown as { seconds?: number; nanoseconds?: number };
            if (d && typeof d.seconds === 'number') {
                ts = new Timestamp(d.seconds, d.nanoseconds || 0);
            }
        }

        if (ts) {
            return Math.floor((Date.now() - ts.toDate().getTime()) / 86400000);
        }
        return null;
    };

    const daysAgo = getDaysAgo(project.updatedAt);

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-accent rounded-2xl p-5 transition-all shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1"
        >
            {/* Top: client + status badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0 text-white">
                        {(client?.displayName || client?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold leading-tight text-navy">{project.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{client?.companyDetails?.name || client?.displayName || "Onbekende klant"}</p>
                    </div>
                </div>
                <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${colorClass}`}>
                    <StepIcon className="w-3 h-3" />
                    {currentStep.label}
                </div>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center gap-1 mb-4">
                {STEPS.map((step, i) => (
                    <div key={step.key} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 rounded-full flex-1 transition-all ${i <= currentIdx ? "bg-accent" : "bg-slate-100"}`} />
                    </div>
                ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    {project.designs.length > 0 && (
                        <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            {approvedDesigns}/{project.designs.length} designs
                        </span>
                    )}
                    {project.assets.length > 0 && (
                        <span>{project.assets.length} assets</span>
                    )}
                    {pendingDesigns > 0 && (
                        <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                            {pendingDesigns} wacht op review
                        </span>
                    )}
                </div>
                {daysAgo !== null && (
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysAgo === 0 ? "Vandaag" : `${daysAgo}d geleden`}
                    </span>
                )}
            </div>
        </div>
    );
}
