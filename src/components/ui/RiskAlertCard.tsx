import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

interface RiskAlertProps {
    id: string;
    title: string;
    description: string;
    severity: RiskSeverity;
    category: string;
    onDismiss?: (id: string) => void;
    className?: string;
}

const severityConfig = {
    low: {
        icon: Info,
        color: 'text-brand-cyan',
        bg: 'bg-brand-cyan/10',
        border: 'border-brand-cyan/20'
    },
    medium: {
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },
    high: {
        icon: AlertCircle,
        color: 'text-brand-rose',
        bg: 'bg-brand-rose/10',
        border: 'border-brand-rose/20'
    },
    critical: {
        icon: ShieldAlert,
        color: 'text-brand-rose',
        bg: 'bg-brand-rose/20',
        border: 'border-brand-rose/40 animate-pulse'
    }
};

export const RiskAlertCard: React.FC<RiskAlertProps> = ({
    id,
    title,
    description,
    severity,
    category,
    onDismiss,
    className
}) => {
    const config = severityConfig[severity];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "p-6 rounded-2xl border flex gap-6 group transition-all duration-300",
                config.bg,
                config.border,
                className
            )}
        >
            <div className={cn("p-4 rounded-xl bg-black/20 flex-shrink-0", config.color)}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1 block", config.color)}>
                            {category} // {severity} RISK
                        </span>
                        <h4 className="text-sm font-display font-bold text-white tracking-tight uppercase">
                            {title}
                        </h4>
                    </div>

                    {onDismiss && (
                        <button
                            onClick={() => onDismiss(id)}
                            className="text-zinc-600 hover:text-white transition-colors"
                        >
                            <span className="text-[10px] font-black">ACKNOWLEDGE</span>
                        </button>
                    )}
                </div>

                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    {description}
                </p>

                <div className="pt-4 flex gap-4">
                    <button className="text-[9px] font-black text-white px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all uppercase tracking-widest">
                        Synthesize Mitigation
                    </button>
                    <button className="text-[9px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                        View Node Data
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
