"use client";

import { InvoiceData, UserData } from "@/types/database";
import { Timestamp, FieldValue } from "firebase/firestore";
import { Printer, X } from "lucide-react";

interface InvoiceDocumentProps {
    invoice: InvoiceData;
    client?: UserData;
    onClose: () => void;
}

export default function InvoiceDocument({ invoice, client, onClose }: InvoiceDocumentProps) {
    const formatDate = (date: Timestamp | FieldValue | Date | null | undefined) => {
        if (!date) return "-";
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        if (date instanceof Date) {
            return date.toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        return "-";
    };

    const handlePrint = () => {
        window.print();
    };

    const subtotal = invoice.amount;
    const taxRate = 0.21; // 21% BTW
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:block">
            {/* Action Buttons - Hidden during print */}
            <div className="fixed top-6 right-6 flex items-center gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl"
                >
                    <Printer className="w-4 h-4" />
                    Print Factuur
                </button>
                <button
                    onClick={onClose}
                    className="p-2.5 bg-white text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-xl border border-slate-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white w-full max-w-[800px] min-h-[1123px] shadow-2xl rounded-[2.5rem] p-12 md:p-16 print:shadow-none print:rounded-none print:p-0 print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
                                <span className="text-white font-black text-xl">A</span>
                            </div>
                            <span className="font-black text-2xl tracking-tight text-navy">AIleadsite</span>
                        </div>
                        <div className="text-sm text-slate-500 space-y-1 font-medium italic">
                            <p>AIleadsite B.V.</p>
                            <p>Stationsplein 45</p>
                            <p>3013 AK Rotterdam</p>
                            <p>Nederland</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-black text-navy uppercase tracking-tighter mb-4">Factuur</h1>
                        <div className="text-sm space-y-1">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Factuurnummer</p>
                            <p className="font-black text-navy text-lg">{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Gefactureerd aan</h3>
                        <div className="text-navy font-bold">
                            <p className="text-lg font-black mb-1">{client?.companyDetails?.name || client?.displayName || "Klant"}</p>
                            <div className="text-sm text-slate-600 font-medium space-y-0.5">
                                <p>{client?.companyDetails?.address || "Adres onbekend"}</p>
                                <p>{client?.email}</p>
                                {client?.companyDetails?.kvk && <p>KVK: {client.companyDetails.kvk}</p>}
                                {client?.companyDetails?.vat && <p>BTW: {client.companyDetails.vat}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Datum</p>
                            <p className="text-sm font-black text-navy">{formatDate(invoice.issuedAt || invoice.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Vervaldatum</p>
                            <p className="text-sm font-black text-navy">{formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="text-left py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Omschrijving</th>
                                <th className="text-right py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] w-24">Bedrag</th>
                                <th className="text-right py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] w-24">Totaal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-8">
                                    <p className="font-black text-navy mb-1">{invoice.description}</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {invoice.type === 'maintenance' ? 'Periodieke factuur' : 'Eenmalige factuur'}
                                        {invoice.billingCycle && ` (${invoice.billingCycle === 'monthly' ? 'Maandelijks' : 'Jaarlijks'})`}
                                    </p>
                                </td>
                                <td className="py-8 text-right font-bold text-navy">€ {invoice.amount.toFixed(2)}</td>
                                <td className="py-8 text-right font-black text-navy">€ {invoice.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-24">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-bold">Subtotaal</span>
                            <span className="text-navy font-bold">€ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-bold">BTW (21%)</span>
                            <span className="text-navy font-bold">€ {taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t-2 border-navy/5">
                            <span className="text-navy font-black text-lg uppercase tracking-tight">Totaal</span>
                            <span className="text-navy font-black text-2xl tracking-tighter">€ {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-slate-100 grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Betalingsinstructies</h4>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Gelieve het totaalbedrag binnen de gestelde termijn over te maken naar ons bankrekeningnummer onder vermelding van het factuurnummer.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-4 justify-end items-start italic">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                            <p className="text-navy mb-0.5">KVK: 12345678</p>
                            <p>BTW: NL123456789B01</p>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight text-right">
                            <p className="text-navy mb-0.5">IBAN: NL00 BANK 0123 4567 89</p>
                            <p>BIC: BANKNL2U</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Dank u voor uw vertrouwen in AIleadsite</p>
                </div>
            </div>
        </div>
    );
}
