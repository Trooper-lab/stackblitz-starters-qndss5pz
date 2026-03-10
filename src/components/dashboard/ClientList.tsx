"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/lib/services/clientService";
import { UserData } from "@/types/database";
import { Timestamp, FieldValue } from "firebase/firestore";

interface ClientListProps {
    onSelectClient: (client: UserData) => void;
}

export default function ClientList({ onSelectClient }: ClientListProps) {
    const [clients, setClients] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch (error) {
                console.error("Failed to fetch clients", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
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

    if (clients.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                <p className="opacity-40">Nog geen klanten geregistreerd.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-semibold text-sm opacity-70">Naam</th>
                        <th className="p-4 font-semibold text-sm opacity-70">Email</th>
                        <th className="p-4 font-semibold text-sm opacity-70">Bedrijf</th>
                        <th className="p-4 font-semibold text-sm opacity-70">Geregistreerd</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr
                            key={client.uid}
                            onClick={() => onSelectClient(client)}
                            className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <td className="p-4 font-medium">{client.displayName || "Onbekend"}</td>
                            <td className="p-4 opacity-70">{client.email}</td>
                            <td className="p-4 opacity-70">{client.companyDetails?.name || "-"}</td>
                            <td className="p-4 opacity-70 text-sm border-0">
                                {formatDate(client.createdAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
