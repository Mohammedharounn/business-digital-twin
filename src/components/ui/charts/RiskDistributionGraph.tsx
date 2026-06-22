import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { CHART_THEME } from './ChartConfig';
import { PremiumTooltip } from './PremiumTooltip';

interface RiskPoint {
    probability: number; // 0-100
    impact: number;      // 0-100
    size: number;        // Importance/Magnitude
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RiskDistributionGraphProps {
    data: RiskPoint[];
}

export const RiskDistributionGraph: React.FC<RiskDistributionGraphProps> = ({
    data
}) => {
    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'critical': return CHART_THEME.colors.danger.solid;
            case 'high': return CHART_THEME.colors.warning.solid;
            case 'medium': return CHART_THEME.colors.primary.solid;
            default: return CHART_THEME.colors.info.solid;
        }
    };

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

                    <XAxis
                        type="number"
                        dataKey="probability"
                        name="Probability"
                        unit="%"
                        domain={[0, 100]}
                        tick={CHART_THEME.text}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        type="number"
                        dataKey="impact"
                        name="Impact"
                        unit="pts"
                        domain={[0, 100]}
                        tick={CHART_THEME.text}
                        axisLine={false}
                        tickLine={false}
                    />

                    <ZAxis type="number" dataKey="size" range={[100, 1000]} />

                    <Tooltip content={<PremiumTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                    <ReferenceLine x={50} stroke="rgba(255,255,255,0.05)" />
                    <ReferenceLine y={50} stroke="rgba(255,255,255,0.05)" />

                    <Scatter name="Risks" data={data}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getSeverityColor(entry.severity)}
                                fillOpacity={0.6}
                                stroke={getSeverityColor(entry.severity)}
                                strokeWidth={2}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>

            {/* Legend Labels */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 pointer-events-none">
                <div className="text-[8px] font-black text-brand-rose opacity-40 uppercase tracking-widest text-right">High Impact / Probable</div>
                <div className="text-[8px] font-black text-zinc-800 uppercase tracking-widest text-right">Low Risk Zone</div>
            </div>
        </div>
    );
};
