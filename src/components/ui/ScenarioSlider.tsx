import React from 'react';
import { cn } from '@/lib/utils';

interface ScenarioSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    className?: string;
    prefix?: string;
}

export const ScenarioSlider: React.FC<ScenarioSliderProps> = ({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange,
    className,
    prefix
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("space-y-4 py-4", className)}>
            <div className="flex justify-between items-end">
                <div>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1 block">
                        {label}
                    </label>
                </div>
                <div className="text-right">
                    <span className="text-lg font-display font-bold text-white leading-none">
                        {prefix}{value.toLocaleString()}{unit}
                    </span>
                </div>
            </div>

            <div className="relative h-1.5 w-full bg-white/[0.03] border border-white/5 rounded-full group cursor-pointer">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-brand-primary"
                />

                {/* Visual Handle */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-primary rounded-full shadow-xl pointer-events-none group-hover:scale-125 transition-transform"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />
            </div>

            <div className="flex justify-between px-1">
                <span className="text-[8px] font-mono text-zinc-700">{min}{unit}</span>
                <span className="text-[8px] font-mono text-zinc-700">{max}{unit}</span>
            </div>
        </div>
    );
};
