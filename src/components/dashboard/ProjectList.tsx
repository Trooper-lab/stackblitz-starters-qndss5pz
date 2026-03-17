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
            case "vibecheck": return "bg-blue-50 text-blue-700 border-blue-200";
            case "upload": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "design_review": return "bg-purple-50 text-purple-700 border-purple-200";
            case "development": return "bg-amber-50 text-amber-700 border-amber-200";
            case "delivered": return "bg-green-50 text-green-700 border-green-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
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
        return <div className="p-8 text-center text-slate-500 font-medium">Laden...</div>;
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-slate-500 font-medium">Nog geen projecten aangemaakt.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-navy opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
                            {project.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {formatDate(project.createdAt)}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-navy transition-colors">
                        {project.title}
                    </h3>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex -space-x-2">
                            {/* Placeholder for assets count */}
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {project.assets?.length || 0}A
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {project.designs?.length || 0}D
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Assets & Designs</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
