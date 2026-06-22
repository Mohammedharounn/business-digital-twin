import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Target, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/elements/Card';
import { Button } from '@/components/elements/Button';

interface ReportMetric {
    label: string;
    value: string;
    change: number;
    isPositive: boolean;
}

interface WeeklyReportCardProps {
    weekNumber: number;
    dateRange: string;
    executiveSummary: string;
    metrics: ReportMetric[];
    score: number;
    onViewDetails: () => void;
    className?: string;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
    weekNumber,
    dateRange,
    executiveSummary,
    metrics,
    score,
    onViewDetails,
    className
}) => {
    return (
        <Card className={cn("p-0 overflow-hidden group", className)}>
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-display font-bold text-white tracking-tight">Week {weekNumber} Synthesis</h4>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{dateRange}</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Health Score</div>
                    <div className="text-xl font-display font-black text-white">{score}<span className="text-zinc-700">/100</span></div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="flex gap-3">
                    <BrainCircuit className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-1" />
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                        "{executiveSummary}"
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <div key={i} className="space-y-2">
                            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block">{m.label}</span>
                            <div className="flex items-end gap-2">
                                <span className="text-sm font-display font-bold text-white">{m.value}</span>
                                <div className={cn(
                                    "flex items-center text-[9px] font-bold",
                                    m.isPositive ? "text-emerald-500" : "text-brand-rose"
                                )}>
                                    {m.isPositive ? <TrendingUp className="w-2 h-2 mr-1" /> : <TrendingDown className="w-2 h-2 mr-1" />}
                                    {m.change}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-zinc-600" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">3 New Directives Available</span>
                </div>
                <Button variant="secondary" size="sm" onClick={onViewDetails} className="px-8">
                    Audit Full Report
                </Button>
            </div>
        </Card>
    );
};
