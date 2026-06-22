import React from 'react';
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line,
    ReferenceLine,
    Defs,
    LinearGradient
} from 'recharts';
import { CHART_THEME } from './ChartConfig';
import { PremiumTooltip } from './PremiumTooltip';
import { formatCurrency } from '@/lib/utils';

interface DataPoint {
    month: string;
    revenue: number;
    expenses: number;
    cashFlow: number;
    profit: number;
    note?: string;
}

interface FinancialTrajectoryChartProps {
    data: DataPoint[];
    isLoading?: boolean;
}

export const FinancialTrajectoryChart: React.FC<FinancialTrajectoryChartProps> = ({
    data,
    isLoading
}) => {
    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_THEME.colors.primary.solid} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={CHART_THEME.colors.primary.solid} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_THEME.colors.danger.solid} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={CHART_THEME.colors.danger.solid} stopOpacity={0} />
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
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={CHART_THEME.text}
                        tickFormatter={(v) => `E£${v / 1000}k`}
                    />

                    <Tooltip content={<PremiumTooltip formatter={(v) => formatCurrency(v)} />} />

                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="none"
                        fill="url(#colorProfit)"
                        fillOpacity={1}
                    />

                    <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="none"
                        fill="url(#colorExpenses)"
                        fillOpacity={1}
                    />

                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

                    <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={CHART_THEME.colors.success.solid}
                        strokeWidth={3}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, shadow: '0 0 10px rgba(16,185,129,0.5)' }}
                        name="Net Profit"
                    />

                    <Line
                        type="monotone"
                        dataKey="cashFlow"
                        stroke={CHART_THEME.colors.info.solid}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 0 }}
                        name="Cash Reserve"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
