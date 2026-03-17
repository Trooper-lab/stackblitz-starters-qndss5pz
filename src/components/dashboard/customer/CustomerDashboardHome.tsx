import { User } from "firebase/auth";
import { ProjectData } from "@/types/database";
import { FolderKanban, LayoutDashboard, ChevronRight, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Timestamp, FieldValue } from "firebase/firestore";

interface CustomerDashboardHomeProps {
    user: User | null;
    projects: ProjectData[];
    onSelectProject: (project: ProjectData) => void;
}

export default function CustomerDashboardHome({ user, projects, onSelectProject }: CustomerDashboardHomeProps) {
    const formatDate = (date: Timestamp | FieldValue | undefined) => {
        if (!date) return "Recent";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('nl-NL');
        }
        
        const d = date as unknown as { seconds?: number; nanoseconds?: number };
        if (d && typeof d.seconds === 'number') {
            return new Timestamp(d.seconds, d.nanoseconds || 0).toDate().toLocaleDateString('nl-NL');
        }
        return "Recent";
    };

    return (
        <main className="max-w-7xl mx-auto px-8 py-12">
            <div className="space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight uppercase">
                            Welkom terug, <span className="text-accent italic">{user?.displayName?.split(' ')[0] || "Ondernemer"}</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl">
                            Je project is in volle gang. Hieronder vind je de laatste status en updates van je nieuwe website.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <FolderKanban className="w-5 h-5 text-accent" />
                            <h2 className="text-xl font-black uppercase tracking-tight font-display">Actieve Projecten</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {projects.length === 0 ? (
                                <div className="p-16 text-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center">
                                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                                        <LayoutDashboard className="w-10 h-10 text-accent opacity-50" />
                                    </div>
                                    <h3 className="text-2xl font-display font-black mb-2 uppercase tracking-tight">Bijna tijd voor actie!</h3>
                                    <p className="text-slate-400 max-w-sm font-medium">We bereiden je projectomgeving voor. Je ontvangt bericht zodra we de eerste ontwerpen voor je klaar hebben.</p>
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => onSelectProject(project)}
                                        className="group text-left bg-white/5 border border-white/10 rounded-[2rem] p-8 transition-all hover:bg-white/10 hover:border-accent/30 hover:translate-y-[-4px] shadow-xl hover:shadow-accent/5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-display font-black group-hover:text-accent transition-colors uppercase tracking-tight">{project.title}</h3>
                                                    <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest">
                                                        {project.status.replace('_', ' ')}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-accent" />
                                                        Update: {formatDate(project.updatedAt)}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-accent" />
                                                        {project.designs?.length || 0} Ontwerpen
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-accent rounded-[2.5rem] p-8 shadow-2xl shadow-accent/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-32 h-32 text-white" />
                            </div>
                            <h3 className="text-xl font-black font-display uppercase tracking-tight mb-6 relative z-10 text-white text-[11px]">Project Status</h3>
                            <div className="space-y-4 relative z-10 text-white">
                                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Actieve Projecten</span>
                                    <span className="text-3xl font-black">{projects.length}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Goedgekeurd</span>
                                    <span className="text-3xl font-black">
                                        {projects.reduce((acc, p) => acc + (p.designs?.filter(d => d.status === "approved").length || 0), 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">In Afwachting</span>
                                    <span className="text-3xl font-black">
                                        {projects.reduce((acc, p) => acc + (p.designs?.filter(d => d.status === "pending").length || 0), 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
