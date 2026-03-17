import { UserData, InvoiceData } from "@/types/database";
import ClientList from "@/components/dashboard/ClientList";
import { Plus } from "lucide-react";

interface ClientViewProps {
    clients: UserData[];
    invoices: InvoiceData[];
    onSelectClient: (client: UserData | null) => void;
    onNewClient: () => void;
}

export default function ClientView({ clients, invoices, onSelectClient, onNewClient }: ClientViewProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold font-display text-navy mb-1">Klanten</h1>
                    <p className="text-sm text-slate-500 font-medium">{clients.length} geregistreerde klanten</p>
                </div>
                <button
                    onClick={onNewClient}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-4 h-4" /> Nieuwe Klant
                </button>
            </div>
            <ClientList 
                clients={clients} 
                invoices={invoices} 
                onSelectClient={onSelectClient} 
            />
        </div>
    );
}
