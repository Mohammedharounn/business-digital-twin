import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPIWidgetProps {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: LucideIcon;
    description?: string;
    className?: string;
    variant?: 'default' | 'primary' | 'cyan' | 'emerald' | 'rose';
}

const variants = {
    default: "from-white/5 to-transparent border-white/5",
    primary: "from-brand-primary/10 to-transparent border-brand-primary/20",
    cyan: "from-brand-cyan/10 to-transparent border-brand-cyan/20",
    emerald: "from-brand-emerald/10 to-transparent border-brand-emerald/20",
    rose: "from-brand-rose/10 to-transparent border-brand-rose/20",
};

export const KPIWidget: React.FC<KPIWidgetProps> = ({
    label,
    value,
    trend,
    icon: Icon,
    description,
    className,
    variant = 'default'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300 group overflow-hidden",
                variants[variant],
                className
            )}
        >
            <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</p>
                    <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>

                    {trend && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                                trend.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">vs last synced</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                )}
            </div>

            {description && (
                <p className="mt-4 text-[11px] text-zinc-500 font-medium leading-relaxed">{description}</p>
            )}

            {/* Decorative Glow */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
        </motion.div>
    );
};
