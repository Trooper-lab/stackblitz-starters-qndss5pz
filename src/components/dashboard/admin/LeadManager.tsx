import React, { useCallback, useState } from "react";
import { UserData } from "@/types/database";
import { Mail, Phone, Rocket, TrendingUp, MoreVertical, Search, Loader2, Building2, Package, Calendar, User, MessageSquare, XCircle } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { updateClientData } from "@/lib/services/clientService";
import { motion, AnimatePresence } from "framer-motion";

interface LeadManagerProps {
    clients: UserData[];
    onSelectLead: (lead: UserData) => void;
    onStartFreeDesign: (clientId: string) => void;
}


interface ColumnProps {
    title: string;
    count: number;
    color: string;
    leads: UserData[];
    onSelectLead: (lead: UserData) => void;
    onStartFreeDesign: (clientId: string) => void;
}

const LeadCard = ({ lead, onSelectLead, onStartFreeDesign }: { lead: UserData, onSelectLead: (lead: UserData) => void, onStartFreeDesign: (clientId: string) => void }) => {
    const [updating, setUpdating] = useState(false);

    const handleMarkContacted = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setUpdating(true);
        try {
            await updateClientData(lead.uid, { status: "contacted" });
        } catch (error) {
            console.error("Error marking lead as contacted:", error);
            alert("Er is iets misgegaan bij het bijwerken van de status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkLost = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Weet je zeker dat je deze lead als verloren wilt markeren?")) return;
        setUpdating(true);
        try {
            await updateClientData(lead.uid, { status: "lost" });
        } catch (error) {
            console.error("Error marking lead as lost:", error);
            alert("Er is iets misgegaan bij het bijwerken van de status.");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date: unknown) => {
        if (!date) return "-";
        
        // Handle Firestore Timestamp or Date ISO string
        if (typeof date === 'object' && date !== null && 'seconds' in date) {
            const d = date as { seconds: number };
            return new Date(d.seconds * 1000).toLocaleDateString();
        }
        
        try {
            return new Date(date as string | number | Date).toLocaleDateString();
        } catch {
            return "-";
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            className="group relative bg-white border border-slate-200 rounded-[2rem] p-5 md:p-6 transition-all cursor-pointer hover:border-purple-200" 
            onClick={() => onSelectLead(lead)}
        >
            <AnimatePresence>
                {updating && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-[2rem]"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Bijwerken...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-start mb-5">
                <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-black text-navy text-base md:text-lg leading-tight tracking-tight group-hover:text-purple-600 transition-colors truncate">
                            {lead.displayName || "Onbekende Naam"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-[11px] md:text-xs font-medium text-slate-400 truncate max-w-[120px] md:max-w-[150px]">{lead.email}</p>
                            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                <Calendar className="w-3 h-3" />
                                {formatDate(lead.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-navy p-1 transition-colors shrink-0">
                    <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-5 md:mb-6">
                <div className="p-2 md:p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors overflow-hidden">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Bedrijf</span>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-navy truncate">
                        {lead.companyDetails?.name || "Geen opgave"}
                    </p>
                </div>
                <div className="p-2 md:p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors overflow-hidden">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <Package className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Pakket</span>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-navy truncate">
                        {lead.selectedPackage?.packageId || "Nog geen"}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        <button 
                            className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 border border-slate-100 hover:border-blue-100 transition-all shadow-sm shrink-0" 
                            title="Email" 
                            onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }}
                        >
                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {lead.companyDetails?.phone && (
                            <button 
                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-green-50 hover:text-green-600 border border-slate-100 hover:border-green-100 transition-all shadow-sm shrink-0" 
                                title="Bellen" 
                                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${lead.companyDetails?.phone}`; }}
                            >
                                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        {lead.status !== "lost" && (
                            <button 
                                onClick={handleMarkLost}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 border border-slate-100 hover:border-red-100 transition-all shadow-sm shrink-0"
                                title="Markeer als verloren"
                            >
                                <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        )}
                        {(lead.status === "new_lead" || lead.status === "lead" || !lead.status) && (
                            <button 
                                onClick={handleMarkContacted}
                                className="w-8 h-8 md:w-auto md:px-4 md:py-2 flex items-center justify-center md:gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl border border-blue-100 transition-all shadow-sm shrink-0"
                                title="Contact"
                            >
                                <MessageSquare className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                <span className="hidden md:inline">Contact</span>
                            </button>
                        )}
                    </div>
                </div>

                {lead.status !== "lost" && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onStartFreeDesign(lead.uid); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white hover:bg-purple-700 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Rocket className="w-3.5 h-3.5" />
                        Start Vibecheck
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const Column = ({ title, count, color, leads, onSelectLead, onStartFreeDesign }: ColumnProps) => (
    <div className="flex flex-col h-full min-w-[300px] md:min-w-[320px] max-w-[400px]">
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                {title}
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200">{count}</span>
        </div>
        
        <div className="flex-1 bg-slate-100/50 rounded-2xl p-2 md:p-3 border border-slate-200 border-dashed space-y-3 overflow-y-auto min-h-[500px]">
            {leads.map(lead => <LeadCard key={lead.uid} lead={lead} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />)}
            {leads.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50 text-slate-400 text-xs">
                    Leeg
                </div>
            )}
        </div>
    </div>
);

export default function LeadManager({ clients, onSelectLead, onStartFreeDesign }: LeadManagerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchQuery = searchParams.get("search") || "";

    const setSearchQuery = useCallback((query: string) => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set("search", query);
        } else {
            params.delete("search");
        }
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    const leads = clients.filter(c => {
        const isLead = c.status === "new_lead" || c.status === "contacted" || c.status === "design_pipeline" || c.status === "lost" || !c.status || c.status === "lead";
        if (!isLead) return false;
        
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const nameMatch = (c.displayName || "").toLowerCase().includes(searchLower);
            const emailMatch = (c.email || "").toLowerCase().includes(searchLower);
            const companyMatch = (c.companyDetails?.name || "").toLowerCase().includes(searchLower);
            return nameMatch || emailMatch || companyMatch;
        }
        
        return true;
    });

    const newLeads = leads.filter(l => l.status === "new_lead" || l.status === "lead" || !l.status);
    const contactedLeads = leads.filter(l => l.status === "contacted");
    const designPipelineLeads = leads.filter(l => l.status === "design_pipeline");
    const lostLeads = leads.filter(l => l.status === "lost");

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold font-display text-navy mb-1 flex items-center gap-2 md:gap-3">
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600" /> Lead Pipeline
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">{leads.length} leads in totaal</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Zoek leads..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6">
                <div className="flex gap-4 md:gap-6 h-full w-max">
                    <Column title="Nieuwe Leads" count={newLeads.length} color="bg-blue-400" leads={newLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                    <Column title="Gecontacteerd" count={contactedLeads.length} color="bg-yellow-400" leads={contactedLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                    <Column title="Gratis Design" count={designPipelineLeads.length} color="bg-purple-400" leads={designPipelineLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                    <Column title="Verloren" count={lostLeads.length} color="bg-red-400" leads={lostLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                </div>
            </div>
        </div>
    );
}
