import React from 'react';
import {
    AreaChart,
    Area,
    ResponsiveContainer
} from 'recharts';
import { CHART_THEME } from './ChartConfig';

interface KPITrendChartProps {
    data: { val: number }[];
    color?: string;
}

export const KPITrendChart: React.FC<KPITrendChartProps> = ({
    data,
    color = CHART_THEME.colors.primary.solid
}) => {
    return (
        <div className="w-full h-12">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#grad-${color})`}
                        fillOpacity={1}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
