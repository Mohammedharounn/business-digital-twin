import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AutonomousOptimizer } from '../engine/AdvancedEngines'
import { formatCurrency } from '../engine/SimulationEngine'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, ScatterChart, Scatter,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, Legend, ReferenceLine, ComposedChart, Area
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'

const STRATEGY_COLORS = {
    pricing: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', fill: '#f59e0b' },
    staffing: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', fill: '#06b6d4' },
    rent: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', fill: '#8b5cf6' },
    growth: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', fill: '#10b981' },
    combined: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', fill: '#6366f1' }
};

function MetricBadge({ label, value, sub, color = 'indigo', trend }) {
    const colors = {
        indigo: 'from-indigo-500/15 to-indigo-600/5 border-indigo-500/15',
        emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/15',
        amber: 'from-amber-500/15 to-amber-600/5 border-amber-500/15',
        red: 'from-red-500/15 to-red-600/5 border-red-500/15',
        cyan: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/15',
        purple: 'from-purple-500/15 to-purple-600/5 border-purple-500/15'
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
            <div className="text-lg font-bold font-mono text-white">{value}</div>
            {sub && <div className="text-[10px] text-zinc-500 mt-0.5">{sub}</div>}
            {trend !== undefined && (
                <div className={`text-[10px] font-bold mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                </div>
            )}
        </div>
    );
}

export default function OptimizationPage({ businessConfig, financialData }) {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showDetail, setShowDetail] = useState(null);
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('strategies');
    const [compareList, setCompareList] = useState([]);
    const [constraints, setConstraints] = useState({
        maxRisk: 'all', // 'low', 'moderate', 'all'
        minROI: 0,
        maxInvestment: Infinity
    });

    const runOptimization = () => {
        setRunning(true);
        setProgress(0);
        setResults(null);
        setShowDetail(null);
        setCompareList([]);
        const steps = [5, 12, 22, 35, 48, 58, 67, 76, 84, 91, 96, 100];
        steps.forEach((p, i) => { setTimeout(() => setProgress(p), (i + 1) * 180); });
        setTimeout(() => {
            const strategies = AutonomousOptimizer.generateOptimizations(businessConfig, financialData);
            const evaluated = AutonomousOptimizer.evaluateStrategies(strategies);
            setResults(evaluated);
            setRunning(false);
        }, 2400);
    };

    const filtered = useMemo(() => {
        if (!results) return [];
        let list = filter === 'all' ? results : results.filter(r => r.type === filter);
        if (constraints.maxRisk !== 'all') {
            const allowed = constraints.maxRisk === 'low' ? ['low'] : ['low', 'moderate'];
            list = list.filter(s => allowed.includes(s.results.riskLevel.toLowerCase()));
        }
        if (constraints.minROI > 0) {
            list = list.filter(s => s.results.roi >= constraints.minROI);
        }
        return list;
    }, [results, filter, constraints]);

    const top5 = results?.slice(0, 5) || [];
    const baseProfit = financialData?.monthlyProfit || 0;
    const baseRevenue = financialData?.monthlyRevenue || 0;

    // Pareto frontier (risk vs reward)
    const paretoData = useMemo(() => {
        if (!results) return [];
        return results.map(s => ({
            x: s.results.riskScore,
            y: s.results.monthlyProfit,
            name: s.name,
            type: s.type,
            score: s.score,
            fill: STRATEGY_COLORS[s.type]?.fill || '#6366f1'
        }));
    }, [results]);

    // Radar chart data for selected strategy
    const radarData = useMemo(() => {
        if (!showDetail || !results) return [];
        const s = results.find(r => r.name === showDetail);
        if (!s) return [];
        return [
            { metric: 'Profit Margin', value: Math.min(100, Math.max(0, parseFloat(s.results.profitMargin) * 2)), fullMark: 100 },
            { metric: 'ROI', value: Math.min(100, Math.max(0, s.results.roi)), fullMark: 100 },
            { metric: 'Risk Safety', value: Math.min(100, 100 - s.results.riskScore), fullMark: 100 },
            { metric: 'Break-Even Speed', value: Math.min(100, s.results.breakEvenMonth ? Math.max(0, (24 - s.results.breakEvenMonth) / 24 * 100) : 0), fullMark: 100 },
            { metric: 'Revenue Growth', value: Math.min(100, Math.max(0, (s.results.monthlyRevenue / baseRevenue - 1) * 200 + 50)), fullMark: 100 },
            { metric: 'Composite Score', value: s.score, fullMark: 100 }
        ];
    }, [showDetail, results, baseRevenue]);

    // Category summary stats
    const categorySummary = useMemo(() => {
        if (!results) return {};
        const cats = {};
        results.forEach(s => {
            if (!cats[s.type]) cats[s.type] = { count: 0, bestScore: 0, bestName: '', avgProfit: 0, totalProfit: 0 };
            cats[s.type].count++;
            cats[s.type].totalProfit += s.results.monthlyProfit;
            if (s.score > cats[s.type].bestScore) {
                cats[s.type].bestScore = s.score;
                cats[s.type].bestName = s.name;
            }
        });
        Object.keys(cats).forEach(k => { cats[k].avgProfit = Math.round(cats[k].totalProfit / cats[k].count); });
        return cats;
    }, [results]);

    const toggleCompare = (name) => {
        setCompareList(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 3 ? [...prev, name] : prev
        );
    };

    const comparedStrategies = useMemo(() => {
        if (!results) return [];
        return compareList.map(n => results.find(r => r.name === n)).filter(Boolean);
    }, [compareList, results]);

    const tabs = [
        { id: 'strategies', label: '📋 All Strategies' },
        { id: 'pareto', label: '⚖️ Risk vs Reward' },
        { id: 'compare', label: `🔀 Compare (${compareList.length})` },
        { id: 'sensitivity', label: '📐 Sensitivity' }
    ];

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">⚡</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Neural Optimizer</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Autonomous Strategy Synthesizer — {results ? `${results.length} strategies evaluated` : 'Ready to scan'}
                    </p>
                </div>

                <Button className="min-w-[240px] h-14" onClick={runOptimization} disabled={running}>
                    {running ? (
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Synthesizing {progress}%</span>
                        </div>
                    ) : results ? '🔄 Re-Optimize' : 'Initiate Optimization Scan'}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {/* Loading State */}
                {running && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="mb-10">
                        <Card className="p-16 border-brand-primary/20 bg-brand-primary/[0.02] relative overflow-hidden text-center">
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent w-[50%] skew-x-[-20deg]" animate={{ left: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                            <div className="text-5xl mb-6">🛰️</div>
                            <h3 className="text-xl font-display font-bold text-white mb-4 tracking-tighter uppercase font-mono">Scanning {progress < 50 ? '10,000+' : '~30'} Permutations...</h3>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8 max-w-lg mx-auto leading-relaxed">
                                {progress < 30 && 'Mapping pricing elasticity vectors and demand curves...'}
                                {progress >= 30 && progress < 60 && 'Evaluating staffing models and operational capacity constraints...'}
                                {progress >= 60 && progress < 85 && 'Running financial simulations and risk assessments...'}
                                {progress >= 85 && 'Ranking strategies by composite Pareto score...'}
                            </p>
                            <div className="max-w-md mx-auto h-2 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden mb-4">
                                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                            <div className="flex justify-center gap-6 text-[9px] text-zinc-600 uppercase tracking-widest">
                                <span className={progress >= 10 ? 'text-indigo-400' : ''}>Pricing ✓</span>
                                <span className={progress >= 30 ? 'text-cyan-400' : ''}>Staffing {progress >= 30 ? '✓' : '...'}</span>
                                <span className={progress >= 50 ? 'text-purple-400' : ''}>Rent {progress >= 50 ? '✓' : '...'}</span>
                                <span className={progress >= 70 ? 'text-emerald-400' : ''}>Growth {progress >= 70 ? '✓' : '...'}</span>
                                <span className={progress >= 90 ? 'text-amber-400' : ''}>Combined {progress >= 90 ? '✓' : '...'}</span>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Empty State */}
                {!results && !running && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="p-20 text-center border-dashed border-white/10 bg-transparent group hover:border-brand-primary/20 transition-all duration-700">
                            <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500">⚡</div>
                            <h2 className="text-2xl font-display font-bold text-white mb-4 tracking-tighter uppercase">Processor Standby</h2>
                            <p className="text-sm text-zinc-500 mb-8 max-w-xl mx-auto leading-relaxed font-medium">
                                The autonomous optimizer evaluates <strong className="text-white">30+ strategies</strong> across 5 categories using real financial simulation, demand elasticity modeling, and composite risk-reward scoring.
                            </p>
                            <div className="flex gap-3 justify-center mb-10 flex-wrap">
                                {[
                                    { icon: '🏷️', label: 'Pricing Elasticity', desc: '10 price points' },
                                    { icon: '👥', label: 'Staffing Models', desc: '6 configurations' },
                                    { icon: '🏠', label: 'Rent Scenarios', desc: '5 lease options' },
                                    { icon: '📈', label: 'Growth Vectors', desc: '5 volume levels' },
                                    { icon: '⚡', label: 'Combined', desc: '4 hybrid strategies' }
                                ].map((t, i) => (
                                    <div key={i} className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-center group/item hover:border-indigo-500/20 transition-all">
                                        <div className="text-lg mb-1">{t.icon}</div>
                                        <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{t.label}</div>
                                        <div className="text-[8px] text-zinc-600 mt-0.5">{t.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <Button size="lg" onClick={runOptimization} className="px-12 h-16">Execute Full System Sweep</Button>
                        </Card>
                    </motion.div>
                )}

                {/* Results */}
                {results && !running && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* KPI Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <MetricBadge label="Best Strategy" value={top5[0]?.name.split(' ').slice(0, 2).join(' ')} sub={`Score: ${top5[0]?.score}/100`} color="indigo" />
                            <MetricBadge label="Max Monthly Profit" value={`$${Math.round(top5[0]?.results.monthlyProfit).toLocaleString()}`} sub={`vs base $${Math.round(baseProfit).toLocaleString()}`} color="emerald" trend={baseProfit > 0 ? Math.round((top5[0]?.results.monthlyProfit / baseProfit - 1) * 100) : 0} />
                            <MetricBadge label="Best ROI" value={`${top5[0]?.results.roi}%`} sub={`Break-even: ${top5[0]?.results.breakEvenMonth || '—'} months`} color="cyan" />
                            <MetricBadge label="Strategies Analyzed" value={results.length} sub={`${filtered.length} visible`} color="purple" />
                            <MetricBadge label="Lowest Risk Option" value={results.filter(s => s.results.riskLevel === 'Low').length > 0 ? results.filter(s => s.results.riskLevel === 'Low').sort((a, b) => b.results.monthlyProfit - a.results.monthlyProfit)[0]?.name.split(' ').slice(0, 2).join(' ') : 'None'} sub="Safest profitable" color="amber" />
                        </div>

                        {/* Top Strategy Highlight & Chart */}
                        <div className="grid grid-cols-12 gap-4">
                            <Card className="col-span-12 lg:col-span-8 p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Top 5 Strategies — Performance Matrix</h3>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={top5.map(s => ({
                                            name: s.name.length > 18 ? s.name.substring(0, 16) + '...' : s.name,
                                            Score: s.score,
                                            Profit: s.results.monthlyProfit,
                                            Risk: s.results.riskScore,
                                            ROI: s.results.roi,
                                            type: s.type
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="left" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#10b981', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                            <Bar yAxisId="left" dataKey="Score" radius={[6, 6, 0, 0]} barSize={32}>
                                                {top5.map((s, i) => <Cell key={i} fill={STRATEGY_COLORS[s.type]?.fill || '#6366f1'} fillOpacity={1 - (i * 0.12)} />)}
                                            </Bar>
                                            <Line yAxisId="right" type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981' }} name="Monthly Profit" />
                                            <Line yAxisId="left" type="monotone" dataKey="Risk" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Risk Score" />
                                            <Legend />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* #1 Strategy Detail */}
                            <Card className="col-span-12 lg:col-span-4 p-6 bg-indigo-500/[0.03] border-indigo-500/15">
                                <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">🏆 Top Recommendation</h3>
                                <div className="text-3xl mb-3">{top5[0]?.icon}</div>
                                <h4 className="text-lg font-display font-bold text-white mb-2 leading-tight">{top5[0]?.name}</h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed mb-6">{top5[0]?.description}</p>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Revenue</div>
                                        <div className="text-sm font-mono text-white">${Math.round(top5[0]?.results.monthlyRevenue).toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Margin</div>
                                        <div className="text-sm font-mono text-emerald-400">{top5[0]?.results.profitMargin}%</div>
                                    </div>
                                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">ROI</div>
                                        <div className="text-sm font-mono text-cyan-400">{top5[0]?.results.roi}%</div>
                                    </div>
                                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Risk</div>
                                        <div className={`text-sm font-mono ${top5[0]?.results.riskLevel === 'Low' ? 'text-emerald-400' : top5[0]?.results.riskLevel === 'Moderate' ? 'text-amber-400' : 'text-red-400'}`}>
                                            {top5[0]?.results.riskLevel}
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full" onClick={() => setShowDetail(top5[0]?.name)}>
                                    Inspect Full Analysis →
                                </Button>
                            </Card>
                        </div>

                        {/* Category Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {Object.entries(categorySummary).map(([cat, data]) => (
                                <button key={cat} onClick={() => setFilter(cat)} className={cn(
                                    "rounded-xl p-3 border transition-all text-left",
                                    filter === cat ? `${STRATEGY_COLORS[cat].bg} ${STRATEGY_COLORS[cat].border}` : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                )}>
                                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">{cat}</div>
                                    <div className={`text-sm font-bold ${filter === cat ? STRATEGY_COLORS[cat].text : 'text-white'}`}>{data.count} strategies</div>
                                    <div className="text-[10px] text-zinc-600">Best: {data.bestScore}/100</div>
                                </button>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn("flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                        activeTab === tab.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ─── STRATEGIES TAB ─── */}
                        {activeTab === 'strategies' && (
                            <div className="space-y-3">
                                {/* Constraint Controls */}
                                <div className="flex gap-3 items-center flex-wrap text-xs">
                                    <span className="text-zinc-500 text-[9px] uppercase tracking-widest">Constraints:</span>
                                    <select value={constraints.maxRisk} onChange={e => setConstraints(c => ({ ...c, maxRisk: e.target.value }))}
                                        className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/30">
                                        <option value="all">Any Risk</option>
                                        <option value="moderate">Low–Moderate Risk</option>
                                        <option value="low">Low Risk Only</option>
                                    </select>
                                    <select value={filter} onChange={e => setFilter(e.target.value)}
                                        className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/30">
                                        <option value="all">All Categories</option>
                                        <option value="pricing">🏷️ Pricing</option>
                                        <option value="staffing">👥 Staffing</option>
                                        <option value="rent">🏠 Rent</option>
                                        <option value="growth">📈 Growth</option>
                                        <option value="combined">⚡ Combined</option>
                                    </select>
                                    <span className="text-zinc-600">{filtered.length} of {results.length} strategies match</span>
                                </div>

                                {/* Strategy List */}
                                {filtered.map((s, i) => {
                                    const profitDelta = s.results.monthlyProfit - baseProfit;
                                    const isOpen = showDetail === s.name;
                                    const isCompared = compareList.includes(s.name);
                                    const colors = STRATEGY_COLORS[s.type] || STRATEGY_COLORS.combined;

                                    return (
                                        <Card key={i} className={cn("p-0 transition-all overflow-hidden", isOpen ? "border-indigo-500/30 bg-white/[0.03]" : "hover:border-white/10")}>
                                            <div className="p-5 md:px-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 cursor-pointer" onClick={() => setShowDetail(isOpen ? null : s.name)}>
                                                {/* Rank */}
                                                <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-500 flex-shrink-0">
                                                    #{i + 1}
                                                </div>
                                                {/* Icon */}
                                                <div className={`w-11 h-11 ${colors.bg} border ${colors.border} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                                                    {s.icon}
                                                </div>
                                                {/* Name & Type */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white tracking-tight mb-0.5">{s.name}</h4>
                                                    <p className="text-[10px] text-zinc-600">{s.description}</p>
                                                </div>
                                                {/* Metrics */}
                                                <div className="flex gap-6 text-center flex-shrink-0">
                                                    <div>
                                                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Score</div>
                                                        <div className="text-sm font-bold text-indigo-400 font-mono">{s.score}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Profit</div>
                                                        <div className={cn("text-sm font-bold font-mono", profitDelta >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                            {profitDelta >= 0 ? '+' : ''}{Math.round(profitDelta).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Margin</div>
                                                        <div className="text-sm font-bold text-white font-mono">{s.results.profitMargin}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Risk</div>
                                                        <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md",
                                                            s.results.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                s.results.riskLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                                                                    'bg-red-500/10 text-red-400'
                                                        )}>{s.results.riskLevel}</div>
                                                    </div>
                                                </div>
                                                {/* Compare checkbox */}
                                                <button onClick={(e) => { e.stopPropagation(); toggleCompare(s.name); }}
                                                    className={cn("w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] flex-shrink-0 transition-all",
                                                        isCompared ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.02] border-white/10 text-zinc-600 hover:border-white/20')}>
                                                    {isCompared ? '✓' : '⊕'}
                                                </button>
                                            </div>

                                            {/* Expanded Detail */}
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                                        <div className="px-8 pb-6 pt-2 border-t border-white/5">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* Before → After */}
                                                                <div>
                                                                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-3">Before → After</p>
                                                                    <div className="space-y-2">
                                                                        {[
                                                                            ['Revenue', `$${Math.round(baseRevenue).toLocaleString()}`, `$${Math.round(s.results.monthlyRevenue).toLocaleString()}`, s.results.monthlyRevenue > baseRevenue],
                                                                            ['Profit', `$${Math.round(baseProfit).toLocaleString()}`, `$${Math.round(s.results.monthlyProfit).toLocaleString()}`, s.results.monthlyProfit > baseProfit],
                                                                            ['Margin', `${financialData?.profitMargin || '—'}%`, `${s.results.profitMargin}%`, parseFloat(s.results.profitMargin) > parseFloat(financialData?.profitMargin || 0)],
                                                                            ['ROI', `—`, `${s.results.roi}%`, s.results.roi > 0],
                                                                            ['Break-Even', `—`, `${s.results.breakEvenMonth || 'N/A'} months`, true],
                                                                            ['Startup Cost', `—`, `$${Math.round(s.results.startupCost).toLocaleString()}`, false]
                                                                        ].map(([label, before, after, positive]) => (
                                                                            <div key={label} className="flex items-center justify-between text-xs">
                                                                                <span className="text-zinc-500 w-24">{label}</span>
                                                                                <span className="text-zinc-600 font-mono">{before}</span>
                                                                                <span className="text-indigo-400 text-[10px]">→</span>
                                                                                <span className={cn("font-mono font-bold", positive ? 'text-emerald-400' : 'text-zinc-300')}>{after}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Config Changes */}
                                                                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mt-5 mb-2">Parameter Changes</p>
                                                                    <div className="space-y-1">
                                                                        {s.config.avgTicket !== businessConfig.avgTicket && (
                                                                            <div className="text-[10px] text-zinc-400">🏷️ Ticket: ${businessConfig.avgTicket} → <span className="text-white font-mono">${s.config.avgTicket}</span></div>
                                                                        )}
                                                                        {s.config.dailyCustomers !== businessConfig.dailyCustomers && (
                                                                            <div className="text-[10px] text-zinc-400">👥 Customers: {businessConfig.dailyCustomers} → <span className="text-white font-mono">{s.config.dailyCustomers}/day</span></div>
                                                                        )}
                                                                        {s.config.employees !== businessConfig.employees && (
                                                                            <div className="text-[10px] text-zinc-400">🧑‍💼 Staff: {businessConfig.employees} → <span className="text-white font-mono">{s.config.employees}</span></div>
                                                                        )}
                                                                        {s.config.rent !== businessConfig.rent && (
                                                                            <div className="text-[10px] text-zinc-400">🏠 Rent: ${businessConfig.rent.toLocaleString()} → <span className="text-white font-mono">${s.config.rent.toLocaleString()}</span></div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Radar Chart */}
                                                                <div>
                                                                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-3">Strategy Profile</p>
                                                                    <ResponsiveContainer width="100%" height={220}>
                                                                        <RadarChart data={radarData}>
                                                                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                                                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 9 }} />
                                                                            <PolarRadiusAxis tick={false} domain={[0, 100]} />
                                                                            <Radar dataKey="value" stroke={colors.fill} fill={colors.fill} fillOpacity={0.15} strokeWidth={2} />
                                                                        </RadarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* ─── PARETO FRONTIER TAB ─── */}
                        {activeTab === 'pareto' && (
                            <Card className="p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Risk vs Reward — Pareto Frontier</h3>
                                <p className="text-[11px] text-zinc-600 mb-6">Strategies in the top-left corner offer the best risk-adjusted returns. Click a point for details.</p>
                                <ResponsiveContainer width="100%" height={400}>
                                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="x" name="Risk Score" tick={{ fill: '#71717a', fontSize: 10 }} label={{ value: 'Risk Score →', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10 }} />
                                        <YAxis dataKey="y" name="Monthly Profit" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} label={{ value: 'Monthly Profit →', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                                            formatter={(v, name) => [name === 'y' ? `$${Math.round(v).toLocaleString()}` : v, name === 'y' ? 'Profit' : 'Risk']}
                                            labelFormatter={(_, payload) => payload[0]?.payload?.name || ''}
                                        />
                                        <ReferenceLine y={baseProfit} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Current Profit', fill: '#6366f1', fontSize: 9 }} />
                                        {Object.entries(STRATEGY_COLORS).map(([type, c]) => (
                                            <Scatter key={type} data={paretoData.filter(p => p.type === type)} fill={c.fill} name={type} shape="circle" />
                                        ))}
                                        <Legend />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </Card>
                        )}

                        {/* ─── COMPARE TAB ─── */}
                        {activeTab === 'compare' && (
                            <div className="space-y-4">
                                {comparedStrategies.length === 0 ? (
                                    <Card className="p-12 text-center border-dashed border-white/10">
                                        <div className="text-4xl mb-4">🔀</div>
                                        <h3 className="text-lg font-bold text-white mb-2">Select strategies to compare</h3>
                                        <p className="text-xs text-zinc-500 mb-4">Click the ⊕ button on any strategy (up to 3) to add it here</p>
                                        <Button onClick={() => setActiveTab('strategies')}>Go to Strategies</Button>
                                    </Card>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {comparedStrategies.map(s => {
                                                const colors = STRATEGY_COLORS[s.type] || STRATEGY_COLORS.combined;
                                                return (
                                                    <Card key={s.name} className={`p-5 ${colors.bg} border ${colors.border}`}>
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <span className="text-2xl">{s.icon}</span>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-white">{s.name}</h4>
                                                                <p className="text-[10px] text-zinc-500">{s.type} strategy</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {[
                                                                ['Score', s.score, '/100'],
                                                                ['Profit', `$${Math.round(s.results.monthlyProfit).toLocaleString()}`, '/mo'],
                                                                ['Revenue', `$${Math.round(s.results.monthlyRevenue).toLocaleString()}`, '/mo'],
                                                                ['Margin', s.results.profitMargin, '%'],
                                                                ['ROI', s.results.roi, '%'],
                                                                ['Risk', s.results.riskLevel, ` (${s.results.riskScore})`],
                                                                ['Break-Even', s.results.breakEvenMonth || '—', ' mo']
                                                            ].map(([k, v, u]) => (
                                                                <div key={k} className="flex justify-between text-xs">
                                                                    <span className="text-zinc-500">{k}</span>
                                                                    <span className="text-white font-mono">{v}{u}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button onClick={() => toggleCompare(s.name)} className="w-full mt-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-zinc-400 text-[10px] hover:text-red-400 hover:border-red-500/20 transition-all">Remove</button>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {/* Comparison Bar Chart */}
                                        <Card className="p-6">
                                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Side-by-Side Comparison</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={[
                                                    { metric: 'Score', ...Object.fromEntries(comparedStrategies.map(s => [s.name.substring(0, 12), s.score])) },
                                                    { metric: 'ROI', ...Object.fromEntries(comparedStrategies.map(s => [s.name.substring(0, 12), s.results.roi])) },
                                                    { metric: 'Margin', ...Object.fromEntries(comparedStrategies.map(s => [s.name.substring(0, 12), parseFloat(s.results.profitMargin)])) },
                                                    { metric: 'Risk Safety', ...Object.fromEntries(comparedStrategies.map(s => [s.name.substring(0, 12), 100 - s.results.riskScore])) }
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10 }} />
                                                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                                    {comparedStrategies.map((s, i) => (
                                                        <Bar key={s.name} dataKey={s.name.substring(0, 12)} fill={COLORS_COMPARE[i]} radius={[4, 4, 0, 0]} />
                                                    ))}
                                                    <Legend />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Card>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ─── SENSITIVITY TAB ─── */}
                        {activeTab === 'sensitivity' && (
                            <div className="space-y-4">
                                <Card className="p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Price Sensitivity Analysis</h3>
                                    <p className="text-[11px] text-zinc-600 mb-6">How profit changes across different price points (incorporating demand elasticity)</p>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={results.filter(s => s.type === 'pricing').sort((a, b) => a.config.avgTicket - b.config.avgTicket).map(s => ({
                                            price: `$${s.config.avgTicket}`,
                                            profit: s.results.monthlyProfit,
                                            revenue: s.results.monthlyRevenue,
                                            margin: parseFloat(s.results.profitMargin),
                                            customers: s.config.dailyCustomers
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="price" tick={{ fill: '#71717a', fontSize: 10 }} label={{ value: 'Avg Ticket Price', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#f59e0b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => typeof v === 'number' && v > 100 ? `$${Math.round(v).toLocaleString()}` : v} />
                                            <Area type="monotone" dataKey="revenue" fill="rgba(99,102,241,0.08)" stroke="none" name="Revenue" />
                                            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5 }} name="Profit" />
                                            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} name="Revenue" />
                                            <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Margin %" />
                                            <ReferenceLine x={`$${businessConfig?.avgTicket}`} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: 'Current', fill: '#8b5cf6', fontSize: 9 }} />
                                            <Legend />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Staffing Impact Curve</h3>
                                    <p className="text-[11px] text-zinc-600 mb-6">Marginal returns of adding or removing staff</p>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={results.filter(s => s.type === 'staffing').sort((a, b) => a.config.employees - b.config.employees).map(s => ({
                                            staff: `${s.config.employees} staff`,
                                            profit: s.results.monthlyProfit,
                                            delta: s.results.monthlyProfit - baseProfit
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="staff" tick={{ fill: '#71717a', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => `$${Math.round(v).toLocaleString()}`} />
                                            <ReferenceLine y={baseProfit} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'Current', fill: '#6366f1', fontSize: 9 }} />
                                            <Bar dataKey="profit" radius={[6, 6, 0, 0]} name="Monthly Profit">
                                                {results.filter(s => s.type === 'staffing').sort((a, b) => a.config.employees - b.config.employees).map((s, i) => (
                                                    <Cell key={i} fill={s.results.monthlyProfit > baseProfit ? '#10b981' : '#ef4444'} fillOpacity={0.5} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const COLORS_COMPARE = ['#6366f1', '#10b981', '#f59e0b'];
