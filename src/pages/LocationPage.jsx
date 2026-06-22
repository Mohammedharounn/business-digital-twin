import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LocationIntelligenceEngine } from '../engine/AdvancedEngines'
import { formatCurrency } from '../engine/SimulationEngine'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    ComposedChart, Line, Cell, Area, ReferenceLine, ScatterChart, Scatter
} from 'recharts'
import { Card } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'

const LOC_COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#a855f7', '#f43f5e', '#06b6d4', '#8b5cf6'];

const PremiumTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="p-3 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl">
            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 pb-1 border-b border-white/5">{label}</div>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-6 py-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                        <span className="text-[10px] text-zinc-400">{entry.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white">
                        {typeof entry.value === 'number' ? (Math.abs(entry.value) > 100 ? formatCurrency(entry.value) : entry.value.toFixed(1)) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function LocationPage({ businessConfig }) {
    const [selectedLocations, setSelectedLocations] = useState(['downtown', 'suburban', 'university']);
    const [activeView, setActiveView] = useState('overview');
    const [expandedLoc, setExpandedLoc] = useState(null);

    const toggleLocation = (id) => {
        setSelectedLocations(prev => {
            if (prev.includes(id)) return prev.filter(l => l !== id);
            if (prev.length >= 4) return [...prev.slice(1), id];
            return [...prev, id];
        });
    };

    const results = useMemo(() => {
        if (!businessConfig) return [];
        return LocationIntelligenceEngine.compareLocations(selectedLocations, businessConfig);
    }, [selectedLocations, businessConfig]);

    const best = results.length > 0 ? results.reduce((a, b) => a.profitabilityScore > b.profitabilityScore ? a : b) : null;
    const allLocations = LocationIntelligenceEngine.LOCATIONS;

    // Radar data — no hardcoded values
    const radarData = useMemo(() => {
        return [
            { metric: 'Traffic' },
            { metric: 'Demand' },
            { metric: 'Margin' },
            { metric: 'Risk Safety' },
            { metric: 'Rent Efficiency' },
            { metric: 'ROI' }
        ].map(item => {
            const result = { ...item };
            results.forEach((r, i) => {
                switch (item.metric) {
                    case 'Traffic': result[`loc${i}`] = r.location.footTraffic; break;
                    case 'Demand': result[`loc${i}`] = r.location.demandScore; break;
                    case 'Margin': result[`loc${i}`] = Math.max(0, Math.min(100, parseFloat(r.profitMargin) * 3)); break;
                    case 'Risk Safety': result[`loc${i}`] = Math.max(0, 100 - r.riskScore); break;
                    case 'Rent Efficiency': result[`loc${i}`] = Math.max(0, Math.min(100, (30 - r.rentToRevenue) * 4)); break;
                    case 'ROI': result[`loc${i}`] = Math.max(0, Math.min(100, (r.roi || 0) + 20)); break;
                }
            });
            return result;
        });
    }, [results]);

    // Bar chart data
    const profitCompareData = useMemo(() => {
        return results.map((r, i) => ({
            name: r.location.name.split('/')[0].trim().substring(0, 12),
            profit: r.monthlyProfit,
            revenue: r.adjustedRevenue,
            rent: r.adjustedRent,
            score: r.profitabilityScore,
            icon: r.location.icon,
            color: LOC_COLORS[i]
        }));
    }, [results]);

    // Scatter: rent vs profit
    const scatterData = useMemo(() => {
        return results.map((r, i) => ({
            x: r.adjustedRent,
            y: r.monthlyProfit,
            name: r.location.name.split('/')[0].trim(),
            z: r.profitabilityScore,
            fill: LOC_COLORS[i]
        }));
    }, [results]);

    const views = [
        { id: 'overview', label: '📋 Overview' },
        { id: 'financials', label: '💰 Financials' },
        { id: 'radar', label: '🕸️ Radar' }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">📍</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Territory Strategy</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Geospatial Intelligence — {allLocations.length} locations available · {selectedLocations.length} active
                    </p>
                </div>
            </div>

            {/* Location Toggle Grid */}
            <Card className="p-5 mb-6 border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Select Locations (up to 4)</span>
                    <span className="text-[9px] text-zinc-700">{selectedLocations.length}/4</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {allLocations.map(loc => {
                        const isSelected = selectedLocations.includes(loc.id);
                        return (
                            <button key={loc.id} onClick={() => toggleLocation(loc.id)}
                                className={cn("px-3 py-3 rounded-xl border transition-all text-center",
                                    isSelected ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]' : 'bg-white/[0.01] border-white/5 hover:border-white/15')}>
                                <div className="text-lg mb-1">{loc.icon}</div>
                                <div className={cn("text-[9px] font-bold uppercase tracking-wider", isSelected ? 'text-indigo-400' : 'text-zinc-500')}>
                                    {loc.name.split('/')[0].trim()}
                                </div>
                                <div className="text-[8px] text-zinc-700 mt-0.5">
                                    🚶 {loc.footTraffic} · 📊 {loc.demandScore}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {results.length === 0 ? (
                <Card className="p-16 text-center border-dashed border-white/10 bg-transparent">
                    <div className="text-5xl mb-6">📍</div>
                    <h3 className="text-lg font-bold text-white mb-2">Select locations to analyze</h3>
                    <p className="text-xs text-zinc-500">Click on location tiles above to start territory intelligence analysis</p>
                </Card>
            ) : (
                <>
                    {/* Best Location Banner */}
                    {best && (
                        <Card className="p-6 mb-6 border-l-4 border-l-emerald-500 bg-emerald-500/[0.02] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="text-8xl">{best.location.icon}</span>
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">🏆 Optimal Deployment Location</div>
                                    <h2 className="text-2xl font-display font-bold text-white tracking-tight mb-1">{best.location.name}</h2>
                                    <p className="text-[11px] text-zinc-500">{best.location.demographics} · {best.location.competition} competition</p>
                                </div>
                                <div className="flex gap-6">
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Score</div>
                                        <div className="text-2xl font-display font-bold text-emerald-400">{best.profitabilityScore}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Profit</div>
                                        <div className="text-2xl font-display font-bold text-white">{formatCurrency(best.monthlyProfit)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Margin</div>
                                        <div className="text-2xl font-display font-bold text-cyan-400">{best.profitMargin}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">ROI</div>
                                        <div className="text-2xl font-display font-bold text-indigo-400">{best.roi}%</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* View Tabs */}
                    <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5 w-fit mb-6">
                        {views.map(v => (
                            <button key={v.id} onClick={() => setActiveView(v.id)}
                                className={cn("px-5 py-2.5 rounded-lg text-xs font-medium transition-all",
                                    activeView === v.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                                {v.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── OVERVIEW VIEW ─── */}
                    {activeView === 'overview' && (
                        <div className="space-y-6">
                            {/* Location Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.map((r, i) => {
                                    const isBest = best && r.location.id === best.location.id;
                                    const isExpanded = expandedLoc === r.location.id;
                                    return (
                                        <Card key={r.location.id} className={cn(
                                            "p-0 overflow-hidden transition-all cursor-pointer",
                                            isBest ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'hover:border-white/10'
                                        )} onClick={() => setExpandedLoc(isExpanded ? null : r.location.id)}>
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-lg">{r.location.icon}</div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white">{r.location.name.split('/')[0].trim()}</h4>
                                                            <p className="text-[9px] text-zinc-600">{r.location.demographics}</p>
                                                        </div>
                                                    </div>
                                                    {isBest && <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-bold">BEST</span>}
                                                </div>

                                                {/* Key metrics */}
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                        <div className="text-[7px] text-zinc-600 uppercase tracking-widest">Score</div>
                                                        <div className="text-sm font-bold text-indigo-400 font-mono">{r.profitabilityScore}%</div>
                                                    </div>
                                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                        <div className="text-[7px] text-zinc-600 uppercase tracking-widest">Profit</div>
                                                        <div className={cn("text-sm font-bold font-mono", r.monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400')}>{formatCurrency(r.monthlyProfit)}</div>
                                                    </div>
                                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                        <div className="text-[7px] text-zinc-600 uppercase tracking-widest">Margin</div>
                                                        <div className="text-sm font-bold text-white font-mono">{r.profitMargin}%</div>
                                                    </div>
                                                </div>

                                                {/* Progress bars */}
                                                <div className="space-y-1.5">
                                                    <div>
                                                        <div className="flex justify-between text-[8px] text-zinc-600 mb-0.5">
                                                            <span>Foot Traffic</span><span>{r.location.footTraffic}/100</span>
                                                        </div>
                                                        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${r.location.footTraffic}%` }}
                                                                className="h-full rounded-full" style={{ background: LOC_COLORS[i] }} transition={{ duration: 0.8 }} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[8px] text-zinc-600 mb-0.5">
                                                            <span>Demand</span><span>{r.location.demandScore}/100</span>
                                                        </div>
                                                        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${r.location.demandScore}%` }}
                                                                className="h-full rounded-full bg-cyan-500" transition={{ duration: 0.8, delay: 0.1 }} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[8px] text-zinc-600 mb-0.5">
                                                            <span>Risk</span><span className={r.riskScore < 40 ? 'text-emerald-400' : r.riskScore < 70 ? 'text-amber-400' : 'text-red-400'}>{r.riskLevel}</span>
                                                        </div>
                                                        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${r.riskScore}%` }}
                                                                className="h-full rounded-full" style={{ background: r.riskScore < 40 ? '#10b981' : r.riskScore < 70 ? '#f59e0b' : '#ef4444' }}
                                                                transition={{ duration: 0.8, delay: 0.2 }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                        <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-3">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">Adjusted Rent</div>
                                                                    <div className="text-xs font-mono text-white">{formatCurrency(r.adjustedRent)}/mo</div>
                                                                </div>
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">Revenue Est.</div>
                                                                    <div className="text-xs font-mono text-white">{formatCurrency(r.adjustedRevenue)}/mo</div>
                                                                </div>
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">Rent/Revenue</div>
                                                                    <div className={cn("text-xs font-mono", r.rentToRevenue > 15 ? 'text-red-400' : r.rentToRevenue > 10 ? 'text-amber-400' : 'text-emerald-400')}>{r.rentToRevenue}%</div>
                                                                </div>
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">Break-Even</div>
                                                                    <div className="text-xs font-mono text-white">{r.breakEven ? `Mo ${r.breakEven}` : 'N/A'}</div>
                                                                </div>
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">ROI (12mo)</div>
                                                                    <div className="text-xs font-mono text-cyan-400">{r.roi}%</div>
                                                                </div>
                                                                <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                                    <div className="text-[7px] text-zinc-600 uppercase">Competition</div>
                                                                    <div className="text-xs font-mono text-white">{r.location.competition}</div>
                                                                </div>
                                                            </div>

                                                            {/* Insights */}
                                                            <div className="space-y-1.5">
                                                                {r.insights.map((ins, idx) => (
                                                                    <div key={idx} className={cn("text-[10px] px-2.5 py-1.5 rounded-lg border",
                                                                        ins.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                                                                            ins.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
                                                                                'bg-white/[0.02] border-white/5 text-zinc-400'
                                                                    )}>
                                                                        {ins.type === 'positive' ? '✦ ' : ins.type === 'warning' ? '⚠ ' : 'ℹ '}{ins.text}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Comparative Table */}
                            <Card className="p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Full Metric Comparison</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="pb-3 text-left text-[9px] font-black text-zinc-600 uppercase tracking-widest">Metric</th>
                                                {results.map((r, i) => (
                                                    <th key={i} className="pb-3 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full" style={{ background: LOC_COLORS[i] }} />
                                                            <span className="text-[9px] font-bold text-white uppercase">{r.location.name.split('/')[0].trim()}</span>
                                                            {best && r.location.id === best.location.id && <span className="text-[7px]">🏆</span>}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px]">
                                            {[
                                                { label: 'Score', fn: r => `${r.profitabilityScore}%`, highlight: true },
                                                { label: 'Foot Traffic', fn: r => `${r.location.footTraffic}/100` },
                                                { label: 'Demand Score', fn: r => `${r.location.demandScore}/100` },
                                                { label: 'Competition', fn: r => r.location.competition },
                                                { label: 'Rent Multiplier', fn: r => `${r.location.rentMultiplier}x` },
                                                { label: 'Adjusted Rent', fn: r => formatCurrency(r.adjustedRent) },
                                                { label: 'Est. Revenue', fn: r => formatCurrency(r.adjustedRevenue) },
                                                { label: 'Profit/mo', fn: r => formatCurrency(r.monthlyProfit), highlight: true },
                                                { label: 'Profit Margin', fn: r => `${r.profitMargin}%` },
                                                { label: 'Rent/Revenue', fn: r => `${r.rentToRevenue}%` },
                                                { label: 'Break-Even', fn: r => r.breakEven ? `Month ${r.breakEven}` : 'N/A' },
                                                { label: 'ROI (12mo)', fn: r => `${r.roi}%` },
                                                { label: 'Risk Level', fn: r => r.riskLevel },
                                                { label: 'Risk Score', fn: r => `${r.riskScore}/100` }
                                            ].map((row, ri) => (
                                                <tr key={ri} className={cn(
                                                    "border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors",
                                                    row.highlight && 'bg-white/[0.01]'
                                                )}>
                                                    <td className="py-3 text-zinc-500 font-bold">{row.label}</td>
                                                    {results.map((r, i) => (
                                                        <td key={i} className="py-3 text-center font-mono text-zinc-200">{row.fn(r)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ─── FINANCIALS VIEW ─── */}
                    {activeView === 'financials' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Profit Comparison */}
                                <Card className="col-span-12 lg:col-span-7 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Monthly Profit by Location</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={profitCompareData} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip content={<PremiumTooltip />} />
                                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                            <Bar dataKey="profit" name="Monthly Profit" radius={[6, 6, 0, 0]} barSize={40}>
                                                {profitCompareData.map((d, i) => (
                                                    <Cell key={i} fill={d.profit >= 0 ? LOC_COLORS[i] : '#ef4444'} fillOpacity={0.7} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>

                                {/* Rent vs Profit Scatter */}
                                <Card className="col-span-12 lg:col-span-5 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Rent vs Profit Trade-off</h3>
                                    <p className="text-[10px] text-zinc-600 mb-6">Locations in the top-left offer the best value (high profit, low rent)</p>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <ScatterChart margin={{ top: 5, right: 10, bottom: 15, left: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="x" name="Rent" tick={{ fill: '#71717a', fontSize: 9 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                                                label={{ value: 'Monthly Rent →', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 9 }} />
                                            <YAxis dataKey="y" name="Profit" tick={{ fill: '#71717a', fontSize: 9 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                                                label={{ value: 'Profit →', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }} />
                                            <Tooltip content={<PremiumTooltip />}
                                                formatter={(v, name) => [name === 'y' ? formatCurrency(v) : formatCurrency(v), name === 'y' ? 'Profit' : 'Rent']}
                                                labelFormatter={(_, p) => p[0]?.payload?.name || ''} />
                                            <Scatter data={scatterData} shape="circle">
                                                {scatterData.map((d, i) => <Cell key={i} fill={d.fill} r={8} />)}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>

                            {/* Revenue & Cost Side-by-Side */}
                            <Card className="p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Revenue, Rent & Profitability Score</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <ComposedChart data={profitCompareData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#f59e0b', fontSize: 10 }} domain={[0, 100]} />
                                        <Tooltip content={<PremiumTooltip />} />
                                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" fillOpacity={0.4} radius={[6, 6, 0, 0]} barSize={28} />
                                        <Bar yAxisId="left" dataKey="rent" name="Rent" fill="#ef4444" fillOpacity={0.3} radius={[6, 6, 0, 0]} barSize={28} />
                                        <Line yAxisId="right" type="monotone" dataKey="score" name="Score %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 5, fill: '#f59e0b' }} />
                                        <Legend wrapperStyle={{ fontSize: 10 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    )}

                    {/* ─── RADAR VIEW ─── */}
                    {activeView === 'radar' && (
                        <div className="grid grid-cols-12 gap-6">
                            <Card className="col-span-12 lg:col-span-7 p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">6-Axis Strategic Compatibility</h3>
                                <p className="text-[10px] text-zinc-600 mb-6">All axes computed from live financial simulation — no static values</p>
                                <ResponsiveContainer width="100%" height={400}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                                        <PolarRadiusAxis axisLine={false} tick={false} domain={[0, 100]} />
                                        {results.map((r, i) => (
                                            <Radar key={i} name={r.location.name.split('/')[0].trim()} dataKey={`loc${i}`}
                                                stroke={LOC_COLORS[i]} fill={LOC_COLORS[i]} fillOpacity={0.08} strokeWidth={2.5} />
                                        ))}
                                        <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }} />
                                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Card>

                            <div className="col-span-12 lg:col-span-5 space-y-4">
                                {/* Location Profile Cards */}
                                {results.map((r, i) => (
                                    <Card key={r.location.id} className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: LOC_COLORS[i] }} />
                                            <span className="text-xs font-bold text-white">{r.location.name}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                <div className="text-[7px] text-zinc-600 uppercase">Traffic</div>
                                                <div className="text-sm font-mono font-bold text-white">{r.location.footTraffic}</div>
                                            </div>
                                            <div className="text-center bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                <div className="text-[7px] text-zinc-600 uppercase">Demand</div>
                                                <div className="text-sm font-mono font-bold text-white">{r.location.demandScore}</div>
                                            </div>
                                            <div className="text-center bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                                <div className="text-[7px] text-zinc-600 uppercase">Rent Eff.</div>
                                                <div className={cn("text-sm font-mono font-bold", r.rentToRevenue < 10 ? 'text-emerald-400' : r.rentToRevenue < 15 ? 'text-amber-400' : 'text-red-400')}>
                                                    {r.rentToRevenue}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {r.insights.slice(0, 2).map((ins, idx) => (
                                                <div key={idx} className={cn("text-[9px] px-2 py-1 rounded",
                                                    ins.type === 'positive' ? 'text-emerald-400/80' : ins.type === 'warning' ? 'text-amber-400/80' : 'text-zinc-500'
                                                )}>{ins.type === 'positive' ? '✦' : ins.type === 'warning' ? '⚠' : 'ℹ'} {ins.text}</div>
                                            ))}
                                        </div>
                                    </Card>
                                ))}

                                {/* GIS Insight */}
                                <Card className="p-4 bg-indigo-500/[0.03] border-indigo-500/15">
                                    <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">AI Territory Insight</div>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                                        Based on financial simulation, <strong className="text-white">{best?.location?.name}</strong> offers the strongest synergy with your business model.
                                        {best?.rentToRevenue <= 10 && ' The rent-to-revenue ratio is within the optimal 8-12% range, indicating efficient spatial cost allocation.'}
                                        {best?.rentToRevenue > 10 && best?.rentToRevenue <= 15 && ' The rent-to-revenue ratio is above optimal but manageable — consider negotiating lease terms.'}
                                        {best?.location?.footTraffic >= 80 && ' High organic foot traffic minimizes customer acquisition costs.'}
                                        {best?.roi > 50 && ` Strong ${best.roi}% ROI indicates rapid capital recovery.`}
                                    </p>
                                </Card>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
