"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Eye, Receipt, Folder, Info, ChevronRight } from "lucide-react";
import {
    ClientNotification,
    getClientNotifications,
    markNotificationRead
} from "@/lib/services/notificationService";
import { useAuth } from "@/context/AuthContext";

const TYPE_ICON: Record<ClientNotification["type"], React.ElementType> = {
    review_design: Eye,
    pay_invoice: Receipt,
    action_required: Bell,
    info: Info,
    project_update: Folder,
};

const TYPE_STYLE: Record<ClientNotification["type"], string> = {
    review_design: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    pay_invoice: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    action_required: "bg-red-500/10 border-red-500/20 text-red-300",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    project_update: "bg-green-500/10 border-green-500/20 text-green-300",
};

interface ClientNotificationBannerProps {
    clientId: string;
    onActionClick?: (notification: ClientNotification) => void;
}

export default function ClientNotificationBanner({ clientId, onActionClick }: ClientNotificationBannerProps) {
    const [notifications, setNotifications] = useState<ClientNotification[]>([]);
    const [open, setOpen] = useState(false);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    const { userData } = useAuth();
    const userEmail = userData?.email || undefined;

    const load = useCallback(async () => {
        try {
            const all = await getClientNotifications(clientId, userEmail);
            setNotifications(all);
        } catch (e) {
            console.error("Error loading notifications:", e);
        }
    }, [clientId, userEmail]);

    useEffect(() => {
        load();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [load]);

    const unread = notifications.filter(n => !n.isRead && !dismissedIds.has(n.id));
    const allDisplayed = notifications.filter(n => !dismissedIds.has(n.id));

    const handleDismiss = async (id: string) => {
        setDismissedIds(prev => new Set([...prev, id]));
        try { await markNotificationRead(id); } catch {}
    };

    const handleMarkAllRead = async () => {
        const promises = unread.map(n => markNotificationRead(n.id));
        await Promise.allSettled(promises);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white"
            >
                <Bell className="w-4 h-4" />
                {unread.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                        {unread.length}
                    </span>
                )}
                <span className="text-xs font-bold hidden sm:inline">Meldingen</span>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-navy border border-white/10 rounded-2xl shadow-2xl shadow-black/30 z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">
                            Meldingen
                            {unread.length > 0 && (
                                <span className="ml-2 text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-black">
                                    {unread.length} nieuw
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unread.length > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wide"
                                >
                                    Alles gelezen
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                        {allDisplayed.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 text-sm">
                                Geen meldingen
                            </div>
                        ) : (
                            allDisplayed.map(notif => {
                                const Icon = TYPE_ICON[notif.type];
                                const styleClass = TYPE_STYLE[notif.type];
                                const isUnread = !notif.isRead;
                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-4 transition-all hover:bg-white/5 ${isUnread ? "bg-white/[0.03]" : ""}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${styleClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-white leading-tight">{notif.title}</p>
                                                    {isUnread && (
                                                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                                                {notif.relatedId && onActionClick && (
                                                    <button
                                                        onClick={() => { onActionClick(notif); setOpen(false); }}
                                                        className="mt-2 flex items-center gap-1 text-[10px] font-bold text-accent hover:text-orange-400 uppercase tracking-wide transition-colors"
                                                    >
                                                        Bekijken <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDismiss(notif.id)}
                                                className="text-slate-600 hover:text-white transition-colors shrink-0 mt-0.5"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
