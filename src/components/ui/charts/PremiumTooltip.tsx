import React from 'react';
import { CHART_THEME } from './ChartConfig';
import { cn } from '@/lib/utils';

interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    prefix?: string;
    suffix?: string;
    formatter?: (value: any) => string;
}

export const PremiumTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
    prefix = '',
    suffix = '',
    formatter
}) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="glass-panel p-4 border border-white/10 shadow-2xl bg-black/80 backdrop-blur-xl min-w-[200px]">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {label}
                </span>
                <span className="text-[8px] font-mono text-zinc-700">NODE_DATA</span>
            </div>

            <div className="space-y-3">
                {payload.map((item, index) => (
                    <div key={index} className="flex justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    backgroundColor: item.color || item.fill,
                                    boxShadow: `0 0 10px ${item.color || item.fill}`
                                }}
                            />
                            <span className="text-[11px] font-bold text-zinc-400">
                                {item.name}
                            </span>
                        </div>
                        <span className="text-[12px] font-display font-black text-white">
                            {prefix}{formatter ? formatter(item.value) : item.value}{suffix}
                        </span>
                    </div>
                ))}
            </div>

            {payload[0]?.payload?.note && (
                <p className="mt-4 pt-4 border-t border-white/5 text-[9px] text-zinc-600 font-medium italic">
                    AI Observation: {payload[0].payload.note}
                </p>
            )}
        </div>
    );
};
