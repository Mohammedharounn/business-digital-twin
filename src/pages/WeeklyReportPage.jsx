import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WeeklyReportEngine } from '../engine/AdvancedEngines'
import { formatCurrency } from '../engine/SimulationEngine'
import api from '../lib/api'
import { useAppStore } from '../store/useAppStore'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ComposedChart, Line, Area, Cell, ReferenceLine
} from 'recharts'
import { Card } from '../components/elements/Card'
import { cn } from '../lib/utils'

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
                        {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function WeeklyReportPage({ financialData, riskData, businessConfig, scenarios }) {
    if (!financialData || !riskData) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12">
                <div className="text-5xl mb-6 animate-pulse">📅</div>
                <h3 className="text-lg font-bold text-white mb-2">Awaiting Simulation Data</h3>
                <p className="text-xs text-zinc-500">Configure your business to generate the weekly intelligence briefing</p>
            </div>
        );
    }

    const report = WeeklyReportEngine.generateWeeklyReport(financialData, riskData, businessConfig, scenarios);

    const activeProjectId = useAppStore((s) => s.activeProjectId);
    const [emailing, setEmailing] = useState(false);
    const [emailMsg, setEmailMsg] = useState('');
    const handleEmailReport = async () => {
        if (!activeProjectId) { setEmailMsg('Open a project first'); return; }
        setEmailing(true); setEmailMsg('');
        try {
            const res = await api.post(`/business/${activeProjectId}/email-report`);
            setEmailMsg('✓ ' + (res.data?.message || 'Sent'));
        } catch (err) {
            setEmailMsg(err.response?.data?.error || 'Email failed');
        } finally {
            setEmailing(false);
            setTimeout(() => setEmailMsg(''), 6000);
        }
    };

    // Cash flow chart data from next3Months + full forecast
    const cashFlowChartData = useMemo(() => {
        return financialData.forecast.map(f => ({
            month: f.monthLabel,
            Revenue: f.revenue,
            Costs: f.totalCosts,
            Profit: f.netProfit,
            Cumulative: f.cumulativeCashFlow
        }));
    }, [financialData]);

    // Period trend chart
    const trendChartData = useMemo(() => {
        return [
            { period: 'Mo 1-6', avgProfit: report.trends.earlyAvg, label: 'Early Stage' },
            { period: 'Mo 7-12', avgProfit: report.trends.midAvg, label: 'Growth Phase' },
            { period: 'Mo 13-18', avgProfit: report.trends.lateAvg, label: 'Maturity' }
        ];
    }, [report.trends]);

    const healthScore = report.summary.healthScore;
    const healthColor = healthScore >= 70 ? '#10b981' : healthScore >= 45 ? '#f59e0b' : '#ef4444';
    const healthLabel = healthScore >= 70 ? 'Healthy' : healthScore >= 45 ? 'Fair' : 'Critical';

    // Severity priority for alerts
    const sortedAlerts = [...report.alerts].sort((a, b) => {
        const p = { danger: 0, warning: 1, success: 2 };
        return (p[a.severity] || 3) - (p[b.severity] || 3);
    });

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">📅</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Weekly Intelligence Briefing</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        {report.period.from} — {report.period.to} · Auto-generated at {new Date(report.generatedAt).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleEmailReport}
                        disabled={emailing}
                        className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 text-[9px] font-black text-brand-primary rounded-full uppercase tracking-widest hover:bg-brand-primary/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                        title="Email this report to your account address"
                    >
                        <span>📧</span> {emailing ? 'Sending…' : 'Email Report'}
                    </button>
                    {emailMsg && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${emailMsg.startsWith('✓') ? 'text-emerald-400' : 'text-brand-rose'}`}>{emailMsg}</span>
                    )}
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 rounded-full uppercase tracking-widest animate-pulse">
                        Latest
                    </span>
                </div>
            </div>

            {/* Health Score + Headline */}
            <Card className="p-6 mb-6 relative overflow-hidden" style={{ borderLeft: `4px solid ${healthColor}` }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.03]" style={{ background: healthColor, filter: 'blur(80px)' }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex-shrink-0 text-center">
                        <div className="w-24 h-24 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center">
                            <div className="text-3xl font-display font-black" style={{ color: healthColor }}>{healthScore}</div>
                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{healthLabel}</div>
                        </div>
                        <div className="w-full bg-white/[0.05] rounded-full h-1.5 mt-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="h-full rounded-full" style={{ background: healthColor }} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-display font-bold text-white mb-2">{report.summary.headline}</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{report.recommendation}</p>
                    </div>
                </div>
            </Card>

            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                {[
                    { label: 'Revenue/mo', value: formatCurrency(report.summary.keyMetrics.monthlyRevenue), icon: '💰', color: 'text-indigo-400' },
                    { label: 'Profit/mo', value: formatCurrency(report.summary.keyMetrics.monthlyProfit), icon: '📈', color: report.summary.keyMetrics.monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Margin', value: `${report.summary.keyMetrics.profitMargin}%`, icon: '📊', color: 'text-cyan-400' },
                    { label: 'ROI (12mo)', value: `${report.summary.keyMetrics.roi}%`, icon: '🎯', color: report.summary.keyMetrics.roi >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Break-Even', value: report.summary.keyMetrics.breakEven ? `Mo ${report.summary.keyMetrics.breakEven}` : 'N/A', icon: '⏱️', color: 'text-amber-400' },
                    { label: 'Risk', value: report.summary.keyMetrics.riskLevel, icon: '🛡️', color: report.summary.keyMetrics.riskScore < 40 ? 'text-emerald-400' : report.summary.keyMetrics.riskScore < 70 ? 'text-amber-400' : 'text-red-400' },
                    { label: 'Funding', value: `${report.summary.keyMetrics.fundingScore}%`, icon: '🏦', color: 'text-purple-400' },
                    { label: 'Scenarios', value: report.scenarioCount, icon: '🔄', color: 'text-zinc-300' }
                ].map((kpi, i) => (
                    <Card key={i} className="p-3 group hover:border-white/10 transition-all">
                        <div className="text-lg mb-1">{kpi.icon}</div>
                        <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{kpi.label}</div>
                        <div className={cn("text-sm font-display font-bold mt-0.5", kpi.color)}>{kpi.value}</div>
                    </Card>
                ))}
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Alerts */}
                <Card className="col-span-12 lg:col-span-5 p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                        🚨 Alerts & Diagnostics
                        <span className={cn("text-[8px] px-2 py-0.5 rounded-full",
                            sortedAlerts.some(a => a.severity === 'danger') ? 'bg-red-500/10 text-red-400' :
                                sortedAlerts.some(a => a.severity === 'warning') ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-emerald-500/10 text-emerald-400'
                        )}>{sortedAlerts.length} {sortedAlerts.length === 1 ? 'alert' : 'alerts'}</span>
                    </h3>
                    <div className="space-y-2.5">
                        {sortedAlerts.map((alert, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                className={cn("p-3.5 rounded-xl border-l-[3px]",
                                    alert.severity === 'danger' ? 'bg-red-500/[0.04] border-l-red-500' :
                                        alert.severity === 'warning' ? 'bg-amber-500/[0.04] border-l-amber-500' :
                                            'bg-emerald-500/[0.04] border-l-emerald-500'
                                )}>
                                <div className="flex items-start gap-2">
                                    <span className="text-sm flex-shrink-0">{alert.icon}</span>
                                    <div>
                                        <div className="text-[11px] font-bold text-white">{alert.title}</div>
                                        <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{alert.text}</div>
                                    </div>
                                    <span className={cn("text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded flex-shrink-0",
                                        alert.severity === 'danger' ? 'bg-red-500/10 text-red-400' :
                                            alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-emerald-500/10 text-emerald-400'
                                    )}>{alert.severity}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Trend Analysis */}
                <Card className="col-span-12 lg:col-span-7 p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5">📊 Trend Analysis & Outlook</h3>

                    <div className="grid grid-cols-4 gap-3 mb-5">
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Profit Trend</div>
                            <div className={cn("text-sm font-bold mt-1", report.trends.profitTrend === 'improving' ? 'text-emerald-400' : 'text-red-400')}>
                                {report.trends.profitTrend === 'improving' ? '📈 Up' : '📉 Down'}
                            </div>
                            <div className="text-[9px] font-mono text-zinc-500">{report.trends.profitChange > 0 ? '+' : ''}{report.trends.profitChange}%</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Rev Growth</div>
                            <div className="text-sm font-bold text-indigo-400 mt-1">+{report.trends.revenueGrowth}%</div>
                            <div className="text-[9px] text-zinc-600">6-month</div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Outlook</div>
                            <div className={cn("text-sm font-bold mt-1", report.trends.outlook === 'positive' ? 'text-emerald-400' : 'text-amber-400')}>
                                {report.trends.outlook === 'positive' ? '🟢 Positive' : '🟡 Cautious'}
                            </div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Cash Flow</div>
                            <div className="text-sm font-bold text-white mt-1">
                                <span className="text-emerald-400">{report.cashFlowForecast.totalPositiveMonths}</span>
                                <span className="text-zinc-600">/</span>
                                <span className="text-red-400">{report.cashFlowForecast.negativeCashFlowMonths}</span>
                            </div>
                            <div className="text-[9px] text-zinc-600">+/- months</div>
                        </div>
                    </div>

                    {/* Profit Period Trend Chart */}
                    <ResponsiveContainer width="100%" height={180}>
                        <ComposedChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 9 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<PremiumTooltip />} />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                            <Bar dataKey="avgProfit" name="Avg Profit/mo" radius={[8, 8, 0, 0]} barSize={50}>
                                {trendChartData.map((d, i) => (
                                    <Cell key={i} fill={d.avgProfit >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.5} />
                                ))}
                            </Bar>
                            <Line type="monotone" dataKey="avgProfit" name="Trend" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: '#6366f1' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Opportunities & Optimizations Row */}
            <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Opportunities */}
                <Card className="col-span-12 lg:col-span-6 p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                        💡 Growth Opportunities
                        {report.opportunities.length > 0 && <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full">{report.opportunities.length} identified</span>}
                    </h3>
                    {report.opportunities.length > 0 ? (
                        <div className="space-y-2.5">
                            {report.opportunities.map((opp, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                                    className="p-4 rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10 hover:border-indigo-500/20 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg flex-shrink-0">{opp.icon}</span>
                                        <div className="flex-1">
                                            <div className="text-[11px] font-bold text-white group-hover:text-indigo-400 transition-colors">{opp.title}</div>
                                            <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{opp.description}</div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md uppercase tracking-wider">
                                                    Impact: {opp.potentialImpact}
                                                </span>
                                                <span className="text-[8px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md uppercase tracking-wider">
                                                    Priority: {opp.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-600">
                            <div className="text-3xl mb-2">✅</div>
                            <div className="text-xs">No high-priority opportunities at this time</div>
                        </div>
                    )}
                </Card>

                {/* Top Optimizations */}
                <Card className="col-span-12 lg:col-span-6 p-6">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                        ⚡ AI-Recommended Optimizations
                        <span className="text-[8px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">{report.topOptimizations.length} strategies</span>
                    </h3>
                    <div className="space-y-2.5">
                        {report.topOptimizations.map((opt, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                                className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/20 transition-all group">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[11px] font-bold text-emerald-400">#{i + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">{opt.icon} {opt.name}</span>
                                            <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md ml-auto">
                                                Score: {opt.score}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 leading-relaxed">{opt.description}</div>
                                        {/* Score bar */}
                                        <div className="mt-2 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, opt.score)}%` }}
                                                className="h-full rounded-full bg-emerald-500/50" transition={{ duration: 1, delay: 0.3 + i * 0.2 }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Forecast Chart */}
            <Card className="p-6 mb-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">💵 24-Month Cash Flow Forecast</h3>
                <p className="text-[10px] text-zinc-600 mb-6">Revenue, cost burn, and profit trajectory from simulation model</p>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={cashFlowChartData}>
                        <defs>
                            <linearGradient id="weeklyRevGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 9 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                        <Tooltip content={<PremiumTooltip />} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                        <Area type="monotone" dataKey="Revenue" fill="url(#weeklyRevGrad)" stroke="#6366f1" strokeWidth={2.5} name="Revenue" />
                        <Line type="monotone" dataKey="Costs" stroke="#27272a" strokeWidth={1.5} dot={false} strokeDasharray="6 3" name="Costs" />
                        <Bar dataKey="Profit" name="Net Profit" radius={[3, 3, 0, 0]} barSize={12}>
                            {cashFlowChartData.map((d, i) => (
                                <Cell key={i} fill={d.Profit >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.4} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Profitable Months</div>
                    <div className="text-2xl font-display font-bold text-emerald-400">{report.cashFlowForecast.totalPositiveMonths}<span className="text-sm text-zinc-600">/24</span></div>
                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500/50 rounded-full" style={{ width: `${(report.cashFlowForecast.totalPositiveMonths / 24) * 100}%` }} />
                    </div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Loss Months</div>
                    <div className={cn("text-2xl font-display font-bold", report.cashFlowForecast.negativeCashFlowMonths > 6 ? 'text-red-400' : 'text-amber-400')}>
                        {report.cashFlowForecast.negativeCashFlowMonths}<span className="text-sm text-zinc-600">/24</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-500/50 rounded-full" style={{ width: `${(report.cashFlowForecast.negativeCashFlowMonths / 24) * 100}%` }} />
                    </div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Revenue Growth</div>
                    <div className="text-2xl font-display font-bold text-indigo-400">+{report.trends.revenueGrowth}%</div>
                    <div className="text-[9px] text-zinc-600 mt-1">6-month delta</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Scenarios Active</div>
                    <div className="text-2xl font-display font-bold text-purple-400">{report.scenarioCount}</div>
                    <div className="text-[9px] text-zinc-600 mt-1">in forge</div>
                </Card>
            </div>

            {/* Report Footer */}
            <div className="mt-6 text-center">
                <div className="text-[9px] text-zinc-700 uppercase tracking-widest">
                    AI-Generated Report · {report.period.from} – {report.period.to} · Digital Twin Model V2.42
                </div>
            </div>
        </div>
    );
}
