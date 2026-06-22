import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BUSINESS_TYPES, AIInsightEngine, RiskEngine, formatCurrency } from '../engine/SimulationEngine'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ComposedChart, Line, Area, ReferenceLine
} from 'recharts'
import { Card } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'

const PIE_COLORS = ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

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

export default function ReportsPage({ financialData, riskData, insights, businessConfig, scenarios }) {
    const [generating, setGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState('summary');

    if (!financialData) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12">
                <div className="text-5xl mb-6 animate-pulse">📄</div>
                <h3 className="text-lg font-bold text-white mb-2">Awaiting Simulation Data</h3>
                <p className="text-xs text-zinc-500">Configure your business to generate the full audit report</p>
            </div>
        );
    }

    const businessType = BUSINESS_TYPES.find(b => b.id === businessConfig?.businessType);
    const aiEngine = new AIInsightEngine(financialData, businessConfig);
    const execSummary = aiEngine.generateExecutiveSummary();

    // Cost breakdown data for pie charts
    const startupPieData = useMemo(() => {
        return Object.entries(financialData.startup.items).map(([k, v]) => ({ name: k, value: v }));
    }, [financialData]);

    const fixedCostPieData = useMemo(() => {
        return Object.entries(financialData.fixedCosts.items).map(([k, v]) => ({ name: k, value: v }));
    }, [financialData]);

    // Forecast chart
    const forecastData = useMemo(() => {
        return financialData.forecast.map(f => ({
            month: f.monthLabel,
            Revenue: f.revenue,
            Profit: f.netProfit,
            Cumulative: f.cumulativeCashFlow
        }));
    }, [financialData]);

    // Funding readiness
    const funding = execSummary.fundingReadiness;
    const fundingColor = funding.score >= 80 ? '#10b981' : funding.score >= 60 ? '#f59e0b' : funding.score >= 40 ? '#f97316' : '#ef4444';

    const generatePDF = async () => {
        setGenerating(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            let y = 20;
            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

            doc.setFontSize(22);
            doc.setFont(undefined, 'bold');
            doc.text('Business Digital Twin Report', margin, y);
            y += 10;

            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100);
            doc.text(`${businessType?.name || 'Business'} — ${businessConfig?.businessName || ''}`, margin, y);
            y += 6;
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
            y += 12;
            doc.setTextColor(0);

            doc.setDrawColor(200);
            doc.line(margin, y, margin + pageWidth, y);
            y += 10;

            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Executive Summary', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const summaryLines = doc.splitTextToSize(execSummary.overview, pageWidth);
            doc.text(summaryLines, margin, y);
            y += summaryLines.length * 5 + 8;

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Key Financial Metrics', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            Object.entries(execSummary.keyMetrics).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, margin + 4, y);
                y += 6;
                if (y > 270) { doc.addPage(); y = 20; }
            });
            y += 8;

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Recommendation', margin, y);
            y += 7;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            const recLines = doc.splitTextToSize(execSummary.recommendation, pageWidth);
            doc.text(recLines, margin, y);
            y += recLines.length * 5 + 8;

            doc.text(`Funding Readiness: ${funding.score}% (${funding.label})`, margin, y);
            y += 12;

            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Startup Cost Breakdown', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            Object.entries(financialData.startup.items).forEach(([key, value]) => {
                doc.text(`${key}: E£${value.toLocaleString()}`, margin + 4, y);
                y += 6;
                if (y > 270) { doc.addPage(); y = 20; }
            });
            doc.setFont(undefined, 'bold');
            doc.text(`Total Startup Cost: E£${financialData.startup.total.toLocaleString()}`, margin + 4, y);
            y += 12;

            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Monthly Fixed Costs', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            Object.entries(financialData.fixedCosts.items).forEach(([key, value]) => {
                doc.text(`${key}: E£${value.toLocaleString()}`, margin + 4, y);
                y += 6;
                if (y > 270) { doc.addPage(); y = 20; }
            });
            doc.setFont(undefined, 'bold');
            doc.text(`Total Monthly Fixed: E£${financialData.fixedCosts.total.toLocaleString()}`, margin + 4, y);
            y += 12;

            if (y > 200) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Risk Assessment', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Overall Risk Score: ${riskData.riskScore.score}/100 (${riskData.riskScore.level})`, margin + 4, y);
            y += 8;

            riskData.risks.forEach(risk => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFont(undefined, 'bold');
                doc.text(`[${risk.severity.toUpperCase()}] ${risk.title}`, margin + 4, y);
                y += 6;
                doc.setFont(undefined, 'normal');
                const riskLines = doc.splitTextToSize(risk.description, pageWidth - 8);
                doc.text(riskLines, margin + 8, y);
                y += riskLines.length * 5 + 4;
            });

            // Scenarios
            if (scenarios?.length > 0) {
                if (y > 200) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('Scenario Comparison', margin, y);
                y += 8;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                scenarios.forEach(s => {
                    doc.text(`${s.name}: Revenue ${formatCurrency(s.summary?.monthlyRevenue || 0)}/mo, Profit ${formatCurrency(s.summary?.monthlyProfit || 0)}/mo, Margin ${s.summary?.profitMargin || 0}%, ROI ${s.summary?.roi?.roi || 0}%`, margin + 4, y);
                    y += 6;
                    if (y > 270) { doc.addPage(); y = 20; }
                });
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Business Digital Twin Report — Page ${i} of ${pageCount}`, margin, 290);
            }

            doc.save(`business-digital-twin-report-${Date.now()}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
        }
        setGenerating(false);
    };

    const sections = [
        { id: 'summary', label: '📋 Executive Summary' },
        { id: 'financials', label: '💰 Financials' },
        { id: 'risks', label: '🛡️ Risk Audit' },
        { id: 'scenarios', label: '🔄 Scenarios' },
        { id: 'export', label: '📥 Export' }
    ];

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">📄</span>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Full Audit Report</h1>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        Comprehensive Business Intelligence · Generated {new Date().toLocaleDateString()}
                    </p>
                </div>
                <Button onClick={generatePDF} disabled={generating} className="px-6 py-3">
                    {generating ? '⏳ Generating PDF...' : '📥 Download Full PDF'}
                </Button>
            </div>

            {/* Section Nav */}
            <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5 w-fit mb-6 flex-wrap">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                        className={cn("px-4 py-2.5 rounded-lg text-xs font-medium transition-all",
                            activeSection === s.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                        {s.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ─── EXECUTIVE SUMMARY ─── */}
                {activeSection === 'summary' && (
                    <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Business Identity */}
                        <Card className="p-6 relative overflow-hidden border-l-4 border-l-indigo-500">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <span className="text-8xl">{businessType?.icon || '🏢'}</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">{businessType?.icon || '🏢'}</span>
                                    <div>
                                        <h2 className="text-xl font-display font-bold text-white">{businessConfig?.businessName || businessType?.name || 'Business'}</h2>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{businessType?.name} · {businessConfig?.location || 'Digital Realm'}</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 rounded-full uppercase tracking-widest">
                                        Investor Ready
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed mb-6">{execSummary.overview}</p>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                    {Object.entries(execSummary.keyMetrics).map(([key, value], i) => (
                                        <div key={key} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center hover:border-indigo-500/20 transition-all">
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">{key}</div>
                                            <div className="text-sm font-display font-bold text-white">{value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommendation + Funding */}
                                <div className="grid grid-cols-12 gap-4 mt-5">
                                    <div className={cn("col-span-12 lg:col-span-8 p-4 rounded-xl border",
                                        execSummary.recommendation.includes('strong') ? 'bg-emerald-500/[0.04] border-emerald-500/15' : 'bg-amber-500/[0.04] border-amber-500/15')}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: execSummary.recommendation.includes('strong') ? '#10b981' : '#f59e0b' }}>
                                            AI Recommendation
                                        </div>
                                        <p className="text-sm text-zinc-300 leading-relaxed">{execSummary.recommendation}</p>
                                    </div>
                                    <Card className="col-span-12 lg:col-span-4 p-4 text-center">
                                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Funding Readiness</div>
                                        <div className="text-4xl font-display font-black mb-1" style={{ color: fundingColor }}>{funding.score}%</div>
                                        <div className="text-[10px] font-bold" style={{ color: fundingColor }}>{funding.label}</div>
                                        <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${funding.score}%` }}
                                                className="h-full rounded-full" style={{ background: fundingColor }} transition={{ duration: 1.5 }} />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* ─── FINANCIALS ─── */}
                {activeSection === 'financials' && (
                    <motion.div key="financials" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Forecast Chart */}
                        <Card className="p-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">24-Month Financial Forecast</h3>
                            <p className="text-[10px] text-zinc-600 mb-6">Revenue, net profit, and cumulative cash position</p>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="auditRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 9 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3f3f46', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={<PremiumTooltip />} />
                                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                    <Area type="monotone" dataKey="Revenue" fill="url(#auditRevGrad)" stroke="#6366f1" strokeWidth={2.5} name="Revenue" />
                                    <Bar dataKey="Profit" name="Net Profit" radius={[3, 3, 0, 0]} barSize={12}>
                                        {forecastData.map((d, i) => (
                                            <Cell key={i} fill={d.Profit >= 0 ? '#10b981' : '#ef4444'} fillOpacity={0.4} />
                                        ))}
                                    </Bar>
                                    <Line type="monotone" dataKey="Cumulative" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 3" name="Cumulative" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>

                        <div className="grid grid-cols-12 gap-6">
                            {/* Startup Costs */}
                            <Card className="col-span-12 lg:col-span-6 p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5">Startup Investment Breakdown</h3>
                                <div className="grid grid-cols-2 gap-6 items-center">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={startupPieData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                                {startupPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.7} />)}
                                            </Pie>
                                            <Tooltip content={<PremiumTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2">
                                        {Object.entries(financialData.startup.items).sort((a, b) => b[1] - a[1]).map(([label, val], i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    <span className="text-[10px] text-zinc-400">{label}</span>
                                                </div>
                                                <span className="text-[11px] font-mono font-bold text-white">{formatCurrency(val)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-white/5 flex justify-between">
                                            <span className="text-[10px] text-zinc-300 font-bold">Total</span>
                                            <span className="text-sm font-mono font-bold text-indigo-400">{formatCurrency(financialData.startup.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Monthly Fixed Costs */}
                            <Card className="col-span-12 lg:col-span-6 p-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5">Monthly Fixed Operating Costs</h3>
                                <div className="grid grid-cols-2 gap-6 items-center">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={fixedCostPieData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                                {fixedCostPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} fillOpacity={0.7} />)}
                                            </Pie>
                                            <Tooltip content={<PremiumTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2">
                                        {Object.entries(financialData.fixedCosts.items).sort((a, b) => b[1] - a[1]).map(([label, val], i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_COLORS[(i + 3) % PIE_COLORS.length] }} />
                                                    <span className="text-[10px] text-zinc-400">{label}</span>
                                                </div>
                                                <span className="text-[11px] font-mono font-bold text-white">{formatCurrency(val)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-white/5 flex justify-between">
                                            <span className="text-[10px] text-zinc-300 font-bold">Total/mo</span>
                                            <span className="text-sm font-mono font-bold text-indigo-400">{formatCurrency(financialData.fixedCosts.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Variable Costs + Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Investment', value: formatCurrency(financialData.startup.total), color: 'text-indigo-400' },
                                { label: 'Monthly Fixed', value: formatCurrency(financialData.fixedCosts.total), color: 'text-red-400' },
                                { label: 'Monthly Variable', value: formatCurrency(financialData.variableCosts?.total || 0), color: 'text-amber-400' },
                                { label: 'Annual Profit', value: formatCurrency(financialData.annualProfit), color: financialData.annualProfit >= 0 ? 'text-emerald-400' : 'text-red-400' }
                            ].map((m, i) => (
                                <Card key={i} className="p-4 text-center">
                                    <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{m.label}</div>
                                    <div className={cn("text-lg font-display font-bold mt-1", m.color)}>{m.value}</div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ─── RISK AUDIT ─── */}
                {activeSection === 'risks' && (
                    <motion.div key="risks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Risk Score Header */}
                        <Card className="p-6">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className={cn("text-4xl font-display font-black",
                                        riskData.riskScore.score < 40 ? 'text-emerald-400' : riskData.riskScore.score < 70 ? 'text-amber-400' : 'text-red-400'
                                    )}>{riskData.riskScore.score}</div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Risk Score</div>
                                    <div className={cn("text-[10px] font-bold mt-0.5",
                                        riskData.riskScore.score < 40 ? 'text-emerald-400' : riskData.riskScore.score < 70 ? 'text-amber-400' : 'text-red-400'
                                    )}>{riskData.riskScore.level}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Total Risks</div>
                                            <div className="text-lg font-bold text-white">{riskData.risks.length}</div>
                                        </div>
                                        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-xl p-3 text-center">
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">High Severity</div>
                                            <div className="text-lg font-bold text-red-400">{riskData.risks.filter(r => r.severity === 'high').length}</div>
                                        </div>
                                        <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3 text-center">
                                            <div className="text-[8px] text-zinc-600 uppercase tracking-widest">Medium</div>
                                            <div className="text-lg font-bold text-amber-400">{riskData.risks.filter(r => r.severity !== 'high').length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Risk Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {riskData.risks.map((risk, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <Card className="p-5 hover:border-white/10 transition-all group h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                    risk.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                                )}>{risk.severity}</span>
                                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md">{risk.category}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{risk.title}</h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{risk.description}</p>
                                        <div className="p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                                            <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-1">✦ Mitigation Strategy</div>
                                            <p className="text-[10px] text-zinc-400 leading-relaxed">{risk.suggestion}</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ─── SCENARIOS ─── */}
                {activeSection === 'scenarios' && (
                    <motion.div key="scenarios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {scenarios && scenarios.length > 0 ? (
                            <>
                                <Card className="p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                                        Scenario Comparison
                                        <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full">{scenarios.length} scenarios</span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5">
                                                    <th className="pb-3 text-left text-[9px] font-black text-zinc-600 uppercase tracking-widest">Scenario</th>
                                                    <th className="pb-3 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">Revenue</th>
                                                    <th className="pb-3 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">Profit</th>
                                                    <th className="pb-3 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">Margin</th>
                                                    <th className="pb-3 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">ROI</th>
                                                    <th className="pb-3 text-right text-[9px] font-black text-zinc-600 uppercase tracking-widest">Break-Even</th>
                                                    <th className="pb-3 text-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">Risk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {scenarios.map((s, i) => (
                                                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                                                        <td className="py-3.5 text-sm font-bold text-white">{s.name}</td>
                                                        <td className="py-3.5 text-right font-mono text-sm text-zinc-200">{formatCurrency(s.summary?.monthlyRevenue || 0)}</td>
                                                        <td className={cn("py-3.5 text-right font-mono text-sm font-bold",
                                                            (s.summary?.monthlyProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                                                            {formatCurrency(s.summary?.monthlyProfit || 0)}
                                                        </td>
                                                        <td className="py-3.5 text-right font-mono text-sm text-zinc-300">{s.summary?.profitMargin || 0}%</td>
                                                        <td className="py-3.5 text-right font-mono text-sm text-cyan-400">{s.summary?.roi?.roi || 0}%</td>
                                                        <td className="py-3.5 text-right font-mono text-sm text-zinc-300">{s.summary?.breakEven?.month ? `Mo ${s.summary.breakEven.month}` : 'N/A'}</td>
                                                        <td className="py-3.5 text-center">
                                                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md",
                                                                (s.risk?.riskScore?.level || '') === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                    (s.risk?.riskScore?.level || '') === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                                                                        'bg-red-500/10 text-red-400'
                                                            )}>{s.risk?.riskScore?.level || 'N/A'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                {/* Scenario Profit Comparison */}
                                <Card className="p-6">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Profit Comparison</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={scenarios.map(s => ({
                                            name: s.name.substring(0, 14),
                                            profit: s.summary?.monthlyProfit || 0
                                        }))} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip content={<PremiumTooltip />} />
                                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                            <Bar dataKey="profit" name="Monthly Profit" radius={[6, 6, 0, 0]} barSize={45}>
                                                {scenarios.map((s, i) => (
                                                    <Cell key={i} fill={(s.summary?.monthlyProfit || 0) >= 0 ? PIE_COLORS[i % PIE_COLORS.length] : '#ef4444'} fillOpacity={0.6} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </>
                        ) : (
                            <Card className="p-12 text-center border-dashed border-white/10 bg-transparent">
                                <div className="text-4xl mb-4">🔄</div>
                                <h3 className="text-sm font-bold text-white mb-2">No Scenarios Created</h3>
                                <p className="text-xs text-zinc-500">Visit the Forge page to create and compare business scenarios</p>
                            </Card>
                        )}
                    </motion.div>
                )}

                {/* ─── EXPORT ─── */}
                {activeSection === 'export' && (
                    <motion.div key="export" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-12 gap-6">
                        <Card className="col-span-12 lg:col-span-6 p-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5">📂 Available Reports</h3>
                            <div className="space-y-2">
                                {[
                                    { name: 'Full Business Plan', icon: '📊', desc: 'Complete financial analysis, risk assessment, and recommendations', available: true },
                                    { name: 'Investor Pitch Summary', icon: '🎯', desc: 'Key metrics, growth potential, and funding ask', available: true },
                                    { name: 'Cash Flow Forecast', icon: '💰', desc: '24-month detailed cash flow projection', available: true },
                                    { name: 'Risk Assessment Report', icon: '🛡️', desc: 'Complete risk analysis with mitigation strategies', available: true },
                                    { name: 'Competitor Analysis', icon: '🏪', desc: 'Market positioning and competitive landscape', available: false },
                                    { name: 'Marketing Plan', icon: '📣', desc: 'Go-to-market strategy and channels', available: false }
                                ].map((report, i) => (
                                    <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all",
                                        !report.available && 'opacity-40')}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{report.icon}</span>
                                            <div>
                                                <div className="text-[11px] font-bold text-white">{report.name}</div>
                                                <div className="text-[10px] text-zinc-500">{report.desc}</div>
                                            </div>
                                        </div>
                                        {report.available ? (
                                            <button onClick={generatePDF} disabled={generating}
                                                className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all">
                                                Export
                                            </button>
                                        ) : (
                                            <span className="text-[8px] font-bold text-zinc-600 px-2 py-1 bg-white/5 rounded">Soon</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="col-span-12 lg:col-span-6 p-6">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5">💾 Export Formats</h3>
                            <div className="space-y-2">
                                {[
                                    { format: 'PDF Report', icon: '📄', desc: 'Professional formatted multi-page document', available: true },
                                    { format: 'Excel Workbook', icon: '📊', desc: 'Spreadsheet with all financial projections', available: false },
                                    { format: 'PowerPoint Deck', icon: '📽️', desc: 'Investor presentation slides', available: false },
                                    { format: 'JSON / API', icon: '🔗', desc: 'Machine-readable data export', available: false }
                                ].map((exp, i) => (
                                    <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all",
                                        !exp.available && 'opacity-40')}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{exp.icon}</span>
                                            <div>
                                                <div className="text-[11px] font-bold text-white">{exp.format}</div>
                                                <div className="text-[10px] text-zinc-500">{exp.desc}</div>
                                            </div>
                                        </div>
                                        {exp.available ? (
                                            <Button onClick={generatePDF} disabled={generating} className="!py-1.5 !px-4 text-[9px]">
                                                Download
                                            </Button>
                                        ) : (
                                            <span className="text-[8px] font-bold text-zinc-600 px-2 py-1 bg-white/5 rounded">Soon</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl">
                                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Report Contents</div>
                                <div className="text-[10px] text-zinc-500 space-y-0.5">
                                    <div>✅ Executive Summary & Recommendation</div>
                                    <div>✅ Key Financial Metrics (7 KPIs)</div>
                                    <div>✅ Startup Cost Breakdown</div>
                                    <div>✅ Monthly Fixed Cost Analysis</div>
                                    <div>✅ Risk Assessment with Mitigations</div>
                                    <div>✅ Scenario Comparison (if available)</div>
                                    <div>✅ Funding Readiness Score</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-8 text-center">
                <div className="text-[9px] text-zinc-700 uppercase tracking-widest">
                    Full Audit Report · Digital Twin Model V2.42 · {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
