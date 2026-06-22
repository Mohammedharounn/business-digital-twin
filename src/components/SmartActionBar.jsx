import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportExcel, openInvestorOnePager } from '../lib/exporters';
import { BenchmarksEngine } from '../engine/BenchmarksEngine';

/**
 * Renders smart alert banners (#12) + quick export actions (#8, #10) above the
 * dashboard. Self-contained so it doesn't touch the dense Dashboard component.
 */
export default function SmartActionBar({ config, summary, risks }) {
    if (!config || !summary) return null;

    const alerts = [];
    const riskScore = risks?.riskScore?.score ?? risks?.riskScore;
    if (riskScore != null && riskScore >= 65) {
        alerts.push({ tone: 'danger', text: `High risk score (${riskScore}/100) — review pricing, costs and break-even.` });
    }
    const margin = parseFloat(summary.profitMargin);
    if (!isNaN(margin) && margin < 5) {
        alerts.push({ tone: 'warn', text: `Thin profit margin (${margin}%) — small cost changes could push you into a loss.` });
    }
    if (summary.monthlyProfit != null && summary.monthlyProfit < 0) {
        alerts.push({ tone: 'danger', text: `Currently loss-making (${'E£' + Math.round(summary.monthlyProfit).toLocaleString()}/mo) — check the Decision Tools runway.` });
    }
    // Above-market rent check
    try {
        const a = BenchmarksEngine.analyze(config);
        const rentRow = a.rows.find(r => r.metric.startsWith('Rent'));
        if (rentRow && rentRow.band === 'above') {
            alerts.push({ tone: 'warn', text: `Rent is ${rentRow.deltaPct}% above the typical ${a.verticalLabel} — make sure revenue justifies it.` });
        }
    } catch { /* ignore */ }

    const toneCls = {
        danger: 'bg-brand-rose/10 border-brand-rose/25 text-brand-rose',
        warn: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    };

    return (
        <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Quick Actions</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => exportExcel(config, summary)}
                        className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-4 py-2 text-[9px] flex items-center gap-2">
                        <span>📊</span> Export Excel
                    </button>
                    <button onClick={() => openInvestorOnePager(config, summary, risks)}
                        className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-4 py-2 text-[9px] flex items-center gap-2">
                        <span>📄</span> Investor One-Pager
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {alerts.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${toneCls[a.tone]}`}>
                        <span className="text-sm shrink-0">{a.tone === 'danger' ? '⚠️' : '🟡'}</span>
                        <span className="text-xs font-semibold">{a.text}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
