import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Maximize2, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/elements/Button';

interface ChartContainerProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    headerActions?: ReactNode;
    className?: string;
    isLoading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
    title,
    subtitle,
    children,
    headerActions,
    className,
    isLoading
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "glass-panel p-8 flex flex-col min-h-[400px] border border-white/5",
                className
            )}
        >
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">{title}</h3>
                    {subtitle && (
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">{subtitle}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {headerActions || (
                        <>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <RefreshCw className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Maximize2 className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Hydrating Chart Data</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full">
                        {children}
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_5px_#6366f1]" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Baseline Config</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Market Median</span>
                    </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-700">SYS_V4_CORE</span>
            </div>
        </motion.div>
    );
};
