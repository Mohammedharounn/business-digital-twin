import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Area, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/elements/Card';
import { Button } from '../components/elements/Button';
import { RealDatasetProcessor, OnlineRetailProcessor } from '../engine/RealDatasetProcessor';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function KPI({ label, value, sub, color = 'indigo' }) {
    const cls = {
        indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
        emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
        cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20'
    };
    return (
        <div className={`bg-gradient-to-br ${cls[color]} border rounded-xl p-4`}>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
            <p className="text-xl font-bold font-mono text-white mt-1">{value}</p>
            {sub && <p className="text-[10px] text-zinc-500 mt-1">{sub}</p>}
        </div>
    );
}

export default function DatasetExplorer() {
    const [activeDS, setActiveDS] = useState('archive');

    const archiveSummary = useMemo(() => RealDatasetProcessor.getDigitalTwinSummary(), []);
    const archiveMonthly = useMemo(() => RealDatasetProcessor.getMonthlyAggregates(), []);
    const archiveCategories = useMemo(() => RealDatasetProcessor.getCategoryBreakdown(), []);
    const archiveSeasonal = useMemo(() => RealDatasetProcessor.getSeasonalAnalysis(), []);
    const archiveTopSites = useMemo(() => RealDatasetProcessor.getTopSites(), []);
    const archiveCustomers = useMemo(() => RealDatasetProcessor.getCustomerSegments(), []);
    const archiveLogistics = useMemo(() => RealDatasetProcessor.getLogisticsSummary(), []);
    const archiveInventory = useMemo(() => RealDatasetProcessor.getInventorySummary(), []);

    const onlineSummary = useMemo(() => OnlineRetailProcessor.getSummary(), []);
    const onlineMonthly = useMemo(() => OnlineRetailProcessor.getMonthlyAggregates(), []);

    const categoryPieData = useMemo(() =>
        Object.entries(archiveCategories).map(([name, data]) => ({
            name, value: data.totalRevenue
        })), [archiveCategories]);

    const logisticsPieData = useMemo(() =>
        Object.entries(archiveLogistics.deliveryStatus).map(([name, value]) => ({
            name, value
        })), [archiveLogistics]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                <h1 className="text-2xl font-display font-bold text-white mb-2">
                    Real Dataset Explorer
                </h1>
                <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
                    Analyzing production-grade datasets for Digital Twin validation & Chapter 5 evaluation
                </p>
            </motion.div>

            {/* Dataset Selector */}
            <div className="flex gap-2 bg-white/[0.02] rounded-xl p-1 border border-white/5">
                <button onClick={() => setActiveDS('archive')} className={`flex-1 py-3 px-4 rounded-lg text-xs font-medium transition-all ${activeDS === 'archive' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
                    📦 Archive Dataset (Multi-Site Retail)
                </button>
                <button onClick={() => setActiveDS('online')} className={`flex-1 py-3 px-4 rounded-lg text-xs font-medium transition-all ${activeDS === 'online' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
                    🛒 Online Retail (E-Commerce)
                </button>
            </div>

            {/* ─── ARCHIVE DATASET ─── */}
            {activeDS === 'archive' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <KPI label="Total Revenue" value={`E£${(archiveSummary.totalRevenue / 1000).toFixed(0)}K`} sub="14 months" color="indigo" />
                        <KPI label="Profit Margin" value={`${archiveSummary.profitMargin}%`} sub={`E£${(archiveSummary.totalProfit / 1000).toFixed(0)}K profit`} color="emerald" />
                        <KPI label="Transactions" value={archiveSummary.totalTransactions} sub="220 sales records" color="cyan" />
                        <KPI label="Products" value={archiveSummary.products} sub="4 categories" color="purple" />
                        <KPI label="Sites" value={archiveSummary.sites.totalSites} sub={`${archiveSummary.sites.activeSites} active`} color="amber" />
                    </div>

                    {/* Monthly Revenue + Profit Chart */}
                    <Card className="border border-white/5" animate>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Monthly Revenue vs Costs (Archive Data)</CardTitle>
                            <CardDescription>14-month real multi-site retail performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                                <ComposedChart data={archiveMonthly}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [`E£${Math.round(v).toLocaleString()}`, '']} />
                                    <Bar dataKey="costs" fill="rgba(239,68,68,0.25)" name="Costs" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="revenue" fill="rgba(99,102,241,0.4)" name="Revenue" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="avgTicket" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Avg Ticket (E£)" yAxisId={1} />
                                    <YAxis yAxisId={1} orientation="right" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${v}`} />
                                    <Legend />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category + Sites Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category Breakdown */}
                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Revenue by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                                            {categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => [`E£${v.toLocaleString()}`, 'Revenue']} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1 mt-2">
                                    {Object.entries(archiveCategories).map(([cat, d]) => (
                                        <div key={cat} className="flex justify-between text-xs">
                                            <span className="text-zinc-400">{cat}</span>
                                            <span className="text-zinc-300 font-mono">{d.transactions} txns · ${d.avgTicket} avg</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Sites */}
                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Top Performing Sites</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {archiveTopSites.map((site, i) => (
                                        <div key={site.siteId} className="flex items-center gap-3">
                                            <span className="text-lg w-7 text-center">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-white font-medium">{site.name}</span>
                                                    <span className="text-indigo-400 font-mono">${site.revenue.toLocaleString()}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(site.revenue / archiveTopSites[0].revenue * 100)}%` }}></div>
                                                </div>
                                                <div className="text-[10px] text-zinc-500 mt-0.5">{site.siteId} · {site.format} format · {site.transactions} transactions</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer + Logistics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Segments */}
                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Customer Demographics</CardTitle>
                                <CardDescription>{archiveCustomers.totalCustomers} customers, avg age {archiveCustomers.avgAge}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">By Income Bracket</p>
                                <div className="space-y-1 mb-4">
                                    {archiveCustomers.byIncome.map(seg => (
                                        <div key={seg.bracket} className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-400">{seg.bracket}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-zinc-500">{seg.count} customers</span>
                                                <span className="text-emerald-400 font-mono">${seg.avgSpend.toFixed(0)} avg</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">By Gender</p>
                                <div className="flex gap-3">
                                    {archiveCustomers.byGender.map(g => (
                                        <div key={g.gender} className="flex-1 bg-white/[0.02] rounded-lg p-2 border border-white/5 text-center">
                                            <p className="text-xs text-white font-medium">{g.gender}</p>
                                            <p className="text-lg font-bold font-mono text-indigo-400">{g.count}</p>
                                            <p className="text-[10px] text-zinc-500">${g.avgSpend.toFixed(0)} avg</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logistics */}
                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Supply Chain & Logistics</CardTitle>
                                <CardDescription>{archiveLogistics.totalShipments} total shipments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie data={logisticsPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                        <p className="text-[10px] text-zinc-500">Delivery Rate</p>
                                        <p className="text-sm font-mono text-emerald-400">{archiveLogistics.deliveryRate}%</p>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                        <p className="text-[10px] text-zinc-500">Delay Rate</p>
                                        <p className="text-sm font-mono text-amber-400">{archiveLogistics.delayRate}%</p>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                        <p className="text-[10px] text-zinc-500">Cancel Rate</p>
                                        <p className="text-sm font-mono text-red-400">{archiveLogistics.cancelRate}%</p>
                                    </div>
                                    <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                        <p className="text-[10px] text-zinc-500">Inventory Health</p>
                                        <p className="text-sm font-mono text-cyan-400">{archiveInventory.healthScore}/100</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dataset Info */}
                    <Card className="border border-white/5" animate>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">📁 Dataset Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-zinc-400">
                                {[
                                    ['Sales_Data.csv', '220 rows', 'Transactions with revenue, discounts, returns'],
                                    ['Customer_Demographics.csv', '50 rows', 'Age, gender, income, purchase frequency'],
                                    ['Product_Information.csv', '100 rows', 'Dairy, Bakery, Electronics, Apparel'],
                                    ['Site_Details.csv', '50 rows', 'Stores across 10 Indian cities'],
                                    ['Inventory_Data.csv', '100 rows', 'Beginning/ending inventory, replenishment'],
                                    ['Logistics_Data.csv', '150 rows', 'Shipments via Truck, Ship, Air, Rail'],
                                    ['Promotions_and_Discounts.csv', '50 rows', 'Flat & percentage discounts'],
                                    ['Monthly_Seasonal_Planning.csv', '120 rows', 'Forecasted vs actual sales']
                                ].map(([name, rows, desc]) => (
                                    <div key={name} className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                                        <p className="text-white font-mono text-[10px]">{name}</p>
                                        <p className="text-zinc-500 text-[10px]">{rows}</p>
                                        <p className="text-zinc-600 text-[10px] mt-0.5">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── ONLINE RETAIL DATASET ─── */}
            {activeDS === 'online' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <KPI label="Total Revenue" value={`E£${(onlineSummary.totalRevenue / 1000000).toFixed(1)}M`} sub="13 months" color="purple" />
                        <KPI label="Avg Monthly" value={`E£${(onlineSummary.avgMonthlyRevenue / 1000).toFixed(0)}K`} sub="per month" color="indigo" />
                        <KPI label="Transactions" value={onlineSummary.totalTransactions.toLocaleString()} sub="541K records" color="cyan" />
                        <KPI label="Customers" value={onlineSummary.totalCustomers.toLocaleString()} sub="Unique buyers" color="emerald" />
                        <KPI label="Products" value={onlineSummary.totalProducts.toLocaleString()} sub="SKUs" color="amber" />
                    </div>

                    {/* Monthly Revenue Chart */}
                    <Card className="border border-white/5" animate>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Monthly Revenue (Online Retail — UK E-Commerce)</CardTitle>
                            <CardDescription>Source: UCI Machine Learning Repository — 541,909 transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <ComposedChart data={onlineMonthly}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [`E£${Math.round(v).toLocaleString()}`, '']} />
                                    <Area type="monotone" dataKey="revenue" fill="rgba(139,92,246,0.15)" stroke="none" name="Revenue" />
                                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} name="Revenue" />
                                    <Bar dataKey="transactions" fill="rgba(6,182,212,0.2)" name="Transactions" yAxisId={1} radius={[3, 3, 0, 0]} />
                                    <YAxis yAxisId={1} orientation="right" tick={{ fill: '#71717a', fontSize: 10 }} />
                                    <Legend />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Customer & Transaction Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Customer Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={onlineMonthly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
                                        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                        <Bar dataKey="customers" fill="rgba(16,185,129,0.4)" name="Unique Customers" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border border-white/5" animate>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Average Ticket Price</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={onlineMonthly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
                                        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `$${v}`} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [`$${v.toFixed(2)}`, 'Avg Ticket']} />
                                        <Line type="monotone" dataKey="avgTicket" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dataset Info */}
                    <Card className="border border-white/5" animate>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">📁 Dataset Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-zinc-400 space-y-1">
                                <p><span className="text-white">Source:</span> UCI Machine Learning Repository — Online Retail Dataset</p>
                                <p><span className="text-white">File:</span> Online Retail.xlsx (23.7 MB)</p>
                                <p><span className="text-white">Records:</span> 541,909 transaction rows</p>
                                <p><span className="text-white">Period:</span> Dec 2010 – Dec 2011</p>
                                <p><span className="text-white">Country:</span> United Kingdom (non-store online retail, registered)</p>
                                <p><span className="text-white">Columns:</span> InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country</p>
                                <p><span className="text-white">Peak:</span> November 2011 (E£1.46M revenue — pre-Christmas surge)</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
