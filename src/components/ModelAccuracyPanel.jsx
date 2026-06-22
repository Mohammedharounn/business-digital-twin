import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, AreaChart, ComposedChart, Bar,
    Legend, ReferenceLine, ScatterChart, Scatter, BarChart
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './elements/Card';
import { Button } from './elements/Button';
import { MLPipeline, MonteCarloEngine, BacktestEngine, CalibrationEngine, SampleDataset, AnomalyDetector, ResidualAnalyzer } from '../engine/MLEngine';
import { RealDatasetProcessor } from '../engine/RealDatasetProcessor';
import DataIngestionPanel from './DataIngestionPanel';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Metric Card ──
function MetricBadge({ label, value, unit = '', color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
    };

    return (
        <div className={`rounded-xl border px-4 py-3 ${colors[color]}`}>
            <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">{label}</div>
            <div className="text-xl font-bold font-mono">{value}{unit}</div>
        </div>
    );
}

// ── Main Panel ──
export default function ModelAccuracyPanel({ businessConfig, financialData }) {
    const [mlReport, setMlReport] = useState(null);
    const [monteCarloData, setMonteCarloData] = useState(null);
    const [backtestReport, setBacktestReport] = useState(null);
    const [calibrationResult, setCalibrationResult] = useState(null);
    const [residualData, setResidualData] = useState(null);
    const [anomalyData, setAnomalyData] = useState(null);
    const [actuals, setActuals] = useState([]);
    const [activeTab, setActiveTab] = useState('ml');
    const [isTraining, setIsTraining] = useState(false);
    const [pipeline] = useState(() => new MLPipeline());

    // Train ML model on mount
    useEffect(() => {
        if (businessConfig?.businessType && !mlReport) {
            trainModel();
        }
    }, [businessConfig?.businessType]);

    const trainModel = () => {
        setIsTraining(true);
        setTimeout(() => {
            try {
                const report = pipeline.trainForBusinessType(businessConfig.businessType, 500);
                setMlReport(report);
                // Also run residual analysis
                const residuals = pipeline.residualAnalysis(businessConfig.businessType);
                setResidualData(residuals);
            } catch (err) {
                console.error('[ML] Training failed:', err);
            }
            setIsTraining(false);
        }, 100);
    };

    const runMonteCarlo = () => {
        const result = MonteCarloEngine.simulate(businessConfig, {
            iterations: 1000,
            uncertaintyRange: 0.15,
            forecastMonths: 24
        });
        setMonteCarloData(result);
    };

    const runBacktest = () => {
        if (actuals.length === 0) return;
        const report = BacktestEngine.run(actuals, businessConfig);
        setBacktestReport(report);
        // Also run anomaly detection
        const anomalies = AnomalyDetector.detect(actuals);
        setAnomalyData(anomalies);
    };

    const runCalibration = () => {
        if (actuals.length < 3) return;
        const result = CalibrationEngine.calibrate(actuals, businessConfig);
        setCalibrationResult(result);
    };

    const loadSampleData = () => {
        // Load real archive data (pre-processed from archivedataset CSVs)
        const monthlyAggregates = RealDatasetProcessor.getMonthlyAggregates();
        const realActuals = monthlyAggregates.map(m => ({
            month: m.month,
            revenue: m.revenue,
            costs: m.costs,
            customers: m.customers,
            units: m.units,
            avgTicket: m.avgTicket,
            label: m.label
        }));
        setActuals(realActuals);
    };

    const handleDataUpload = (records) => {
        setActuals(prev => {
            const merged = [...prev];
            records.forEach(r => {
                const idx = merged.findIndex(m => m.month === r.month);
                if (idx >= 0) merged[idx] = r;
                else merged.push(r);
            });
            return merged.sort((a, b) => a.month - b.month);
        });
    };

    const tabs = [
        { id: 'ml', label: '🧠 ML Model' },
        { id: 'montecarlo', label: '🎲 Monte Carlo' },
        { id: 'data', label: '📥 Data' },
        { id: 'backtest', label: '📊 Backtest' },
        { id: 'calibrate', label: '🔄 Calibrate' },
        { id: 'residuals', label: '📈 Residuals' }
    ];

    return (
        <div className="space-y-6">
            {/* Tab Bar */}
            <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/5 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 py-2.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── ML MODEL TAB ─── */}
            {activeTab === 'ml' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>🧠</span> ML Revenue Predictor
                            </CardTitle>
                            <CardDescription>
                                Trained on {mlReport?.trainingReport?.samples || 500} synthetic samples using {mlReport?.trainingReport?.algorithm || 'Multiple Linear Regression'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isTraining ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                    <p className="text-sm text-zinc-400">Training model & running 5-fold CV...</p>
                                </div>
                            ) : mlReport ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        <MetricBadge label="Test Accuracy" value={`${mlReport.metrics.test.accuracy}%`} color={mlReport.metrics.test.accuracy > 90 ? 'emerald' : mlReport.metrics.test.accuracy > 80 ? 'amber' : 'red'} />
                                        <MetricBadge label="R² Score" value={mlReport.metrics.test.r2} color="cyan" />
                                        <MetricBadge label="RMSE" value={`E£${mlReport.metrics.test.rmse.toLocaleString()}`} color="indigo" />
                                        <MetricBadge label="MAPE" value={`${mlReport.metrics.test.mape}%`} color="amber" />
                                    </div>

                                    {/* Cross-Validation Results */}
                                    {mlReport.crossValidation && (
                                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5 mb-4">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">5-Fold Cross Validation</p>
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold font-mono text-indigo-400">{mlReport.crossValidation.meanR2}</div>
                                                    <div className="text-[10px] text-zinc-500">Mean R² (±{mlReport.crossValidation.stdR2})</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold font-mono text-emerald-400">{mlReport.crossValidation.meanAccuracy}%</div>
                                                    <div className="text-[10px] text-zinc-500">Mean Acc (±{mlReport.crossValidation.stdAccuracy})</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold font-mono text-amber-400">{mlReport.crossValidation.meanMAPE}%</div>
                                                    <div className="text-[10px] text-zinc-500">Mean MAPE (±{mlReport.crossValidation.stdMAPE})</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {mlReport.crossValidation.folds.map(fold => (
                                                    <div key={fold.fold} className="flex items-center gap-2 text-[10px]">
                                                        <span className="text-zinc-500 w-12">Fold {fold.fold}</span>
                                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all" style={{ width: `${fold.accuracy}%` }}></div>
                                                        </div>
                                                        <span className="text-zinc-400 font-mono w-14 text-right">{fold.accuracy}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Train Set ({mlReport.metrics.trainSize} samples)</p>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">Accuracy</span>
                                                <span className="text-emerald-400 font-mono">{mlReport.metrics.train.accuracy}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span className="text-zinc-400">MAE</span>
                                                <span className="text-zinc-300 font-mono">${mlReport.metrics.train.mae.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Test Set ({mlReport.metrics.testSize} samples)</p>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-400">Accuracy</span>
                                                <span className="text-emerald-400 font-mono">{mlReport.metrics.test.accuracy}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                                <span className="text-zinc-400">MAE</span>
                                                <span className="text-zinc-300 font-mono">${mlReport.metrics.test.mae.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Feature Importance (Weights)</p>
                                        <div className="space-y-1">
                                            {mlReport.model.featureNames.map((f, i) => {
                                                const w = Math.abs(mlReport.model.weights[i]);
                                                const maxW = Math.max(...mlReport.model.weights.map(Math.abs));
                                                const pct = (w / maxW) * 100;
                                                return (
                                                    <div key={f} className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-400 w-32 truncate">{f}</span>
                                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-mono w-12 text-right">{mlReport.model.weights[i].toFixed(1)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4" onClick={trainModel}>
                                        🔄 Retrain Model
                                    </Button>
                                </>
                            ) : (
                                <Button className="w-full" onClick={trainModel}>
                                    Train ML Model
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── MONTE CARLO TAB ─── */}
            {activeTab === 'montecarlo' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle>🎲 Monte Carlo Simulation</CardTitle>
                            <CardDescription>1,000 randomized scenarios to quantify uncertainty</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!monteCarloData ? (
                                <Button className="w-full" onClick={runMonteCarlo}>
                                    Run 1,000 Simulations
                                </Button>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        <MetricBadge label="Profit Probability" value={`${monteCarloData.probabilityOfProfit}%`} color={monteCarloData.probabilityOfProfit > 80 ? 'emerald' : 'amber'} />
                                        <MetricBadge label="Break-Even ≤12mo" value={`${monteCarloData.breakEven.probWithin12}%`} color="cyan" />
                                        <MetricBadge label="Revenue (Median)" value={`E£${monteCarloData.revenue.median.toLocaleString()}`} color="indigo" />
                                        <MetricBadge label="ROI (Median)" value={`${monteCarloData.roi.median}%`} color="amber" />
                                    </div>

                                    {/* Revenue Probability Cone */}
                                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-4">
                                        <p className="text-xs text-zinc-400 mb-3 font-medium">Revenue Probability Cone (24 months)</p>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={monteCarloData.forecastCones}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip
                                                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                                                    labelFormatter={v => `Month ${v}`}
                                                    formatter={(v) => [`E£${Math.round(v).toLocaleString()}`, '']}
                                                />
                                                <Area type="monotone" dataKey="revenue.p95" stackId="none" stroke="none" fill="rgba(99,102,241,0.08)" name="95th %ile" />
                                                <Area type="monotone" dataKey="revenue.p75" stackId="none" stroke="none" fill="rgba(99,102,241,0.12)" name="75th %ile" />
                                                <Area type="monotone" dataKey="revenue.p25" stackId="none" stroke="none" fill="rgba(99,102,241,0.08)" name="25th %ile" />
                                                <Area type="monotone" dataKey="revenue.p5" stackId="none" stroke="none" fill="rgba(99,102,241,0.04)" name="5th %ile" />
                                                <Line type="monotone" dataKey="revenue.p50" stroke="#6366f1" strokeWidth={2} dot={false} name="Median" />
                                                <Line type="monotone" dataKey="revenue.mean" stroke="#a855f7" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Mean" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Distribution Table */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Revenue Distribution</p>
                                            {['p5', 'p25', 'median', 'p75', 'p95'].map(k => (
                                                <div key={k} className="flex justify-between text-xs py-0.5">
                                                    <span className="text-zinc-400">{k.toUpperCase()}</span>
                                                    <span className="text-white font-mono">${monteCarloData.revenue[k].toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Break-Even Probability</p>
                                            <div className="flex justify-between text-xs py-0.5">
                                                <span className="text-zinc-400">Within 12 months</span>
                                                <span className="text-emerald-400 font-mono">{monteCarloData.breakEven.probWithin12}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs py-0.5">
                                                <span className="text-zinc-400">Within 18 months</span>
                                                <span className="text-cyan-400 font-mono">{monteCarloData.breakEven.probWithin18}%</span>
                                            </div>
                                            <div className="flex justify-between text-xs py-0.5">
                                                <span className="text-zinc-400">Never (24mo)</span>
                                                <span className="text-red-400 font-mono">{monteCarloData.breakEven.probNever}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4" onClick={runMonteCarlo}>🔄 Resimulate</Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── DATA INGESTION TAB ─── */}
            {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Sample Data Loader */}
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle>📦 Sample Dataset</CardTitle>
                            <CardDescription>Load a 12-month sample dataset for demonstration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={loadSampleData}>
                                    📦 Load Sample Data ({businessConfig?.businessType || 'café'})
                                </Button>
                                {actuals.length > 0 && (
                                    <Button className="opacity-60 hover:opacity-100" onClick={() => setActuals([])}>
                                        🗑️ Clear
                                    </Button>
                                )}
                            </div>
                            {actuals.length > 0 && (
                                <p className="text-xs text-emerald-400 mt-2">✓ {actuals.length} months loaded — go to Backtest or Calibrate tab</p>
                            )}
                        </CardContent>
                    </Card>

                    <DataIngestionPanel
                        actuals={actuals}
                        onUpload={handleDataUpload}
                        onClear={() => setActuals([])}
                    />
                </motion.div>
            )}

            {/* ─── BACKTEST TAB ─── */}
            {activeTab === 'backtest' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle>📊 Backtest: Twin vs Reality</CardTitle>
                            <CardDescription>Compare your twin's predictions against actual business data</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {actuals.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-500 text-sm mb-3">No actual data uploaded yet</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button onClick={() => setActiveTab('data')}>📥 Upload Data</Button>
                                        <Button onClick={() => { loadSampleData(); }}>📦 Load Sample</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button className="w-full mb-4" onClick={runBacktest}>
                                        Run Backtest ({actuals.length} months)
                                    </Button>

                                    {backtestReport && backtestReport.status === 'complete' && (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                                <MetricBadge label="Accuracy" value={`${backtestReport.metrics.accuracy}%`} color={backtestReport.metrics.accuracy > 90 ? 'emerald' : 'amber'} />
                                                <MetricBadge label="RMSE" value={`E£${backtestReport.metrics.rmse.toLocaleString()}`} color="indigo" />
                                                <MetricBadge label="MAPE" value={`${backtestReport.metrics.mape}%`} color="amber" />
                                                <MetricBadge label="Fidelity" value={`${backtestReport.fidelityScore.score}/100`} color={backtestReport.fidelityScore.color === 'emerald' ? 'emerald' : 'amber'} />
                                            </div>

                                            {/* Twin vs Reality Chart */}
                                            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-4">
                                                <p className="text-xs text-zinc-400 mb-3 font-medium">Predicted vs Actual Revenue</p>
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <ComposedChart data={backtestReport.comparisons}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                        <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => MONTHS[v - 1] || v} />
                                                        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                                        <Bar dataKey="actualRevenue" fill="rgba(16,185,129,0.4)" name="Actual" radius={[4, 4, 0, 0]} />
                                                        <Line type="monotone" dataKey="predictedRevenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Predicted" />
                                                        <Legend />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Anomaly Detection */}
                                            {anomalyData && anomalyData.status === 'complete' && (
                                                <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5 mb-4">
                                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                                                        Anomaly Detection (Z-Score, threshold = {anomalyData.threshold}σ)
                                                    </p>
                                                    <div className="flex gap-3 mb-2">
                                                        <span className="text-xs text-zinc-400">Mean: <span className="text-white font-mono">${anomalyData.mean.toLocaleString()}</span></span>
                                                        <span className="text-xs text-zinc-400">Std: <span className="text-white font-mono">${anomalyData.std.toLocaleString()}</span></span>
                                                        <span className="text-xs text-zinc-400">Anomalies: <span className={`font-mono ${anomalyData.anomalies.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{anomalyData.anomalies.length}</span></span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {anomalyData.allPoints.map(pt => (
                                                            <div key={pt.month} className={`flex items-center gap-2 text-[10px] ${pt.isAnomaly ? 'text-amber-400' : 'text-zinc-500'}`}>
                                                                <span className="w-6">{MONTHS[pt.month - 1]}</span>
                                                                <span className="font-mono w-16">${pt.revenue.toLocaleString()}</span>
                                                                <span className="font-mono w-12">Z={pt.zScore}</span>
                                                                <span>{pt.isAnomaly ? '⚠️ ' + pt.reason : '✓'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fidelity Score */}
                                            <div className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-4 border border-white/5">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-lg font-bold text-indigo-400">
                                                    {backtestReport.fidelityScore.score}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium">Twin Fidelity: {backtestReport.fidelityScore.label}</p>
                                                    <p className="text-xs text-zinc-500">Based on {backtestReport.dataPoints} months of actual data</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── CALIBRATION TAB ─── */}
            {activeTab === 'calibrate' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle>🔄 Auto-Calibration (Feedback Loop)</CardTitle>
                            <CardDescription>Automatically adjust twin parameters to match reality</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {actuals.length < 3 ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-500 text-sm mb-3">Need at least 3 months of data</p>
                                    <div className="flex gap-2 justify-center">
                                        <Button onClick={() => setActiveTab('data')}>📥 Upload ({actuals.length}/3)</Button>
                                        <Button onClick={() => { loadSampleData(); }}>📦 Load Sample</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Button className="w-full mb-4" onClick={runCalibration}>
                                        🔄 Run Auto-Calibration
                                    </Button>

                                    {calibrationResult && calibrationResult.status === 'calibrated' && (
                                        <>
                                            {/* Drift Alert */}
                                            <div className={`rounded-xl p-4 border mb-4 ${calibrationResult.drift.level === 'critical' ? 'bg-red-500/10 border-red-500/20' : calibrationResult.drift.level === 'high' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm">{calibrationResult.drift.level === 'low' ? '✅' : '⚠️'}</span>
                                                    <span className="text-sm font-medium text-white">
                                                        Drift: {calibrationResult.drift.percentage}% ({calibrationResult.drift.direction})
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 ml-6">
                                                    Level: {calibrationResult.drift.level} | Confidence: {calibrationResult.confidence}%
                                                </p>
                                            </div>

                                            {/* Adjustments */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <MetricBadge label="Ticket Adjustment" value={`${((calibrationResult.adjustments.ticketAdjustment - 1) * 100).toFixed(1)}%`} color={Math.abs(calibrationResult.adjustments.ticketAdjustment - 1) < 0.1 ? 'emerald' : 'amber'} />
                                                <MetricBadge label="Volume Adjustment" value={`${((calibrationResult.adjustments.volumeAdjustment - 1) * 100).toFixed(1)}%`} color={Math.abs(calibrationResult.adjustments.volumeAdjustment - 1) < 0.1 ? 'emerald' : 'amber'} />
                                            </div>

                                            {/* Before / After */}
                                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Calibrated Parameters</p>
                                                <div className="space-y-1">
                                                    {[
                                                        ['Avg Ticket', calibrationResult.originalConfig.avgTicket, calibrationResult.calibratedConfig.avgTicket, 'E£'],
                                                        ['Daily Customers', calibrationResult.originalConfig.dailyCustomers, calibrationResult.calibratedConfig.dailyCustomers, '']
                                                    ].map(([label, before, after, prefix]) => (
                                                        <div key={label} className="flex items-center justify-between text-xs">
                                                            <span className="text-zinc-400">{label}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-zinc-500 font-mono">{prefix}{before}</span>
                                                                <span className="text-indigo-400">→</span>
                                                                <span className="text-emerald-400 font-mono font-bold">{prefix}{after}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ─── RESIDUALS TAB ─── */}
            {activeTab === 'residuals' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <Card className="border border-white/5" animate>
                        <CardHeader>
                            <CardTitle>📈 Residual Analysis</CardTitle>
                            <CardDescription>Diagnostic plots for model validation and assumption checking</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!residualData ? (
                                <div className="text-center py-8">
                                    <p className="text-zinc-500 text-sm mb-2">Train the ML model first</p>
                                    <Button onClick={() => setActiveTab('ml')}>🧠 Go to ML Tab</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        <MetricBadge label="Mean Residual" value={`E£${residualData.meanResidual.toLocaleString()}`} color={Math.abs(residualData.meanResidual) < 500 ? 'emerald' : 'amber'} />
                                        <MetricBadge label="Std Residual" value={`E£${residualData.stdResidual.toLocaleString()}`} color="indigo" />
                                        <MetricBadge label="Durbin-Watson" value={residualData.durbinWatson} color="cyan" />
                                        <MetricBadge label="Normality" value={residualData.normality === 'Approximately normal' ? '✓ Normal' : '✗ Non-normal'} color={residualData.normality === 'Approximately normal' ? 'emerald' : 'red'} />
                                    </div>

                                    {/* Residual Scatter Plot */}
                                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-4">
                                        <p className="text-xs text-zinc-400 mb-3 font-medium">Predicted vs Residual (should be random scatter around 0)</p>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <ScatterChart>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="predicted" name="Predicted" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                                <YAxis dataKey="residual" name="Residual" tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={(v) => [`E£${Math.round(v).toLocaleString()}`, '']} />
                                                <ReferenceLine y={0} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={1} />
                                                <Scatter data={residualData.scatterData} fill="rgba(99,102,241,0.5)" />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Residual Distribution Histogram */}
                                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5 mb-4">
                                        <p className="text-xs text-zinc-400 mb-3 font-medium">Residual Distribution (should be bell-shaped)</p>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={residualData.distribution}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="midpoint" tick={{ fill: '#71717a', fontSize: 9 }} tickFormatter={v => `E£${(v / 1000).toFixed(0)}k`} />
                                                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                                <Bar dataKey="count" fill="rgba(139,92,246,0.4)" name="Frequency" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Durbin-Watson interpretation */}
                                    <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Autocorrelation Test</p>
                                        <p className="text-xs text-zinc-400">
                                            Durbin-Watson statistic: <span className="text-white font-mono">{residualData.durbinWatson}</span>
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            Result: <span className={`font-medium ${residualData.durbinWatsonInterpretation.includes('No significant') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {residualData.durbinWatsonInterpretation}
                                            </span>
                                        </p>
                                        <p className="text-[10px] text-zinc-600 mt-2">
                                            DW ≈ 2.0 means no autocorrelation. DW &lt; 1.5 indicates positive autocorrelation. DW &gt; 2.5 indicates negative autocorrelation.
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
