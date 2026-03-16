"use client";

import { useEffect, useState } from "react";
import { InvoiceData, UserData } from "@/types/database";
import { getProjectInvoices } from "@/lib/services/invoiceService";
import { getClientById } from "@/lib/services/clientService";
import { Receipt, Clock, CheckCircle2, AlertCircle, ExternalLink, Loader2, Calendar, Printer } from "lucide-react";
import { Timestamp, FieldValue } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import InvoiceDocument from "./InvoiceDocument";

interface ClientInvoiceListProps {
    projectId: string;
    clientId: string;
}

export default function ClientInvoiceList({ projectId, clientId }: ClientInvoiceListProps) {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [client, setClient] = useState<UserData | undefined>();
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [invData, clientData] = await Promise.all([
                    getProjectInvoices(projectId, clientId),
                    getClientById(clientId)
                ]);
                
                setInvoices((invData || []).sort((a: InvoiceData, b: InvoiceData) => {
                    const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
                    const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
                    return dateB - dateA;
                }));
                if (clientData) setClient(clientData as UserData);
            } catch (error) {
                console.error("Error loading invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId, clientId]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'paid':
                return { 
                    label: 'Betaald', 
                    icon: CheckCircle2, 
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
                    dot: 'bg-emerald-500'
                };
            case 'overdue':
                return { 
                    label: 'Te laat', 
                    icon: AlertCircle, 
                    color: 'text-rose-700 bg-rose-50 border-rose-100',
                    dot: 'bg-rose-500'
                };
            case 'sent':
                return { 
                    label: 'Openstaand', 
                    icon: Clock, 
                    color: 'text-amber-700 bg-amber-50 border-amber-100',
                    dot: 'bg-amber-500'
                };
            default:
                return { 
                    label: 'Concept', 
                    icon: Receipt, 
                    color: 'text-slate-500 bg-slate-50 border-slate-200',
                    dot: 'bg-slate-400'
                };
        }
    };

    const formatDate = (date: Timestamp | FieldValue | undefined) => {
        if (!date) return "";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return "";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin text-navy" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Laden van facturen...</p>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50"
            >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 border border-slate-100">
                    <Receipt className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-navy mb-1">Geen facturen</h3>
                <p className="text-sm text-slate-500 max-w-[240px] mx-auto">Zodra we een factuur voor je klaarzetten, verschijnt deze hier.</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout">
                {invoices.map((invoice, idx) => {
                    const status = getStatusInfo(invoice.status);
                    const isRecurring = invoice.type === "maintenance";
                    
                    return (
                        <motion.div 
                            key={invoice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-2xl hover:border-navy/10 transition-all overflow-hidden"
                        >
                            {/* Accent line for paid invoices */}
                            {invoice.status === 'paid' && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/20" />
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-2xl border transition-colors ${isRecurring ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-navy'}`}>
                                        {isRecurring ? <Calendar className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-lg text-navy tracking-tight">{invoice.invoiceNumber}</h4>
                                            {isRecurring && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black uppercase tracking-widest border border-indigo-200">
                                                    {invoice.billingCycle === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-3">{invoice.description}</p>
                                        
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${status.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                                                {status.label}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(invoice.issuedAt || invoice.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Totaalbedrag</p>
                                        <p className="text-3xl font-display font-black text-navy leading-none">
                                            €{invoice.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                        </p>
                                        {invoice.status !== 'paid' && invoice.dueDate && (
                                            <p className={`text-[9px] font-bold uppercase mt-2 ${invoice.status === 'overdue' ? 'text-rose-500' : 'text-slate-400'}`}>
                                                Uiterlijk: {formatDate(invoice.dueDate)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="px-6 py-2 rounded-xl bg-slate-50 border border-slate-100 text-navy text-xs font-bold hover:bg-navy hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <Printer className="w-3 h-3" />
                                            Bekijk & Print
                                        </button>
                                        {invoice.status !== 'paid' && (
                                            <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:shadow-lg hover:shadow-navy/20 transition-all">
                                                Betaal Nu
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Invoice Document Overlay */}
            {selectedInvoice && (
                <InvoiceDocument
                    invoice={selectedInvoice}
                    client={client}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
