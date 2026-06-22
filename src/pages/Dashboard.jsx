import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BUSINESS_TYPES, formatCurrency, formatNumber } from '../engine/SimulationEngine'
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart,
    Legend, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts'
import {
    Activity, TrendingUp, ShieldAlert, Zap, Target,
    Layers, Search, Download, Share2, Info, ArrowUpRight,
    ArrowDownRight, DollarSign, Users, Briefcase
} from 'lucide-react'
import { Card } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'

const CHART_COLORS = {
    primary: '#6366f1',
    secondary: '#a855f7',
    cyan: '#22d3ee',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    zinc: '#3f3f46'
};

const PIE_COLORS = ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

const PremiumTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-panel p-4 shadow-premium border-white/10 !bg-black/90 backdrop-blur-xl">
            <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">
                {label}
            </div>
            <div className="space-y-3">
                {payload.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }}></div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{entry.name}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-white">
                            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Dashboard({ financialData, riskData, insights, businessConfig }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!financialData) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 overflow-hidden">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-0 rounded-3xl bg-brand-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Activity className="w-10 h-10 text-zinc-700 animate-pulse" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Simulation Synchronizing...</h3>
                <p className="text-sm text-zinc-600 max-w-xs uppercase tracking-widest font-black text-[9px]">Initializing neural pathways for data visualization</p>
            </div>
        );
    }

    const { startup, fixedCosts, variableCosts, monthlyRevenue, monthlyProfit, profitMargin, breakEven, roi, forecast, annualRevenue, annualProfit } = financialData;
    const businessType = BUSINESS_TYPES.find(b => b.id === businessConfig?.businessType);

    // ── Computed analytics ──
    const cashFlowData = forecast.map(f => ({
        month: f.monthLabel,
        Revenue: f.revenue,
        Costs: f.totalCosts,
        Profit: f.netProfit,
        Cumulative: f.cumulativeCashFlow
    }));

    // Compute real growth trends from forecast (comparing month 12 vs month 6)
    const computedTrends = useMemo(() => {
        if (!forecast || forecast.length < 12) return { revGrowth: 0, profitGrowth: 0, marginDelta: 0 };
        const m6 = forecast[5];
        const m12 = forecast[11];
        const revGrowth = m6.revenue > 0 ? parseFloat(((m12.revenue - m6.revenue) / m6.revenue * 100).toFixed(1)) : 0;
        // Handle negative-to-positive profit transition (early months may be losses)
        const profitGrowth = (m6.netProfit !== 0 && m6.netProfit > 0)
            ? parseFloat(((m12.netProfit - m6.netProfit) / m6.netProfit * 100).toFixed(1))
            : m12.netProfit > 0 ? 100 : 0;
        const marginM6 = m6.revenue > 0 ? (m6.netProfit / m6.revenue * 100) : 0;
        const marginM12 = m12.revenue > 0 ? (m12.netProfit / m12.revenue * 100) : 0;
        return { revGrowth, profitGrowth, marginDelta: parseFloat((marginM12 - marginM6).toFixed(1)) };
    }, [forecast]);

    // Monthly P&L breakdown — use absolute values for cost bars
    const plBreakdown = useMemo(() => {
        const fixedTotal = fixedCosts?.total || 0;
        const varTotal = variableCosts?.total || 0;
        return [
            { name: 'Revenue', value: monthlyRevenue, color: '#6366f1', isPositive: true },
            { name: 'Fixed Costs', value: fixedTotal, color: '#ef4444', isPositive: false },
            { name: 'Variable Costs', value: varTotal, color: '#f59e0b', isPositive: false },
            { name: 'Net Profit', value: Math.abs(monthlyProfit), color: monthlyProfit >= 0 ? '#10b981' : '#ef4444', isPositive: monthlyProfit >= 0 }
        ];
    }, [monthlyRevenue, monthlyProfit, fixedCosts, variableCosts]);

    // Operational efficiency metrics
    const opMetrics = useMemo(() => {
        const employees = businessConfig?.employees || 1;
        const dailyCust = businessConfig?.dailyCustomers || 1;
        const avgTicket = businessConfig?.avgTicket || 0;
        const rent = businessConfig?.rent || 0;
        // Key fix: 'Payroll' is the actual key used in SimulationEngine (not 'Staff Salaries')
        const payrollCost = fixedCosts?.items?.['Payroll'] ?? null;
        return {
            revenuePerEmployee: Math.round(monthlyRevenue / employees),
            profitPerEmployee: Math.round(monthlyProfit / employees),
            laborCostRatio: (payrollCost !== null && monthlyRevenue > 0) ? ((payrollCost / monthlyRevenue) * 100).toFixed(1) : '—',
            rentToRevenue: (rent > 0 && monthlyRevenue > 0) ? ((rent / monthlyRevenue) * 100).toFixed(1) : '—',
            avgDailyRevenue: Math.round(monthlyRevenue / 30),
            revenuePerCustomer: avgTicket,
            customersPerEmployee: Math.round(dailyCust / employees),
            grossMargin: (variableCosts && monthlyRevenue > 0) ? ((1 - variableCosts.total / monthlyRevenue) * 100).toFixed(1) : profitMargin,
            operatingLeverage: (fixedCosts && (fixedCosts.total + (variableCosts?.total || 0)) > 0)
                ? (fixedCosts.total / (fixedCosts.total + (variableCosts?.total || 0)) * 100).toFixed(0)
                : '—'
        };
    }, [monthlyRevenue, monthlyProfit, businessConfig, fixedCosts, variableCosts, profitMargin]);

    // Cumulative cash flow with break-even marker
    const cumulativeData = useMemo(() => {
        return cashFlowData.map((d, i) => ({
            ...d,
            breakEvenLine: 0
        }));
    }, [cashFlowData]);

    // Risk radar data
    const riskRadar = useMemo(() => {
        if (!riskData?.risks) return [];
        const categories = {};
        riskData.risks.forEach(r => {
            const cat = r.category || 'General';
            if (!categories[cat]) categories[cat] = { count: 0, highCount: 0 };
            categories[cat].count++;
            if (r.severity === 'high') categories[cat].highCount++;
        });
        return Object.entries(categories).map(([cat, data]) => ({
            category: cat,
            riskLevel: Math.min(100, data.count * 25 + data.highCount * 20),
            coverage: Math.max(20, 100 - data.highCount * 30)
        }));
    }, [riskData]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
        { id: 'cashflow', label: 'Cash Flow', icon: <DollarSign className="w-3.5 h-3.5" /> },
        { id: 'risks', label: 'Neural Risks', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
        { id: 'metrics', label: 'Unit Economics', icon: <Target className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="max-w-[1700px] mx-auto animate-fade-in p-6 lg:p-8">
            {/* 1. Header & Global Nav */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl shadow-premium">
                            {businessType?.icon || '🏢'}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                                    {businessConfig?.businessName || 'Unnamed Simulation'}
                                </h1>
                                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 rounded-full uppercase tracking-widest animate-pulse">
                                    Live_Active
                                </span>
                            </div>
                            <div className="flex items-center gap-6 mt-1">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-3 h-3" />
                                    Node: {businessConfig?.location || 'Digital Realm'}
                                </span>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    {businessConfig?.employees || 0} Staff · {businessConfig?.dailyCustomers || 0}/day
                                </span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    Model V2.42
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex bg-black/40 p-1 border border-white/5 rounded-2xl backdrop-blur-md">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === tab.id
                                    ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Key Performance Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                    {
                        label: 'Monthly Revenue',
                        val: formatCurrency(monthlyRevenue),
                        sub: `Annual: ${formatCurrency(annualRevenue)}`,
                        trend: computedTrends.revGrowth > 0 ? `+${computedTrends.revGrowth}%` : computedTrends.revGrowth < 0 ? `${computedTrends.revGrowth}%` : '—',
                        trendLabel: 'Mo6→Mo12',
                        icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
                        color: 'indigo'
                    },
                    {
                        label: 'Net Profit',
                        val: formatCurrency(monthlyProfit),
                        sub: `${profitMargin}% margin`,
                        trend: computedTrends.profitGrowth > 0 ? `+${computedTrends.profitGrowth}%` : computedTrends.profitGrowth < 0 ? `${computedTrends.profitGrowth}%` : '—',
                        trendLabel: 'Mo6→Mo12',
                        icon: <Zap className="w-4 h-4 text-emerald-400" />,
                        color: 'emerald'
                    },
                    {
                        label: 'Startup Capital',
                        val: formatCurrency(startup.total),
                        sub: `ROI: ${roi?.roi || 0}%`,
                        trend: roi?.roi > 0 ? `+${roi.roi}%` : '—',
                        trendLabel: '12-mo ROI',
                        icon: <Briefcase className="w-4 h-4 text-cyan-400" />,
                        color: 'cyan'
                    },
                    {
                        label: 'Break-Even',
                        val: breakEven.month ? `Month ${breakEven.month}` : 'N/A',
                        sub: `${breakEven.dailyUnitsNeeded} units/day needed`,
                        trend: breakEven.month ? `${breakEven.month} months` : '—',
                        trendLabel: 'recovery',
                        icon: <Target className="w-4 h-4 text-amber-400" />,
                        color: 'amber'
                    },
                    {
                        label: 'Risk Score',
                        val: `${riskData?.riskScore?.score || 0}/100`,
                        sub: riskData?.riskScore?.level || 'Analyzing',
                        trend: riskData?.riskScore?.score < 40 ? 'Low' : riskData?.riskScore?.score < 70 ? 'Moderate' : 'High',
                        trendLabel: 'risk level',
                        icon: <ShieldAlert className="w-4 h-4 text-purple-400" />,
                        color: 'purple'
                    }
                ].map((kpi, i) => {
                    const colorMap = {
                        indigo: { bg: 'group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20', text: 'group-hover:text-indigo-400' },
                        emerald: { bg: 'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20', text: 'group-hover:text-emerald-400' },
                        cyan: { bg: 'group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20', text: 'group-hover:text-cyan-400' },
                        amber: { bg: 'group-hover:bg-amber-500/10 group-hover:border-amber-500/20', text: 'group-hover:text-amber-400' },
                        purple: { bg: 'group-hover:bg-purple-500/10 group-hover:border-purple-500/20', text: 'group-hover:text-purple-400' }
                    };
                    return (
                        <Card key={i} className="p-5 border-white/5 group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-2.5 bg-white/[0.03] border border-white/5 rounded-xl transition-all", colorMap[kpi.color].bg)}>
                                    {kpi.icon}
                                </div>
                                <div className="text-right">
                                    <div className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1",
                                        kpi.trend.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" :
                                            kpi.trend === 'Low' ? "text-emerald-500 bg-emerald-500/10" :
                                                kpi.trend === 'Moderate' ? "text-amber-500 bg-amber-500/10" :
                                                    kpi.trend === 'High' ? "text-red-500 bg-red-500/10" :
                                                        "text-zinc-600 bg-white/5"
                                    )}>
                                        {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-2 h-2" /> : null}
                                        {kpi.trend}
                                    </div>
                                    <div className="text-[8px] text-zinc-700 mt-0.5">{kpi.trendLabel}</div>
                                </div>
                            </div>
                            <div className="stat-label mb-1">{kpi.label}</div>
                            <div className={cn("text-2xl font-display font-bold text-white mb-1 tracking-tight transition-colors", colorMap[kpi.color].text)}>{kpi.val}</div>
                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{kpi.sub}</div>
                        </Card>
                    );
                })}
            </div>

            {/* 3. Main Data Core */}
            <AnimatePresence mode="wait">
                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-12 gap-6">
                        {/* Growth Trajectory */}
                        <Card className="col-span-12 lg:col-span-8 p-8 bg-black/40 border-white/5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-base font-display font-bold text-white mb-1 uppercase tracking-tight">24-Month Growth Trajectory</h3>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Revenue, costs, and net profit forecast</p>
                                </div>
                                <div className="flex gap-3 p-1 bg-black/40 border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Revenue</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Costs</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Profit</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[380px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cashFlowData}>
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 9, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 700 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<PremiumTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.15)', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="Revenue" fill="url(#areaGrad)" stroke={CHART_COLORS.primary} strokeWidth={3} animationDuration={2000} />
                                        <Line type="monotone" dataKey="Costs" stroke="#27272a" strokeWidth={2} dot={false} strokeDasharray="8 4" />
                                        <Bar dataKey="Profit" fill="url(#profitGrad)" stroke={CHART_COLORS.emerald} strokeWidth={1} opacity={0.6} radius={[4, 4, 0, 0]} barSize={18} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Right Panel: Health + Insights */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Health Pulse */}
                            <Card className="p-8 text-center relative overflow-hidden border-white/5 flex flex-col items-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-30" />
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8">Neural Health Index</h4>
                                <div className="w-44 h-44 rounded-full border border-white/5 flex items-center justify-center relative mb-6">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                                        <circle cx="88" cy="88" r="72" className="stroke-white/[0.02] fill-none" strokeWidth="7" />
                                        {/* Health = 100 - riskScore. Green for low risk, red for high risk */}
                                        <motion.circle
                                            cx="88" cy="88" r="72"
                                            stroke={riskData?.riskScore?.score >= 70 ? '#ef4444' : riskData?.riskScore?.score >= 40 ? '#f59e0b' : '#10b981'}
                                            className="fill-none"
                                            strokeWidth="7"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 1000" }}
                                            animate={{ strokeDasharray: `${((100 - (riskData?.riskScore?.score || 0)) / 100) * 452} 1000` }}
                                            transition={{ duration: 2.5, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="text-center z-10">
                                        <div className="text-5xl font-display font-black text-white">{100 - (riskData?.riskScore?.score || 12)}</div>
                                        <div className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.15em] mt-1">{riskData?.riskScore?.level || 'Optimum'}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-white/5">
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Risks</div>
                                        <div className="text-sm font-bold text-white font-mono">{riskData?.risks?.length || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">High</div>
                                        <div className="text-sm font-bold text-red-400 font-mono">{riskData?.risks?.filter(r => r.severity === 'high').length || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Margin</div>
                                        <div className="text-sm font-bold text-emerald-400 font-mono">{profitMargin}%</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Tactical Directives */}
                            <Card className="p-6 border-dashed border-white/10 bg-transparent">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                                    <Zap className="w-3.5 h-3.5 text-brand-cyan" />
                                    AI Tactical Directives
                                </h4>
                                <div className="space-y-3">
                                    {insights?.slice(0, 4).map((insight, i) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 group-hover:bg-brand-primary/5 group-hover:border-brand-primary/20 transition-all">
                                                <div className="text-lg grayscale group-hover:grayscale-0 transition-all flex-shrink-0">{insight.icon}</div>
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-bold text-white mb-0.5 group-hover:text-brand-primary transition-colors">{insight.title}</div>
                                                    <div className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{insight.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Row: P&L + Operational */}
                        <Card className="col-span-12 lg:col-span-6 p-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Monthly P&L Waterfall</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={plBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip content={<PremiumTooltip />} />
                                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                                            {plBreakdown.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.6} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="col-span-12 lg:col-span-6 p-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Operational Efficiency</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Rev/Employee', value: formatCurrency(opMetrics.revenuePerEmployee), sub: '/month' },
                                    { label: 'Profit/Employee', value: formatCurrency(opMetrics.profitPerEmployee), sub: '/month' },
                                    { label: 'Labor Cost Ratio', value: `${opMetrics.laborCostRatio}%`, sub: 'of revenue' },
                                    { label: 'Rent-to-Revenue', value: `${opMetrics.rentToRevenue}%`, sub: 'of revenue' },
                                    { label: 'Gross Margin', value: `${opMetrics.grossMargin}%`, sub: 'after COGS' },
                                    { label: 'Operating Leverage', value: `${opMetrics.operatingLeverage}%`, sub: 'fixed ratio' },
                                    { label: 'Daily Revenue', value: formatCurrency(opMetrics.avgDailyRevenue), sub: '/day avg' },
                                    { label: 'Cust/Employee', value: opMetrics.customersPerEmployee, sub: '/day' },
                                    { label: 'Avg Ticket', value: formatCurrency(opMetrics.revenuePerCustomer), sub: '/customer' }
                                ].map((m, i) => (
                                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-indigo-500/20 transition-all">
                                        <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{m.label}</div>
                                        <div className="text-sm font-bold text-white font-mono mt-1">{m.value}</div>
                                        <div className="text-[8px] text-zinc-700">{m.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* ─── CASH FLOW TAB ─── */}
                {activeTab === 'cashflow' && (
                    <motion.div key="cashflow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-12 gap-6">
                            <Card className="col-span-12 lg:col-span-8 p-8">
                                <h3 className="text-base font-display font-bold text-white mb-1 uppercase tracking-tight">Cumulative Cash Flow</h3>
                                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-8">Tracks total cash position from startup investment through profitability</p>
                                <div className="h-[380px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={cumulativeData}>
                                            <defs>
                                                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.05} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 9 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip content={<PremiumTooltip />} />
                                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={2} label={{ value: 'Break-Even Line', fill: '#71717a', fontSize: 9, position: 'right' }} />
                                            <Area type="monotone" dataKey="Cumulative" fill="url(#cumGrad)" stroke="#6366f1" strokeWidth={3} dot={false} name="Cumulative Cash Flow" />
                                            <Bar dataKey="Profit" fill={CHART_COLORS.cyan} opacity={0.2} radius={[3, 3, 0, 0]} barSize={14} name="Monthly Profit" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Cash flow side panel */}
                            <div className="col-span-12 lg:col-span-4 space-y-4">
                                <Card className="p-6 bg-indigo-500/[0.03] border-indigo-500/15">
                                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Investment Recovery</h4>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Initial Investment</div>
                                            <div className="text-2xl font-display font-black text-white">{formatCurrency(startup.total)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Break-Even Month</div>
                                            <div className="text-2xl font-display font-black text-emerald-400">{breakEven.month ? `Month ${breakEven.month}` : 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">12-Month ROI</div>
                                            <div className="text-2xl font-display font-black text-cyan-400">{roi?.roi || 0}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">24-Month Cash Position</div>
                                            <div className={cn("text-2xl font-display font-black", cashFlowData[cashFlowData.length - 1]?.Cumulative >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                                                {formatCurrency(cashFlowData[cashFlowData.length - 1]?.Cumulative || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Startup Breakdown</h4>
                                    <div className="space-y-2">
                                        {startup?.items && Object.entries(startup.items).sort((a, b) => b[1] - a[1]).map(([label, val], i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[10px] text-zinc-500">{label}</span>
                                                <span className="text-xs font-mono font-bold text-white">{formatCurrency(val)}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                                            <span className="text-[10px] text-zinc-400 font-bold">Total</span>
                                            <span className="text-xs font-mono font-bold text-indigo-400">{formatCurrency(startup.total)}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── RISKS TAB ─── */}
                {activeTab === 'risks' && (
                    <motion.div key="risks" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        {/* Risk Radar + Summary */}
                        <div className="grid grid-cols-12 gap-6">
                            {riskRadar.length > 0 && (
                                <Card className="col-span-12 lg:col-span-5 p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Risk Profile Radar</h3>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <RadarChart data={riskRadar}>
                                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                            <PolarAngleAxis dataKey="category" tick={{ fill: '#71717a', fontSize: 9 }} />
                                            <PolarRadiusAxis tick={false} domain={[0, 100]} />
                                            <Radar dataKey="riskLevel" name="Risk Level" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                                            <Radar dataKey="coverage" name="Mitigation" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}

                            <div className={cn("col-span-12", riskRadar.length > 0 ? "lg:col-span-7" : "")}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {riskData?.risks?.map((risk, i) => (
                                        <Card key={i} className="p-6 border-white/5 group hover:border-rose-500/20 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "p-2.5 rounded-xl border",
                                                    risk.severity === 'high' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                )}>
                                                    <ShieldAlert className="w-4 h-4" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                                        risk.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                                    )}>{risk.severity}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded text-zinc-500">{risk.category}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">{risk.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">{risk.description}</p>
                                            <div className="p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">✦ Mitigation</div>
                                                <p className="text-[10px] text-zinc-400 leading-relaxed">{risk.suggestion}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── UNIT ECONOMICS TAB ─── */}
                {activeTab === 'metrics' && (
                    <motion.div key="metrics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-12 gap-6">
                        {/* Fixed Costs Pie */}
                        <Card className="col-span-12 lg:col-span-7 p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Fixed Overheads Allocation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(fixedCosts.items).map(([k, v]) => ({ name: k, value: v }))}
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {Object.keys(fixedCosts.items).map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.7} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PremiumTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(fixedCosts.items).sort((a, b) => b[1] - a[1]).map(([label, val], i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                <span className="text-[10px] font-bold text-zinc-400">{label}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold text-white">{formatCurrency(val)}</span>
                                                <span className="text-[9px] text-zinc-600 ml-2">{(val / fixedCosts.total * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-2 flex justify-between font-bold">
                                        <span className="text-[10px] text-zinc-300">Total Fixed Costs</span>
                                        <span className="text-sm font-mono text-indigo-400">{formatCurrency(fixedCosts.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Break-Even Vector */}
                        <Card className="col-span-12 lg:col-span-5 p-8 bg-brand-primary/[0.02] border-brand-primary/20 relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Target className="w-16 h-16 text-brand-primary" />
                            </div>
                            <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-8">Break-Even Analysis</h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Daily Sales Target</div>
                                    <div className="text-4xl font-display font-black text-white">{breakEven.dailyUnitsNeeded} <span className="text-lg text-zinc-500">units</span></div>
                                    <div className="text-[10px] text-zinc-500 mt-1">At E£{businessConfig?.avgTicket} average ticket price</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Monthly Rev Target</div>
                                        <div className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(breakEven.revenue)}</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Total Units/Mo</div>
                                        <div className="text-lg font-mono font-bold text-cyan-400">{formatNumber(breakEven.units)}</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Recovery Month</div>
                                        <div className="text-lg font-mono font-bold text-amber-400">{breakEven.month || 'N/A'}</div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Safety Margin</div>
                                        <div className="text-lg font-mono font-bold text-indigo-400">{breakEven.revenue > 0 ? ((monthlyRevenue / breakEven.revenue - 1) * 100).toFixed(0) : 0}%</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Variable Costs if available */}
                        {variableCosts?.items && (
                            <Card className="col-span-12 p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Variable Cost Structure</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(variableCosts.items).map(([label, val], i) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-amber-500/20 transition-all">
                                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">{label}</div>
                                            <div className="text-lg font-mono font-bold text-white">{formatCurrency(val)}</div>
                                            <div className="text-[9px] text-zinc-700">{(val / monthlyRevenue * 100).toFixed(1)}% of revenue</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
