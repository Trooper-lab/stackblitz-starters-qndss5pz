import { useState, useEffect, useCallback } from "react";
import { InvoiceData, ProjectData } from "@/types/database";
import { updateInvoice, getClientInvoices, generateCommitmentFeeInvoice, generateFinalInvoice, generateMaintenanceInvoice } from "@/lib/services/invoiceService";
import { Receipt, Send, CheckCircle, Clock, Download, Loader2, AlertCircle, Sparkles, Calendar } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface InvoiceManagerProps {
    project: ProjectData;
    clientId: string;
    clientEmail?: string;
}

export default function InvoiceManager({ project, clientId, clientEmail }: InvoiceManagerProps) {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState<string | null>(null);

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

    const handleGenerateInvoice = async (type: "commitment" | "final" | "monthly" | "yearly") => {
        setCreating(type);
        try {
            let amount = 0;
            if (type === "commitment") {
                amount = project.packageSelection?.totalPrice ? project.packageSelection.totalPrice / 2 : 0;
                await generateCommitmentFeeInvoice(project.id, clientId, amount, clientEmail);
            } else if (type === "final") {
                amount = project.packageSelection?.totalPrice ? project.packageSelection.totalPrice / 2 : 0;
                await generateFinalInvoice(project.id, clientId, amount, clientEmail);
            } else {
                amount = project.packageSelection?.maintenancePrice || 0;
                await generateMaintenanceInvoice(project.id, clientId, amount, type as "monthly" | "yearly", clientEmail);
            }
            await loadInvoices();
        } catch (error) {
            console.error("Error generating invoice:", error);
        } finally {
            setCreating(null);
        }
    };

    const handleUpdateStatus = async (invoiceId: string, status: InvoiceData["status"]) => {
        setLoading(true);
        try {
            const updates: Partial<InvoiceData> = { status };
            if (status === "paid") updates.paidAt = Timestamp.now();
            if (status === "sent") updates.issuedAt = Timestamp.now();
            
            await updateInvoice(invoiceId, updates);
            await loadInvoices();
        } catch (error) {
            console.error("Error updating invoice status:", error);
        } finally {
            setLoading(false);
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

    const hasCommitment = invoices.some(inv => inv.description.includes("Commitment"));
    const hasFinal = invoices.some(inv => inv.description.includes("Finale"));
    const hasMaintenance = invoices.some(inv => inv.description.includes("Onderhoud"));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-navy/5 rounded-xl">
                        <Receipt className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-montserrat text-slate-900 leading-none">Facturatie</h3>
                        <p className="text-xs text-slate-500 mt-1">Beheer projectfacturen en betalingen</p>
                    </div>
                </div>
            </div>

            {/* Suggestions Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!hasCommitment && (
                    <button
                        onClick={() => handleGenerateInvoice("commitment")}
                        disabled={!!creating}
                        className="group p-5 bg-blue-50/50 border border-blue-100 rounded-2xl text-left hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            {creating === "commitment" && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                        </div>
                        <h4 className="font-bold text-sm text-navy mb-1">Startfactuur (50%)</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Suggereer aanbetaling voor de start van de bouw.</p>
                    </button>
                )}

                {project.status === "delivered" && !hasFinal && (
                    <button
                        onClick={() => handleGenerateInvoice("final")}
                        disabled={!!creating}
                        className="group p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left hover:bg-emerald-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            {creating === "final" && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
                        </div>
                        <h4 className="font-bold text-sm text-navy mb-1">Eindfactuur (50%)</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Suggereer restantbetaling bij oplevering.</p>
                    </button>
                )}

                {project.packageSelection && !hasMaintenance && (
                    <button
                        onClick={() => handleGenerateInvoice(project.packageSelection?.billingCycle === "yearly" ? "yearly" : "monthly")}
                        disabled={!!creating}
                        className="group p-5 bg-purple-50/50 border border-purple-100 rounded-2xl text-left hover:bg-purple-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            {creating?.includes("ly") && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
                        </div>
                        <h4 className="font-bold text-sm text-navy mb-1">Onderhoud & Hosting</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Genereer periodic factuur (vlg. pakket).</p>
                    </button>
                )}
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-navy/20 animate-spin" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <AlertCircle className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Nog geen facturen voor dit project.</p>
                        <button onClick={() => handleGenerateInvoice("commitment")} className="mt-4 text-xs font-bold text-navy hover:text-navy-light underline">Maak eerste factuur</button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="p-6 transition-all hover:bg-slate-50/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 font-mono">{invoice.invoiceNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                invoice.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {invoice.status === 'paid' ? 'BETAALD' : invoice.status === 'sent' ? 'VERZONDEN' : 'CONCEPT'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-navy">{invoice.description}</h4>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                                            {invoice.issuedAt && (
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Verzonden: {
                                                    invoice.issuedAt instanceof Timestamp 
                                                        ? invoice.issuedAt.toDate().toLocaleDateString() 
                                                        : (invoice.issuedAt && typeof invoice.issuedAt === 'object' && 'seconds' in invoice.issuedAt)
                                                            ? new Date((invoice.issuedAt as { seconds: number }).seconds * 1000).toLocaleDateString()
                                                            : typeof invoice.issuedAt === 'string'
                                                                ? new Date(invoice.issuedAt).toLocaleDateString()
                                                                : '...'
                                                }</span>
                                            )}
                                            {invoice.dueDate && (
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Vervaldatum: {
                                                    invoice.dueDate instanceof Timestamp 
                                                        ? invoice.dueDate.toDate().toLocaleDateString()
                                                        : (invoice.dueDate && typeof invoice.dueDate === 'object' && 'seconds' in invoice.dueDate)
                                                            ? new Date((invoice.dueDate as { seconds: number }).seconds * 1000).toLocaleDateString()
                                                            : typeof invoice.dueDate === 'string'
                                                                ? new Date(invoice.dueDate).toLocaleDateString()
                                                                : '...'
                                                }</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Bedrag (ex BTW)</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-300 font-bold">€</span>
                                                <input
                                                    type="number"
                                                    disabled={invoice.status === 'paid'}
                                                    defaultValue={invoice.amount}
                                                    onBlur={(e) => handleUpdateAmount(invoice.id, parseFloat(e.target.value))}
                                                    className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm w-28 text-right font-bold text-navy outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition-all disabled:bg-white disabled:border-transparent disabled:px-0"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {invoice.status === "draft" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(invoice.id, "sent")}
                                                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                    title="Markeer als Verzonden"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                            {invoice.status === "sent" && (
                                                <button
                                                    onClick={() => handleUpdateStatus(invoice.id, "paid")}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all font-bold text-xs shadow-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Markeer Betaald
                                                </button>
                                            )}
                                            <button
                                                className="p-3 text-slate-400 hover:text-navy hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Support Message */}
            <div className="p-4 bg-navy/[0.02] border border-navy/5 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-navy opacity-40 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Nieuwe facturen worden aangemaakt als concept. De klant ziet facturen pas nadat deze op &apos;Verzonden&apos; zijn gezet. 
                    Betalingen via Stripe worden automatisch gesynchroniseerd (toekomstige feature). Voor nu kun je ze handmatig op &apos;Betaald&apos; zetten.
                </p>
            </div>
        </div>
    );
}
