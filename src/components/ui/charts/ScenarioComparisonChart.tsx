import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { CHART_THEME } from './ChartConfig';
import { PremiumTooltip } from './PremiumTooltip';

interface ScenarioFactor {
    subject: string;
    A: number;
    B: number;
    C?: number;
    fullMark: number;
}

interface ScenarioComparisonChartProps {
    data: ScenarioFactor[];
    scenarios: string[];
}

export const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = ({
    data,
    scenarios
}) => {
    const colors = [
        CHART_THEME.colors.primary.solid,
        CHART_THEME.colors.cyan.solid,
        CHART_THEME.colors.secondary.solid
    ];

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />

                    {scenarios.map((name, i) => (
                        <Radar
                            key={name}
                            name={name}
                            dataKey={String.fromCharCode(65 + i)} // maps to A, B, C
                            stroke={colors[i]}
                            fill={colors[i]}
                            fillOpacity={0.2}
                            strokeWidth={3}
                        />
                    ))}

                    <Tooltip content={<PremiumTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
