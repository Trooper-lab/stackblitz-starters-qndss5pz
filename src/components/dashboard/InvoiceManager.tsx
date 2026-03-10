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
                    <Receipt className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-bold font-montserrat">Facturen</h3>
                </div>
                <button
                    disabled={creating}
                    onClick={handleCreateInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-all"
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Nieuwe Factuur
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-xl opacity-40">
                        Nog geen facturen aangemaakt voor dit project.
                    </div>
                ) : (
                    invoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:bg-white/10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-white/50">{invoice.invoiceNumber}</span>
                                        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase flex items-center gap-1.5 ${invoice.status === 'paid' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                                            invoice.status === 'sent' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                'text-gray-400 border-white/10 bg-white/5'
                                            }`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </div>
                                    </div>
                                    <p className="font-medium">{invoice.description}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase opacity-40 mb-1">Bedrag (ex BTW)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm opacity-40">€</span>
                                            <input
                                                type="number"
                                                defaultValue={invoice.amount}
                                                onBlur={(e) => handleUpdateAmount(invoice.id, parseFloat(e.target.value))}
                                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm w-24 text-right outline-none focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {invoice.status === "draft" && (
                                            <button
                                                onClick={() => handleUpdateStatus(invoice.id, "sent")}
                                                className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all"
                                                title="Markeer als Verzonden"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        )}
                                        {invoice.status === "sent" && (
                                            <button
                                                onClick={() => handleUpdateStatus(invoice.id, "paid")}
                                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-all"
                                                title="Markeer als Betaald"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            className="p-2 bg-white/5 text-white/50 hover:bg-white/10 rounded-lg transition-all"
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
