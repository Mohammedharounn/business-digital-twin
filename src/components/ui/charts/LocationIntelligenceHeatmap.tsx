import React from 'react';
import {
    Treemap,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { CHART_THEME } from './ChartConfig';
import { PremiumTooltip } from './PremiumTooltip';

interface RegionData {
    name: string;
    size: number; // Demand intensity
    growth: number;
    rent: number;
}

interface LocationIntelligenceHeatmapProps {
    data: RegionData[];
}

const CustomizedContent = (props: any) => {
    const { x, y, width, height, index, name, root, depth } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: CHART_THEME.colors.primary.faded,
                    stroke: 'rgba(255,255,255,0.1)',
                    strokeWidth: 2 / (depth + 1),
                    strokeOpacity: 1,
                }}
            />
            {width > 50 && height > 30 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={10}
                        fontWeight={900}
                        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                        {name}
                    </text>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + 12}
                        textAnchor="middle"
                        fill={CHART_THEME.colors.primary.solid}
                        fontSize={9}
                        fontWeight={700}
                        fontFamily="JetBrains Mono"
                    >
                        {Math.round(props.size / 100)}%
                    </text>
                </>
            )}
        </g>
    );
};

export const LocationIntelligenceHeatmap: React.FC<LocationIntelligenceHeatmapProps> = ({
    data
}) => {
    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                    data={data}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedContent />}
                >
                    <Tooltip content={<PremiumTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
};
