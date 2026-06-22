import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceLine
} from 'recharts';
import { CHART_THEME } from './ChartConfig';
import { PremiumTooltip } from './PremiumTooltip';
import { formatCurrency } from '@/lib/utils';

interface BreakEvenDataPoint {
    month: number;
    cumulativeRevenue: number;
    cumulativeCost: number;
}

interface BreakEvenChartProps {
    data: BreakEvenDataPoint[];
    breakEvenMonth?: number;
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({
    data,
    breakEvenMonth
}) => {
    const bePoint = data.find(d => d.month === breakEvenMonth);

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="beProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_THEME.colors.emerald.solid} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={CHART_THEME.colors.emerald.solid} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="beCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_THEME.colors.rose.solid} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={CHART_THEME.colors.rose.solid} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray={CHART_THEME.grid.strokeDasharray}
                        stroke={CHART_THEME.grid.stroke}
                        vertical={false}
                    />

                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={CHART_THEME.text}
                        tickFormatter={(v) => `M${v}`}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={CHART_THEME.text}
                        tickFormatter={(v) => `E£${(v / 1000).toFixed(0)}k`}
                    />

                    <Tooltip content={<PremiumTooltip formatter={(v) => formatCurrency(v)} />} />

                    <Area
                        type="monotone"
                        dataKey="cumulativeRevenue"
                        name="Cumulative Revenue"
                        stroke={CHART_THEME.colors.emerald.solid}
                        strokeWidth={3}
                        fill="url(#beProfit)"
                    />

                    <Area
                        type="monotone"
                        dataKey="cumulativeCost"
                        name="Cumulative Investment"
                        stroke={CHART_THEME.colors.rose.solid}
                        strokeWidth={3}
                        fill="url(#beCost)"
                    />

                    {bePoint && (
                        <>
                            <ReferenceLine
                                x={breakEvenMonth}
                                stroke={CHART_THEME.colors.info.solid}
                                strokeDasharray="3 3"
                                label={{
                                    value: 'BREAK-EVEN',
                                    position: 'top',
                                    fill: CHART_THEME.colors.info.solid,
                                    fontSize: 10,
                                    fontWeight: 900,
                                    letterSpacing: '0.1em'
                                }}
                            />
                            <ReferenceDot
                                x={breakEvenMonth}
                                y={bePoint.cumulativeRevenue}
                                r={8}
                                fill={CHART_THEME.colors.info.solid}
                                stroke="white"
                                strokeWidth={3}
                            />
                        </>
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
