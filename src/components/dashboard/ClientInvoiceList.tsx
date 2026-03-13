"use client";

import { useEffect, useState } from "react";
import { InvoiceData } from "@/types/database";
import { getProjectInvoices } from "@/lib/services/invoiceService";
import { Receipt, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Timestamp, FieldValue } from "firebase/firestore";

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
                return { label: 'Betaald', icon: CheckCircle2, color: 'text-green-700 bg-green-50 border-green-200' };
            case 'overdue':
                return { label: 'Te laat', icon: AlertCircle, color: 'text-red-700 bg-red-50 border-red-200' };
            case 'sent':
                return { label: 'Verzonden', icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' };
            default:
                return { label: 'Concept', icon: Receipt, color: 'text-slate-500 bg-slate-100 border-slate-200' };
        }
    };

    const formatDate = (date: Timestamp | FieldValue) => {
        if (!date) return "";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('nl-NL');
        }
        
        // Handle FieldValue or plain object from serialization
        const d = date as unknown as { seconds?: number; nanoseconds?: number };
        if (d && typeof d.seconds === 'number') {
            return new Timestamp(d.seconds, d.nanoseconds || 0).toDate().toLocaleDateString('nl-NL');
        }
        return "";
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
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-500">
                <Receipt className="w-8 h-8 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-sm">Nog geen facturen beschikbaar voor dit project.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invoices.map((invoice) => {
                const status = getStatusInfo(invoice.status);
                return (
                    <div key={invoice.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all border-l-4 border-l-blue-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-navy">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900">Factuur #{invoice.invoiceNumber}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                                            <status.icon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">Verzonden op {formatDate(invoice.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Totaalbedrag</p>
                                    <p className="text-2xl font-montserrat font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-navy to-navy-light pt-1">
                                        € {invoice.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <button className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-bold flex items-center gap-2 transition-all group shadow-sm">
                                    Bekijken <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-navy transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
