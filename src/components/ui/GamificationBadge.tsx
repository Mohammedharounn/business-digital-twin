import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface GamificationBadgeProps {
    name: string;
    icon: string | React.ReactNode;
    tier: BadgeTier;
    isUnlocked: boolean;
    xpValue: number;
    unlockedDate?: string;
    className?: string;
}

const tierConfig = {
    bronze: "from-amber-700/20 to-transparent border-amber-700/30 text-amber-600",
    silver: "from-zinc-400/20 to-transparent border-zinc-400/30 text-zinc-400",
    gold: "from-yellow-500/20 to-transparent border-yellow-500/30 text-yellow-500",
    platinum: "from-brand-cyan/20 to-transparent border-brand-cyan/30 text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]"
};

export const GamificationBadge: React.FC<GamificationBadgeProps> = ({
    name,
    icon,
    tier,
    isUnlocked,
    xpValue,
    unlockedDate,
    className
}) => {
    return (
        <motion.div
            whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
            className={cn(
                "relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-500 group text-center",
                isUnlocked ? tierConfig[tier] : "bg-white/[0.02] border-white/5 grayscale opacity-40",
                className
            )}
        >
            <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl transition-transform duration-500",
                isUnlocked ? "bg-white/5 border border-white/10 group-hover:rotate-12" : "bg-black/20"
            )}>
                {isUnlocked ? icon : '🔒'}

                {isUnlocked && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                )}
            </div>

            <h4 className={cn(
                "text-sm font-display font-bold tracking-tight mb-1 uppercase",
                isUnlocked ? "text-white" : "text-zinc-600"
            )}>
                {name}
            </h4>

            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {tier} // +{xpValue} XP
                </span>

                {isUnlocked && unlockedDate && (
                    <span className="text-[8px] font-mono opacity-40 uppercase">NODAL_SYNC: {unlockedDate}</span>
                )}
            </div>

            {/* Internal Glow for Unlocked Badges */}
            {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
            )}
        </motion.div>
    );
};
