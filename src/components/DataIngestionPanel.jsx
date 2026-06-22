import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './elements/Card';
import { Button } from './elements/Button';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DataIngestionPanel({ actuals, onUpload, onClear }) {
    const [mode, setMode] = useState('manual'); // 'manual' | 'csv'
    const [manualMonth, setManualMonth] = useState(1);
    const [manualRevenue, setManualRevenue] = useState('');
    const [manualCosts, setManualCosts] = useState('');
    const [manualCustomers, setManualCustomers] = useState('');
    const [csvData, setCsvData] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleManualSubmit = () => {
        if (!manualRevenue) return;
        onUpload([{
            month: manualMonth,
            revenue: parseFloat(manualRevenue),
            costs: parseFloat(manualCosts) || 0,
            customers: parseInt(manualCustomers) || 0
        }]);
        setManualRevenue('');
        setManualCosts('');
        setManualCustomers('');
    };

    const handleCSVFile = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.trim().split('\n');
            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

            const records = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((h, idx) => { row[h] = values[idx]; });

                const monthNum = parseInt(row.month) || (i);
                records.push({
                    month: monthNum,
                    revenue: parseFloat(row.revenue) || 0,
                    costs: parseFloat(row.costs || row.expenses) || 0,
                    customers: parseInt(row.customers || row.volume) || 0,
                    notes: row.notes || ''
                });
            }

            setCsvPreview(records.slice(0, 5));
            setCsvData(records);
        };
        reader.readAsText(file);
    }, []);

    const handleCSVUpload = async () => {
        if (!csvData) return;
        setUploading(true);
        await onUpload(csvData);
        setUploading(false);
        setCsvData(null);
        setCsvPreview([]);
    };

    return (
        <Card className="border border-white/5" animate>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">📥</span> Real Data Ingestion
                </CardTitle>
                <CardDescription>Upload actual business data to calibrate your digital twin</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'}`}
                        onClick={() => setMode('manual')}
                    >
                        Manual Entry
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'csv' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10'}`}
                        onClick={() => setMode('csv')}
                    >
                        CSV Upload
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'manual' ? (
                        <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Month</label>
                                    <select
                                        value={manualMonth}
                                        onChange={e => setManualMonth(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Revenue ($)</label>
                                    <input
                                        type="number"
                                        value={manualRevenue}
                                        onChange={e => setManualRevenue(e.target.value)}
                                        placeholder="e.g. 24500"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Costs ($)</label>
                                    <input
                                        type="number"
                                        value={manualCosts}
                                        onChange={e => setManualCosts(e.target.value)}
                                        placeholder="e.g. 18000"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Customers</label>
                                    <input
                                        type="number"
                                        value={manualCustomers}
                                        onChange={e => setManualCustomers(e.target.value)}
                                        placeholder="e.g. 2800"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleManualSubmit} disabled={!manualRevenue}>
                                Add Month Data
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div key="csv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center mb-4 hover:border-indigo-500/30 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVFile}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                    <div className="text-3xl mb-2">📄</div>
                                    <p className="text-sm text-zinc-400">Click to upload CSV file</p>
                                    <p className="text-xs text-zinc-600 mt-1">Format: month, revenue, costs, customers</p>
                                </label>
                            </div>

                            {csvPreview.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-zinc-500 mb-2">Preview ({csvData.length} rows):</p>
                                    <div className="bg-white/5 rounded-lg overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-3 py-2 text-left text-zinc-400">Month</th>
                                                    <th className="px-3 py-2 text-right text-zinc-400">Revenue</th>
                                                    <th className="px-3 py-2 text-right text-zinc-400">Costs</th>
                                                    <th className="px-3 py-2 text-right text-zinc-400">Customers</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvPreview.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/5">
                                                        <td className="px-3 py-1.5 text-white">{MONTHS[row.month - 1] || row.month}</td>
                                                        <td className="px-3 py-1.5 text-right text-emerald-400">${row.revenue.toLocaleString()}</td>
                                                        <td className="px-3 py-1.5 text-right text-red-400">${row.costs.toLocaleString()}</td>
                                                        <td className="px-3 py-1.5 text-right text-zinc-300">{row.customers}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button className="w-full mt-3" onClick={handleCSVUpload} disabled={uploading}>
                                        {uploading ? 'Uploading...' : `Upload ${csvData.length} Records`}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Existing Data Summary */}
                {actuals && actuals.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-500">{actuals.length} months of data uploaded</span>
                            <button onClick={onClear} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Clear All</button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {actuals.map((a, i) => (
                                <div key={i} className="w-6 h-6 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-400 font-mono">
                                    {a.month}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
