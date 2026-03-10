"use client";

import { useEffect, useState } from "react";
import { InvoiceData } from "@/types/database";
import { getProjectInvoices } from "@/lib/services/invoiceService";
import { Receipt, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

interface ClientInvoiceListProps {
    projectId: string;
}

export default function ClientInvoiceList({ projectId }: ClientInvoiceListProps) {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                const data = await getProjectInvoices(projectId);
                setInvoices(data);
            } catch (error) {
                console.error("Error loading invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, [projectId]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'paid':
                return { label: 'Betaald', icon: CheckCircle2, color: 'text-green-400 bg-green-400/10 border-green-400/20' };
            case 'overdue':
                return { label: 'Te laat', icon: AlertCircle, color: 'text-red-400 bg-red-400/10 border-red-400/20' };
            case 'sent':
                return { label: 'Verzonden', icon: Clock, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
            default:
                return { label: 'Concept', icon: Receipt, color: 'text-white/30 bg-white/5 border-white/10' };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 opacity-50" />
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl opacity-40">
                <Receipt className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nog geen facturen beschikbaar voor dit project.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invoices.map((invoice) => {
                const status = getStatusInfo(invoice.status);
                return (
                    <div key={invoice.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all border-l-4 border-l-blue-500/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">Factuur #{invoice.invoiceNumber}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                                            <status.icon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                        <span className="text-xs opacity-40">Verzonden op {new Date(invoice.createdAt.seconds * 1000).toLocaleDateString('nl-NL')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                <div className="text-right">
                                    <p className="text-xs opacity-40 uppercase font-bold tracking-widest">Totaalbedrag</p>
                                    <p className="text-2xl font-montserrat font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                        € {invoice.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-all group">
                                    Bekijken <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
