"use client";

import { ProjectData, UserData } from "@/types/database";
import { Calendar, CheckCircle, FileText, Wrench } from "lucide-react";
import { Timestamp, FieldValue } from "firebase/firestore";

const STEPS = [
    { key: "intake", label: "Intake", icon: FileText, color: "blue" },
    { key: "design_review", label: "Design", icon: FileText, color: "purple" },
    { key: "development", label: "Dev", icon: Wrench, color: "yellow" },
    { key: "delivered", label: "Opgeleverd", icon: CheckCircle, color: "green" },
] as const;

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

const COLOR_MAP: Record<string, string> = {
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    green: "text-green-400 bg-green-400/10 border-green-400/30",
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
            className="group cursor-pointer bg-[#0d1526] border border-white/8 hover:border-blue-500/40 rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5"
        >
            {/* Top: client + status badge */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {(client?.displayName || client?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold leading-tight">{project.title}</p>
                        <p className="text-xs opacity-40 mt-0.5">{client?.companyDetails?.name || client?.displayName || "Onbekende klant"}</p>
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
                        <div className={`h-1 rounded-full flex-1 transition-all ${i <= currentIdx ? "bg-blue-500" : "bg-white/10"}`} />
                    </div>
                ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs opacity-40">
                    {project.designs.length > 0 && (
                        <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {approvedDesigns}/{project.designs.length} designs
                        </span>
                    )}
                    {project.assets.length > 0 && (
                        <span>{project.assets.length} assets</span>
                    )}
                    {pendingDesigns > 0 && (
                        <span className="text-yellow-400 opacity-100 font-medium">
                            {pendingDesigns} wacht op review
                        </span>
                    )}
                </div>
                {daysAgo !== null && (
                    <span className="flex items-center gap-1 text-xs opacity-30">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysAgo === 0 ? "Vandaag" : `${daysAgo}d geleden`}
                    </span>
                )}
            </div>
        </div>
    );
}
