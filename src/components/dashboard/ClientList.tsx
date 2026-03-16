"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/lib/services/clientService";
import { getAllInvoices } from "@/lib/services/invoiceService";
import { UserData, InvoiceData } from "@/types/database";
import { Timestamp, FieldValue } from "firebase/firestore";

interface ClientListProps {
    onSelectClient: (client: UserData) => void;
}

export default function ClientList({ onSelectClient }: ClientListProps) {
    const [clients, setClients] = useState<UserData[]>([]);
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"active" | "lead">("active");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsData, invoicesData] = await Promise.all([
                    getClients(),
                    getAllInvoices()
                ]);
                setClients(clientsData);
                setInvoices(invoicesData);
            } catch (error) {
                console.error("Failed to fetch clients/invoices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const leads = clients.filter(c => c.status === "lead" || c.status === "new_lead" || c.status === "contacted");
    const activeClients = clients.filter(c => c.status === "active_client" || c.status === "active" || c.status === "design_pipeline");
    const displayClients = activeTab === "lead" ? leads : activeClients;

    // Helper functions for financials
    const getClientFinancials = (clientId: string) => {
        const clientInvoices = invoices.filter(inv => inv.clientId === clientId);
        const ltv = clientInvoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
        const outstanding = clientInvoices.filter(inv => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0);
        const overdueCount = clientInvoices.filter(inv => inv.status === "overdue").length;
        
        return { ltv, outstanding, overdueCount };
    };

    return (
        <div className="space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab("active")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "active" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Actieve Klanten ({activeClients.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("lead")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "lead" ? "bg-white text-navy shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Leads ({leads.length})
                </button>
            </div>

            {displayClients.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-slate-500 font-medium">Nog geen {activeTab === "lead" ? "leads" : "actieve klanten"} geregistreerd.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="p-4 font-bold text-sm text-slate-500">Naam</th>
                                <th className="p-4 font-bold text-sm text-slate-500">Email</th>
                                <th className="p-4 font-bold text-sm text-slate-500">Bedrijf</th>
                                {activeTab === "active" && (
                                    <>
                                        <th className="p-4 font-bold text-sm text-slate-500">LTV / Omzet</th>
                                        <th className="p-4 font-bold text-sm text-slate-500">Openstaand</th>
                                    </>
                                )}
                                <th className="p-4 font-bold text-sm text-slate-500">Geregistreerd</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayClients.map((client) => {
                                const financials = activeTab === "active" ? getClientFinancials(client.uid) : null;
                                
                                return (
                                    <tr
                                        key={client.uid}
                                        onClick={() => onSelectClient(client)}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-slate-600 group"
                                    >
                                        <td className="p-4 font-bold text-navy group-hover:text-purple-600 transition-colors">{client.displayName || "Onbekend"}</td>
                                        <td className="p-4 font-medium text-slate-500">{client.email}</td>
                                        <td className="p-4 font-medium text-slate-500">{client.companyDetails?.name || "-"}</td>
                                        {financials && (
                                            <>
                                                <td className="p-4 font-bold text-green-600">
                                                    €{financials.ltv.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    {financials.outstanding > 0 ? (
                                                        <span className={`font-bold ${financials.overdueCount > 0 ? "text-red-600" : "text-amber-500"}`}>
                                                            €{financials.outstanding.toFixed(2)}
                                                            {financials.overdueCount > 0 && <span className="ml-2 text-xs bg-red-100 px-1.5 py-0.5 rounded-md">{financials.overdueCount} te laat</span>}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                        <td className="p-4 font-medium text-slate-500 text-sm border-0">
                                            {formatDate(client.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
