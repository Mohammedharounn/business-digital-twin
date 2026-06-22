import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Bell, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/elements/Button';

export type NotificationType = 'system' | 'risk' | 'success' | 'alert';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    className?: string;
}

const typeConfig = {
    system: { icon: Info, color: 'text-brand-cyan' },
    risk: { icon: AlertTriangle, color: 'text-brand-rose' },
    success: { icon: CheckCircle2, color: 'text-emerald-500' },
    alert: { icon: Bell, color: 'text-amber-500' }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkRead,
    className
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: 400 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 400 }}
                        className={cn(
                            "fixed top-0 right-0 h-screen w-full max-w-[400px] glass-panel !rounded-none border-y-0 border-r-0 border-white/5 z-[101] bg-bg-surface/90 backdrop-blur-3xl p-0 flex flex-col",
                            className
                        )}
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">Pulse Monitor</h3>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Active Notifications ({notifications.length})</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <Bell className="w-12 h-12 text-zinc-800 mb-6" />
                                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Neural Link Static // No Activity</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map((n) => {
                                        const Config = typeConfig[n.type];
                                        const Icon = Config.icon;
                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => onMarkRead(n.id)}
                                                className={cn(
                                                    "p-8 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-white/5 last:border-0 relative group",
                                                    !n.isRead && "bg-brand-primary/[0.02]"
                                                )}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary shadow-[0_0_10px_#6366f1]" />
                                                )}
                                                <div className="flex gap-6">
                                                    <div className={cn("p-3 rounded-xl bg-black/20 flex-shrink-0 h-fit", Config.color)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{n.title}</h4>
                                                            <span className="text-[9px] font-mono text-zinc-700">{n.time}</span>
                                                        </div>
                                                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-4">
                                                            {n.message}
                                                        </p>
                                                        {!n.isRead && (
                                                            <button className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors">
                                                                Acknowledge Node
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-white/5">
                            <Button variant="secondary" className="w-full">
                                Purge Synced Cache
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
