import React from "react";
import { UserData } from "@/types/database";
import { Mail, Phone, Rocket, TrendingUp, MoreVertical, Search } from "lucide-react";

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

const LeadCard = ({ lead, onSelectLead, onStartFreeDesign }: { lead: UserData, onSelectLead: (lead: UserData) => void, onStartFreeDesign: (clientId: string) => void }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group" onClick={() => onSelectLead(lead)}>
        <div className="flex justify-between items-start mb-3">
            <div>
                <h4 className="font-bold text-navy">{lead.displayName || "Onbekende Naam"}</h4>
                <p className="text-xs text-slate-500">{lead.email}</p>
            </div>
            <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-md">
                <MoreVertical className="w-4 h-4" />
            </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
            {lead.companyDetails?.name && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1">
                    {lead.companyDetails.name}
                </span>
            )}
            {lead.selectedPackage?.packageId && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium">
                    📦 {lead.selectedPackage.packageId}
                </span>
            )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
                <button className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Email" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }}>
                    <Mail className="w-3.5 h-3.5" />
                </button>
                <button className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Bellen" onClick={(e) => { e.stopPropagation(); }}>
                    <Phone className="w-3.5 h-3.5" />
                </button>
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); onStartFreeDesign(lead.uid); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 text-xs font-bold rounded flex-1 justify-center ml-2 border border-purple-200 transition-colors"
            >
                <Rocket className="w-3 h-3" /> Gratis Design
            </button>
        </div>
    </div>
);

const Column = ({ title, count, color, leads, onSelectLead, onStartFreeDesign }: ColumnProps) => (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                {title}
            </h3>
            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200">{count}</span>
        </div>
        
        <div className="flex-1 bg-slate-100/50 rounded-2xl p-3 border border-slate-200 border-dashed space-y-3 overflow-y-auto">
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
    const leads = clients.filter(c => c.status === "new_lead" || c.status === "contacted" || c.status === "design_pipeline" || c.status === "lost" || !c.status || c.status === "lead");

    const newLeads = leads.filter(l => l.status === "new_lead" || l.status === "lead" || !l.status);
    const contactedLeads = leads.filter(l => l.status === "contacted");
    const designPipelineLeads = leads.filter(l => l.status === "design_pipeline");
    const lostLeads = leads.filter(l => l.status === "lost");

    return (
        <div className="space-y-8 animate-fade-in h-[calc(100vh-80px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1 flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-purple-600" /> Lead Pipeline
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">{leads.length} leads in totaal</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Zoek leads..." 
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden pb-4">
                <Column title="Nieuwe Leads" count={newLeads.length} color="bg-blue-400" leads={newLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                <Column title="Gecontacteerd" count={contactedLeads.length} color="bg-yellow-400" leads={contactedLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                <Column title="Gratis Design" count={designPipelineLeads.length} color="bg-purple-400" leads={designPipelineLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
                <Column title="Verloren" count={lostLeads.length} color="bg-red-400" leads={lostLeads} onSelectLead={onSelectLead} onStartFreeDesign={onStartFreeDesign} />
            </div>
        </div>
    );
}
