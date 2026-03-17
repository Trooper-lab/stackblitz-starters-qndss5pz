import { useState } from "react";
import { ProjectData, UserData } from "@/types/database";
import ProjectPipelineCard from "@/components/dashboard/ProjectPipelineCard";
import { RefreshCw, FolderOpen, Loader2, Upload, Sparkles, Rocket, Eye, Code, ShieldCheck } from "lucide-react";

const STEPS = [
    { key: "vibecheck", label: "3 Gratis Vibecheck Designs", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { key: "upload", label: "Upload Stage", icon: Upload, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
    { key: "design_review", label: "Design Check Phase", icon: Eye, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
    { key: "development", label: "Dev", icon: Code, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
    { key: "qa", label: "QA", icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
    { key: "delivered", label: "Launch", icon: Rocket, color: "text-green-600", bg: "bg-green-50 border-green-200" },
];

interface ProjectPipelineProps {
    projects: ProjectData[];
    clients: UserData[];
    loading: boolean;
    onRefresh: () => void;
    onSelectProject: (project: ProjectData) => void;
}

export default function ProjectPipeline({ projects, clients, loading, onRefresh, onSelectProject }: ProjectPipelineProps) {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const clientMap = Object.fromEntries(clients.map(c => [c.uid, c]));
    
    // Delivered and completed projects aren't typically "in progress"
    const inProgress = projects.filter(p => p.status !== "delivered" && p.status !== "completed").length;

    const filteredProjects = activeFilter
        ? projects.filter(p => p.status === activeFilter)
        : projects;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1">Project Pipeline</h1>
                    <p className="text-sm text-slate-500 font-medium">{projects.length} projecten totaal · {inProgress} lopend</p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-navy hover:bg-slate-200 transition-all border border-slate-200 bg-white shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Step filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setActiveFilter(null)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${!activeFilter ? "bg-navy text-white border-navy shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                    Alle ({projects.filter(p => p.status !== "completed").length})
                </button>
                {STEPS.map(step => {
                    const count = projects.filter(p => p.status === step.key).length;
                    return (
                        <button
                            key={step.key}
                            onClick={() => setActiveFilter(activeFilter === step.key ? null : step.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeFilter === step.key ? `${step.bg} ${step.color} shadow-sm border-opacity-100` : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                            <step.icon className="w-3 h-3" />
                            {step.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Project grid or Kanban */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-navy/20" />
                </div>
            ) : filteredProjects.filter(p => p.status !== "completed").length === 0 ? (
                <div className="py-32 flex flex-col items-center gap-4 text-slate-400">
                    <FolderOpen className="w-12 h-12" />
                    <p className="text-lg font-bold text-slate-500">Geen actieve projecten gevonden</p>
                    <p className="text-sm">Maak een nieuw project aan via de sidebar</p>
                </div>
            ) : activeFilter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProjects.filter(p => p.status !== "completed").map(project => (
                        <ProjectPipelineCard
                            key={project.id}
                            project={project}
                            client={clientMap[project.clientId]}
                            onClick={() => onSelectProject(project)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                    {STEPS.map(step => {
                        const colProjects = filteredProjects.filter(p => p.status === step.key);
                        return (
                            <div key={step.key} className="flex-none w-80 flex flex-col snap-start">
                                <div className={`px-4 py-3 rounded-t-xl border-t border-x flex items-center justify-between ${step.bg}`}>
                                    <div className="flex items-center gap-2">
                                        <step.icon className={`w-4 h-4 ${step.color}`} />
                                        <h3 className={`font-bold text-sm ${step.color}`}>{step.label}</h3>
                                    </div>
                                    <span className={`text-xs font-black ${step.color} bg-white px-2 py-0.5 rounded-full shadow-sm`}>
                                        {colProjects.length}
                                    </span>
                                </div>
                                <div className="flex-1 bg-slate-100/50 border-x border-b border-slate-200 rounded-b-xl p-3 flex flex-col gap-3 min-h-[400px]">
                                    {colProjects.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-50 py-10">
                                            <FolderOpen className="w-8 h-8 mb-2" />
                                            <p className="text-xs font-medium">Geen projecten</p>
                                        </div>
                                    ) : (
                                        colProjects.map(project => (
                                            <ProjectPipelineCard
                                                key={project.id}
                                                project={project}
                                                client={clientMap[project.clientId]}
                                                onClick={() => onSelectProject(project)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
