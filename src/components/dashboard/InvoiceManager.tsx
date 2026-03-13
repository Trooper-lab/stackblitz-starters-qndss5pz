"use client";

import { useState, useEffect, useCallback } from "react";
import { InvoiceData, ProjectData } from "@/types/database";
import { createInvoice, updateInvoice, getClientInvoices } from "@/lib/services/invoiceService";
import { Plus, Receipt, Send, CheckCircle, Clock, Download, Loader2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface InvoiceManagerProps {
    project: ProjectData;
    clientId: string;
}

export default function InvoiceManager({ project, clientId }: InvoiceManagerProps) {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const loadInvoices = useCallback(async () => {
        try {
            const data = await getClientInvoices(clientId);
            setInvoices(data.filter(inv => inv.projectId === project.id));
        } catch (error) {
            console.error("Error loading invoices:", error);
        } finally {
            setLoading(false);
        }
    }, [clientId, project.id]);

    useEffect(() => {
        loadInvoices();
    }, [project.id, clientId, loadInvoices]);

    const handleCreateInvoice = async () => {
        setCreating(true);
        try {
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await createInvoice({
                projectId: project.id,
                clientId: clientId,
                invoiceNumber,
                amount: 0,
                description: `Factuur voor project: ${project.title}`,
                status: "draft",
                createdAt: Timestamp.fromDate(new Date()) // This will be overwritten by serverTimestamp in the service, but needed for type safety if Omit is used
            });
            await loadInvoices();
        } catch (error) {
            console.error("Error creating invoice:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: "sent" | "paid") => {
        try {
            await updateInvoice(id, {
                status,
                issuedAt: status === "sent" ? Timestamp.fromDate(new Date()) : undefined,
                paidAt: status === "paid" ? Timestamp.fromDate(new Date()) : undefined
            });
            await loadInvoices();
        } catch (error) {
            console.error("Error updating invoice status:", error);
        }
    };

    const handleUpdateAmount = async (id: string, amount: number) => {
        try {
            await updateInvoice(id, { amount });
            await loadInvoices();
        } catch (error) {
            console.error("Error updating invoice amount:", error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid": return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "sent": return <Send className="w-4 h-4 text-blue-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-navy" />
                    <h3 className="text-xl font-bold font-montserrat text-slate-900">Facturen</h3>
                </div>
                <button
                    disabled={creating}
                    onClick={handleCreateInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-navy hover:bg-navy-light text-white rounded-lg text-sm font-bold transition-all shadow-sm"
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Nieuwe Factuur
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-navy animate-spin" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-500 font-medium">
                        Nog geen facturen aangemaakt voor dit project.
                    </div>
                ) : (
                    invoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white border border-slate-200 rounded-xl p-6 transition-all hover:border-slate-300 hover:shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-700">{invoice.invoiceNumber}</span>
                                        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase flex items-center gap-1.5 ${invoice.status === 'paid' ? 'text-green-700 border-green-200 bg-green-50' :
                                            invoice.status === 'sent' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                                                'text-slate-600 border-slate-200 bg-slate-50'
                                            }`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </div>
                                    </div>
                                    <p className="font-medium text-slate-900">{invoice.description}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Bedrag (ex BTW)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400 font-medium">€</span>
                                            <input
                                                type="number"
                                                defaultValue={invoice.amount}
                                                onBlur={(e) => handleUpdateAmount(invoice.id, parseFloat(e.target.value))}
                                                className="bg-white border border-slate-200 rounded px-2 py-1 text-sm w-24 text-right outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {invoice.status === "draft" && (
                                            <button
                                                onClick={() => handleUpdateStatus(invoice.id, "sent")}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                title="Markeer als Verzonden"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        )}
                                        {invoice.status === "sent" && (
                                            <button
                                                onClick={() => handleUpdateStatus(invoice.id, "paid")}
                                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                                                title="Markeer als Betaald"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                            title="Download PDF (Nog niet ge&iuml;mplementeerd)"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
