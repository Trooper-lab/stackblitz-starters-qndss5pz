"use client";

import { useState, useEffect } from "react";
import { getAllProjects } from "@/lib/services/projectService";
import { ProjectData, ProjectStatus } from "@/types/database";
import { Timestamp, FieldValue } from "firebase/firestore";

interface ProjectListProps {
    onSelectProject: (project: ProjectData) => void;
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getAllProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case "intake": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
            case "design_review": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
            case "development": return "bg-purple-500/20 text-purple-500 border-purple-500/50";
            case "delivered": return "bg-green-500/20 text-green-500 border-green-500/50";
            default: return "bg-white/10 text-white border-white/20";
        }
    };

    const formatDate = (date: Timestamp | FieldValue | undefined) => {
        if (!date) return "-";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString();
        }
        
        const d = date as unknown as { seconds?: number; nanoseconds?: number };
        if (d && typeof d.seconds === 'number') {
            return new Timestamp(d.seconds, d.nanoseconds || 0).toDate().toLocaleDateString();
        }
        return "-";
    };

    if (loading) {
        return <div className="p-8 text-center opacity-50">Laden...</div>;
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                <p className="opacity-40">Nog geen projecten aangemaakt.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                            {project.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] opacity-30">
                            {formatDate(project.createdAt)}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                        {project.title}
                    </h3>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
                        <div className="flex -space-x-2">
                            {/* Placeholder for assets count */}
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                                {project.assets?.length || 0}A
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                                {project.designs?.length || 0}D
                            </div>
                        </div>
                        <span className="text-xs opacity-40">Assets & Designs</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
