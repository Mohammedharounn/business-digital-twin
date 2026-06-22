import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScenarioEngine, FinancialEngine, RiskEngine, formatCurrency, formatNumber } from '../engine/SimulationEngine'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    ComposedChart, Line, Cell, Area, ReferenceLine
} from 'recharts'
import { Card } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'

const SCENARIO_COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#a855f7'];

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
                        {typeof entry.value === 'number' ? (Math.abs(entry.value) > 1000 ? formatCurrency(entry.value) : entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function ScenarioPage({ scenarios, setScenarios, businessConfig }) {
    const [showNewScenario, setShowNewScenario] = useState(false);
    const [selectedScenarios, setSelectedScenarios] = useState([0, 1]);
    const [activeView, setActiveView] = useState('table');
    const [expandedScenario, setExpandedScenario] = useState(null);
    const [newScenario, setNewScenario] = useState({
        name: '',
        avgTicket: businessConfig?.avgTicket || 20,
        dailyCustomers: businessConfig?.dailyCustomers || 80,
        employees: businessConfig?.employees || 6,
        rent: businessConfig?.rent || 4000,
        sqft: businessConfig?.sqft || 1500,
        equipmentCost: businessConfig?.equipmentCost || 50000
    });

    const toggleScenario = (index) => {
        setSelectedScenarios(prev => {
            if (prev.includes(index)) return prev.filter(i => i !== index);
            if (prev.length >= 3) return [...prev.slice(1), index];
            return [...prev, index];
        });
    };

    const addScenario = () => {
        if (!newScenario.name) return;
        const scenario = ScenarioEngine.createScenario(newScenario.name, {
            ...businessConfig,
            ...newScenario
        });
        const compared = ScenarioEngine.compareScenarios([scenario]);
        setScenarios(prev => [...prev, ...compared]);
        setShowNewScenario(false);
        setNewScenario({
            name: '',
            avgTicket: businessConfig?.avgTicket || 20,
            dailyCustomers: businessConfig?.dailyCustomers || 80,
            employees: businessConfig?.employees || 6,
            rent: businessConfig?.rent || 4000,
            sqft: businessConfig?.sqft || 1500,
            equipmentCost: businessConfig?.equipmentCost || 50000
        });
    };

    const deleteScenario = (index) => {
        setScenarios(prev => prev.filter((_, i) => i !== index));
        setSelectedScenarios(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    const selected = selectedScenarios.map(i => scenarios[i]).filter(Boolean);

    // Determine winner (highest profit)
    const winnerIdx = useMemo(() => {
        if (selected.length < 2) return -1;
        let best = 0;
        selected.forEach((s, i) => {
            if ((s.summary?.monthlyProfit || 0) > (selected[best]?.summary?.monthlyProfit || 0)) best = i;
        });
        return best;
    }, [selected]);

    // Radar data — all metrics computed from real simulation
    const radarData = useMemo(() => {
        return [
            { metric: 'Profitability' },
            { metric: 'ROI' },
            { metric: 'Risk Safety' },
            { metric: 'Revenue Scale' },
            { metric: 'Margin Width' },
            { metric: 'Break-Even Speed' }
        ].map(item => {
            const result = { ...item };
            selected.forEach((s, i) => {
                const margin = parseFloat(s.summary?.profitMargin || 0);
                const roi = s.summary?.roi?.roi || 0;
                const stability = 100 - (s.risk?.riskScore?.score || 50);
                const revenue = s.summary?.monthlyRevenue || 0;
                const maxRevenue = Math.max(...selected.map(x => x.summary?.monthlyRevenue || 1));
                const breakEven = s.summary?.breakEven?.month || 24;

                switch (item.metric) {
                    case 'Profitability': result[`s${i}`] = Math.min(100, Math.max(0, margin * 3)); break;
                    case 'ROI': result[`s${i}`] = Math.min(100, Math.max(0, roi + 20)); break;
                    case 'Risk Safety': result[`s${i}`] = Math.min(100, Math.max(0, stability)); break;
                    case 'Revenue Scale': result[`s${i}`] = Math.min(100, Math.max(0, (revenue / maxRevenue) * 100)); break;
                    case 'Margin Width': result[`s${i}`] = Math.min(100, Math.max(0, margin * 2.5)); break;
                    case 'Break-Even Speed': result[`s${i}`] = Math.min(100, Math.max(0, (24 - breakEven) / 24 * 100)); break;
                }
            });
            return result;
        });
    }, [selected]);

    // Bar chart comparison data
    const barCompareData = useMemo(() => {
        if (selected.length < 2) return [];
        return [
            { metric: 'Revenue', ...Object.fromEntries(selected.map((s, i) => [s.name.substring(0, 15), s.summary?.monthlyRevenue || 0])) },
            { metric: 'Profit', ...Object.fromEntries(selected.map((s, i) => [s.name.substring(0, 15), s.summary?.monthlyProfit || 0])) },
            { metric: 'Fixed Costs', ...Object.fromEntries(selected.map((s, i) => [s.name.substring(0, 15), s.summary?.fixedCosts?.total || 0])) },
            { metric: 'Startup', ...Object.fromEntries(selected.map((s, i) => [s.name.substring(0, 15), s.summary?.startup?.total || 0])) }
        ];
    }, [selected]);

    // Extended comparison rows
    const comparisonRows = [
        { label: 'Startup Capital', fn: s => formatCurrency(s.summary?.startup?.total || 0), cat: 'Investment' },
        { label: 'Monthly Revenue', fn: s => formatCurrency(s.summary?.monthlyRevenue || 0), cat: 'Revenue', highlight: true },
        { label: 'Annual Revenue', fn: s => formatCurrency(s.summary?.annualRevenue || 0), cat: 'Revenue' },
        { label: 'Monthly Profit', fn: s => formatCurrency(s.summary?.monthlyProfit || 0), cat: 'Profitability', highlight: true },
        { label: 'Annual Profit', fn: s => formatCurrency(s.summary?.annualProfit || 0), cat: 'Profitability' },
        { label: 'Profit Margin', fn: s => `${s.summary?.profitMargin || 0}%`, cat: 'Profitability' },
        { label: 'Fixed Costs/mo', fn: s => formatCurrency(s.summary?.fixedCosts?.total || 0), cat: 'Costs' },
        { label: 'Variable Costs/mo', fn: s => formatCurrency(s.summary?.variableCosts?.total || 0), cat: 'Costs' },
        { label: 'Break-Even Month', fn: s => s.summary?.breakEven?.month ? `Month ${s.summary.breakEven.month}` : 'N/A', cat: 'Recovery' },
        { label: 'ROI (12-Month)', fn: s => `${s.summary?.roi?.roi || 0}%`, cat: 'Recovery' },
        { label: 'Risk Level', fn: s => s.risk?.riskScore?.level || 'N/A', cat: 'Risk' },
        { label: 'Risk Score', fn: s => `${s.risk?.riskScore?.score || 0}/100`, cat: 'Risk' }
    ];

    const views = [
        { id: 'table', label: '📋 Comparison Table' },
        { id: 'charts', label: '📊 Visual Comparison' },
        { id: 'radar', label: '🕸️ Radar Profile' }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🔄</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Scenario Forge</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Multi-Variant Simulation — {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} · {selectedScenarios.length} selected
                    </p>
                </div>
                <Button className="px-8 py-3" onClick={() => setShowNewScenario(true)}>
                    + Forge New Scenario
                </Button>
            </div>

            {/* Scenario Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {scenarios.map((s, i) => {
                    const isSelected = selectedScenarios.includes(i);
                    const profit = s.summary?.monthlyProfit || 0;
                    const margin = s.summary?.profitMargin || 0;
                    const riskLevel = s.risk?.riskScore?.level || 'N/A';
                    return (
                        <div
                            key={s.id || i}
                            className={cn(
                                "rounded-2xl p-5 cursor-pointer border-2 transition-all duration-300 relative group",
                                isSelected ? 'border-indigo-500/40 bg-indigo-500/[0.04] shadow-[0_0_30px_rgba(99,102,241,0.08)]' : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                            )}
                            onClick={() => toggleScenario(i)}
                        >
                            {/* Selection indicator */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-5 h-5 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all",
                                        isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-zinc-700 text-transparent'
                                    )}>✓</div>
                                    <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">{s.name}</h3>
                                </div>
                                {scenarios.length > 2 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteScenario(i); }}
                                        className="text-zinc-700 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete scenario"
                                    >✕</button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Revenue</span>
                                    <span className="text-xs font-mono font-bold text-white">{formatCurrency(s.summary?.monthlyRevenue || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Profit</span>
                                    <span className={cn("text-xs font-mono font-bold", profit >= 0 ? 'text-emerald-400' : 'text-red-400')}>{formatCurrency(profit)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Margin</span>
                                    <span className="text-xs font-mono font-bold text-zinc-300">{margin}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Risk</span>
                                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md",
                                        riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                                            riskLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-red-500/10 text-red-400'
                                    )}>{riskLevel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">ROI</span>
                                    <span className="text-xs font-mono font-bold text-cyan-400">{s.summary?.roi?.roi || 0}%</span>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Comparison Content */}
            <div className="space-y-6">
                {selected.length >= 2 ? (
                    <>
                        {/* View Tabs */}
                        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5 w-fit">
                            {views.map(v => (
                                <button key={v.id} onClick={() => setActiveView(v.id)}
                                    className={cn("px-5 py-2.5 rounded-lg text-xs font-medium transition-all",
                                        activeView === v.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                                    {v.label}
                                </button>
                            ))}
                        </div>

                        {/* Winner Banner */}
                        {winnerIdx >= 0 && (
                            <Card className="p-4 bg-emerald-500/[0.03] border-emerald-500/15">
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">🏆</div>
                                    <div>
                                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Recommended Scenario</div>
                                        <div className="text-sm font-bold text-white">{selected[winnerIdx]?.name} — {formatCurrency(selected[winnerIdx]?.summary?.monthlyProfit || 0)}/mo profit · {selected[winnerIdx]?.summary?.profitMargin}% margin · {selected[winnerIdx]?.risk?.riskScore?.level} risk</div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* ─── TABLE VIEW ─── */}
                        {activeView === 'table' && (
                            <Card className="p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Full Divergence Analysis</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5 text-left">
                                                <th className="pb-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest w-40">Parameter</th>
                                                <th className="pb-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest w-20">Category</th>
                                                {selected.map((s, i) => (
                                                    <th key={i} className="pb-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ background: SCENARIO_COLORS[i] }} />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{s.name.length > 16 ? s.name.substring(0, 14) + '...' : s.name}</span>
                                                            {winnerIdx === i && <span className="text-[8px]">🏆</span>}
                                                        </div>
                                                    </th>
                                                ))}
                                                {selected.length === 2 && (
                                                    <th className="pb-3 text-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">Delta</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonRows.map((row, ri) => {
                                                // Calculate delta between first two scenarios
                                                const vals = selected.map(s => {
                                                    const txt = row.fn(s);
                                                    const num = parseFloat(txt.replace(/[$,%]/g, '').replace(/,/g, ''));
                                                    return isNaN(num) ? null : num;
                                                });
                                                const delta = selected.length === 2 && vals[0] !== null && vals[1] !== null ? vals[1] - vals[0] : null;

                                                return (
                                                    <tr key={ri} className={cn(
                                                        "border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors",
                                                        row.highlight && "bg-white/[0.01]"
                                                    )}>
                                                        <td className="py-3.5 text-[11px] font-bold text-zinc-400">{row.label}</td>
                                                        <td className="py-3.5 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{row.cat}</td>
                                                        {selected.map((s, i) => (
                                                            <td key={i} className="py-3.5 text-center text-[11px] font-mono font-bold text-zinc-200">{row.fn(s)}</td>
                                                        ))}
                                                        {selected.length === 2 && (
                                                            <td className="py-3.5 text-center text-[11px] font-mono font-bold">
                                                                {delta !== null ? (
                                                                    <span className={cn(delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-zinc-500')}>
                                                                        {delta > 0 ? '+' : ''}{row.label.includes('%') || row.label.includes('ROI') || row.label.includes('Margin') || row.label.includes('Score')
                                                                            ? delta.toFixed(1) + (row.label.includes('Month') ? '' : '')
                                                                            : formatCurrency(delta)}
                                                                    </span>
                                                                ) : <span className="text-zinc-600">—</span>}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {/* ─── CHARTS VIEW ─── */}
                        {activeView === 'charts' && (
                            <div className="grid grid-cols-12 gap-6">
                                <Card className="col-span-12 lg:col-span-7 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Revenue & Profit Comparison</h3>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={barCompareData} barGap={8}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip content={<PremiumTooltip />} />
                                            {selected.map((s, i) => (
                                                <Bar key={s.name} dataKey={s.name.substring(0, 15)} fill={SCENARIO_COLORS[i]} radius={[6, 6, 0, 0]} fillOpacity={0.7} />
                                            ))}
                                            <Legend wrapperStyle={{ fontSize: 10 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>

                                <Card className="col-span-12 lg:col-span-5 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Performance Metrics</h3>
                                    <div className="space-y-4">
                                        {selected.map((s, i) => {
                                            const margin = parseFloat(s.summary?.profitMargin || 0);
                                            const roi = s.summary?.roi?.roi || 0;
                                            const riskScore = s.risk?.riskScore?.score || 0;
                                            return (
                                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: SCENARIO_COLORS[i] }} />
                                                        <span className="text-xs font-bold text-white">{s.name}</span>
                                                        {winnerIdx === i && <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold">BEST</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                                                                <span>Profit Margin</span><span>{margin}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, margin * 2))}%` }}
                                                                    className="h-full rounded-full" style={{ background: SCENARIO_COLORS[i] }} transition={{ duration: 1 }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                                                                <span>ROI</span><span>{roi}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, roi + 20))}%` }}
                                                                    className="h-full rounded-full bg-emerald-500" transition={{ duration: 1, delay: 0.2 }} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                                                                <span>Risk</span><span>{riskScore}/100</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }}
                                                                    className="h-full rounded-full" style={{ background: riskScore < 40 ? '#10b981' : riskScore < 70 ? '#f59e0b' : '#ef4444' }}
                                                                    transition={{ duration: 1, delay: 0.4 }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>

                                {/* Forecast overlay */}
                                {selected.length >= 2 && selected[0]?.summary?.forecast && (
                                    <Card className="col-span-12 p-6">
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">24-Month Profit Trajectory Overlay</h3>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <ComposedChart data={
                                                (selected[0]?.summary?.forecast || []).map((f, mi) => {
                                                    const row = { month: f.monthLabel };
                                                    selected.forEach((s, si) => {
                                                        row[s.name.substring(0, 15)] = s.summary?.forecast?.[mi]?.netProfit || 0;
                                                    });
                                                    return row;
                                                })
                                            }>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 9 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                                <Tooltip content={<PremiumTooltip />} />
                                                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                                {selected.map((s, i) => (
                                                    <Line key={s.name} type="monotone" dataKey={s.name.substring(0, 15)} stroke={SCENARIO_COLORS[i]} strokeWidth={2.5} dot={false} name={s.name} />
                                                ))}
                                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* ─── RADAR VIEW ─── */}
                        {activeView === 'radar' && (
                            <div className="grid grid-cols-12 gap-6">
                                <Card className="col-span-12 lg:col-span-7 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Multi-Axis Convergence Radar</h3>
                                    <p className="text-[11px] text-zinc-600 mb-6">6-axis comparison: all metrics computed from live simulation results</p>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                                            <PolarRadiusAxis axisLine={false} tick={false} domain={[0, 100]} />
                                            {selected.map((s, i) => (
                                                <Radar key={i} name={s.name} dataKey={`s${i}`}
                                                    stroke={SCENARIO_COLORS[i]} fill={SCENARIO_COLORS[i]} fillOpacity={0.1} strokeWidth={2.5} />
                                            ))}
                                            <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 10 }} />
                                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Card>

                                <div className="col-span-12 lg:col-span-5 space-y-4">
                                    <Card className="p-6">
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Input Parameters (Side-by-Side)</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[11px]">
                                                <thead>
                                                    <tr className="border-b border-white/5">
                                                        <th className="pb-2 text-left text-[9px] text-zinc-600 uppercase tracking-widest">Input</th>
                                                        {selected.map((s, i) => (
                                                            <th key={i} className="pb-2 text-center text-[9px] uppercase tracking-widest" style={{ color: SCENARIO_COLORS[i] }}>{s.name.split(' ')[0]}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { label: 'Avg Ticket', fn: s => `E£${s.config?.avgTicket || '—'}` },
                                                        { label: 'Daily Customers', fn: s => s.config?.dailyCustomers || '—' },
                                                        { label: 'Employees', fn: s => s.config?.employees || '—' },
                                                        { label: 'Rent', fn: s => formatCurrency(s.config?.rent || 0) },
                                                        { label: 'Sq Ft', fn: s => `${s.config?.sqft || '—'} ft²` },
                                                        { label: 'Equipment', fn: s => formatCurrency(s.config?.equipmentCost || 0) }
                                                    ].map((row, ri) => (
                                                        <tr key={ri} className="border-b border-white/[0.03] last:border-0">
                                                            <td className="py-2.5 text-zinc-500">{row.label}</td>
                                                            {selected.map((s, i) => (
                                                                <td key={i} className="py-2.5 text-center font-mono text-white">{row.fn(s)}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>

                                    <Card className="p-6">
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Risk Summary</h3>
                                        <div className="space-y-3">
                                            {selected.map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ background: SCENARIO_COLORS[i] }} />
                                                        <span className="text-xs font-bold text-white">{s.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-mono text-zinc-400">{s.risk?.riskScore?.score || 0}/100</span>
                                                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md",
                                                            (s.risk?.riskScore?.level || '') === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                (s.risk?.riskScore?.level || '') === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                                                                    'bg-red-500/10 text-red-400'
                                                        )}>{s.risk?.riskScore?.level || '—'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Card className="p-16 text-center border-dashed border-white/10 bg-transparent">
                        <div className="text-5xl mb-6">🔭</div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Select 2+ Scenarios</h3>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">Click on scenario cards above to select them for comparison. You can compare up to 3 scenarios simultaneously across 12 financial metrics.</p>
                    </Card>
                )}
            </div>

            {/* ─── New Scenario Modal ─── */}
            <AnimatePresence>
                {showNewScenario && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
                        onClick={(e) => e.target === e.currentTarget && setShowNewScenario(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-[640px] bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="mb-8 text-center">
                                <h3 className="text-xl font-display font-bold text-white tracking-tight mb-1">Forge New Scenario</h3>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Configure all simulation parameters</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Scenario Name</label>
                                    <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                                        placeholder="e.g. Premium Expansion" value={newScenario.name} onChange={e => setNewScenario(p => ({ ...p, name: e.target.value }))} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'avgTicket', label: 'Avg Ticket Price ($)', type: 'number', parse: parseFloat },
                                        { key: 'dailyCustomers', label: 'Daily Customers', type: 'number', parse: parseInt },
                                        { key: 'employees', label: 'Employees', type: 'number', parse: parseInt },
                                        { key: 'rent', label: 'Monthly Rent ($)', type: 'number', parse: parseInt },
                                        { key: 'sqft', label: 'Space (sq ft)', type: 'number', parse: parseInt },
                                        { key: 'equipmentCost', label: 'Equipment Cost ($)', type: 'number', parse: parseInt }
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">{field.label}</label>
                                            <input type={field.type}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-indigo-500 transition-all"
                                                value={newScenario[field.key]}
                                                onChange={e => setNewScenario(p => ({ ...p, [field.key]: field.parse(e.target.value) || 0 }))} />
                                        </div>
                                    ))}
                                </div>

                                {/* Quick presets */}
                                <div>
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Quick Presets</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[
                                            { label: '🚀 Aggressive Growth', mods: { dailyCustomers: Math.round((businessConfig?.dailyCustomers || 80) * 1.5), employees: (businessConfig?.employees || 6) + 3, avgTicket: (businessConfig?.avgTicket || 20) * 1.1 } },
                                            { label: '💎 Premium', mods: { avgTicket: Math.round((businessConfig?.avgTicket || 20) * 1.4), dailyCustomers: Math.round((businessConfig?.dailyCustomers || 80) * 0.8) } },
                                            { label: '✂️ Lean', mods: { employees: Math.max(2, (businessConfig?.employees || 6) - 2), rent: Math.round((businessConfig?.rent || 4000) * 0.85) } },
                                            { label: '📍 Relocation', mods: { rent: Math.round((businessConfig?.rent || 4000) * 1.3), sqft: Math.round((businessConfig?.sqft || 1500) * 1.4), dailyCustomers: Math.round((businessConfig?.dailyCustomers || 80) * 1.2) } }
                                        ].map((preset, i) => (
                                            <button key={i} onClick={() => setNewScenario(p => ({ ...p, name: p.name || preset.label.split(' ').slice(1).join(' '), ...preset.mods }))}
                                                className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-indigo-500/30 transition-all">
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                                    onClick={() => setShowNewScenario(false)}>Cancel</button>
                                <Button className="flex-[2] py-3" onClick={addScenario} disabled={!newScenario.name}>
                                    Commit to Forge
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
