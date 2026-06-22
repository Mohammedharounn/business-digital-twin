import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DecisionToolsEngine } from '../engine/DecisionToolsEngine';
import { formatCurrency } from '../engine/SimulationEngine';
import { Card } from '../components/elements/Card';
import ExplainTooltip from '../components/ExplainTooltip';
import api from '../lib/api';

export default function DecisionToolsPage({ businessConfig, financialData }) {
    const summary = financialData;
    const [loanRate, setLoanRate] = useState(15);
    const [loanAmount, setLoanAmount] = useState(0);
    const [loanMonths, setLoanMonths] = useState(36);

    useEffect(() => {
        api.get('/market/loan-rate').then(r => { if (r.data?.rate) setLoanRate(r.data.rate); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (summary?.startup?.total) setLoanAmount(Math.round(summary.startup.total));
    }, [summary]);

    const runway = useMemo(() => (summary ? DecisionToolsEngine.cashRunway(summary) : null), [summary]);
    const vat = useMemo(() => (summary ? DecisionToolsEngine.vat(summary) : null), [summary]);
    const sensitivity = useMemo(() => (businessConfig ? DecisionToolsEngine.sensitivity(businessConfig) : []), [businessConfig]);
    const loan = useMemo(() => DecisionToolsEngine.loanSchedule(loanAmount, loanRate, loanMonths), [loanAmount, loanRate, loanMonths]);

    if (!summary) {
        return (
            <div className="max-w-[1600px] mx-auto animate-fade-in">
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md w-full p-12 text-center">
                        <div className="text-4xl mb-6">🧰</div>
                        <h2 className="text-xl font-display font-bold text-white mb-3">No Simulation Data</h2>
                        <p className="text-zinc-500 text-sm">Build and run a business to use the decision tools.</p>
                    </Card>
                </div>
            </div>
        );
    }

    const maxSwing = Math.max(1, ...sensitivity.map(s => s.swing));

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🧰</span>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Decision Tools</h1>
                </div>
                <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Runway · Financing · Tax · Sensitivity</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Cash runway */}
                <Card className="p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Cash Runway</h3>
                        <ExplainTooltip title="Cash Runway" what="How many months your starting capital lasts at the current monthly result." how="Startup capital ÷ monthly loss. If you're already profitable, runway is sustainable." tip="Aim for 6–12 months of runway before you reach break-even." />
                    </div>
                    {runway.sustainable ? (
                        <>
                            <div className="text-4xl font-display font-black text-emerald-400 mb-1">Sustainable</div>
                            <p className="text-sm text-zinc-400">You're profitable monthly{runway.breakEven ? ` · break-even ~month ${runway.breakEven}` : ''}. Capital isn't being burned.</p>
                        </>
                    ) : (
                        <>
                            <div className="text-5xl font-display font-black text-white mb-1">{runway.months} <span className="text-lg text-zinc-500">months</span></div>
                            <p className="text-sm text-zinc-400 mb-3">before {formatCurrency(runway.cash)} capital runs out at {formatCurrency(runway.burn)}/mo burn.</p>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block border ${runway.months >= 6 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-rose/10 text-brand-rose border-brand-rose/20'}`}>
                                {runway.months >= 6 ? 'Healthy' : 'Tight — raise more or cut costs'}
                            </div>
                        </>
                    )}
                </Card>

                {/* VAT */}
                <Card className="p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Egypt VAT ({vat.ratePct}%)</h3>
                        <ExplainTooltip title="VAT (Value-Added Tax)" what="Egypt's standard VAT is 14%. This estimates what you'd collect and remit." how="VAT ≈ 14% of revenue. If your prices already include VAT, your real share is revenue ÷ 1.14." tip="VAT is collected from customers and paid to the tax authority — keep it aside." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="text-2xl font-display font-black text-white">{formatCurrency(vat.monthlyVat)}</div>
                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">VAT / month</div>
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="text-2xl font-display font-black text-white">{formatCurrency(vat.annualVat)}</div>
                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">VAT / year</div>
                        </div>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-4">If prices are VAT-inclusive, your net revenue is ≈ {formatCurrency(vat.netOfInclusiveVat)}/mo.</p>
                </Card>
            </div>

            {/* Loan repayment */}
            <Card className="p-8 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Loan Repayment Schedule</h3>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Live rate</span>
                    <ExplainTooltip title="Loan Repayment" what="Monthly payment and total interest for financing your startup capital." how="Standard amortization formula using Egypt's live lending rate. Adjust amount, rate and term." tip="Longer terms lower the monthly payment but increase total interest." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <label className="block">
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Loan amount (E£)</span>
                        <input type="number" value={loanAmount} onChange={e => setLoanAmount(+e.target.value)} className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-brand-primary" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Annual rate (%) · live</span>
                        <input type="number" step="0.1" value={loanRate} onChange={e => setLoanRate(+e.target.value)} className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-brand-primary" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Term (months)</span>
                        <input type="number" value={loanMonths} onChange={e => setLoanMonths(+e.target.value)} className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-brand-primary" />
                    </label>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[['Monthly Payment', loan.payment], ['Total Interest', loan.totalInterest], ['Total Repaid', loan.totalPaid]].map(([l, v]) => (
                        <div key={l} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                            <div className="text-xl font-display font-black text-white">{formatCurrency(Math.round(v))}</div>
                            <div className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{l}</div>
                        </div>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead><tr className="text-[9px] text-zinc-600 uppercase tracking-widest text-left">
                            <th className="py-2">Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th>
                        </tr></thead>
                        <tbody>
                            {loan.rows.map(r => (
                                <tr key={r.month} className="border-t border-white/5 text-zinc-300">
                                    <td className="py-2">{r.month}</td>
                                    <td>{formatCurrency(Math.round(r.payment))}</td>
                                    <td className="text-brand-rose">{formatCurrency(Math.round(r.interest))}</td>
                                    <td className="text-emerald-400">{formatCurrency(Math.round(r.principal))}</td>
                                    <td>{formatCurrency(Math.round(r.balance))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="text-[10px] text-zinc-600 mt-2">Showing first 6 of {loan.months} months.</p>
                </div>
            </Card>

            {/* Sensitivity */}
            <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">What Matters Most</h3>
                    <ExplainTooltip title="Sensitivity Analysis" what="Which decision changes your profit the most." how="Each input is moved ±10% and we measure the swing in monthly profit. Bigger bar = bigger impact." tip="Focus your attention on the top one or two levers." />
                </div>
                {sensitivity.length === 0 ? (
                    <p className="text-zinc-600 text-sm">Not enough configuration data to analyze.</p>
                ) : (
                    <div className="space-y-3">
                        {sensitivity.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-4">
                                <div className="w-36 text-sm font-bold text-white shrink-0">{s.label}</div>
                                <div className="flex-1 h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.swing / maxSwing) * 100}%` }} transition={{ delay: i * 0.05 }}
                                        className="h-full rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary" />
                                </div>
                                <div className="w-32 text-right text-[11px] font-mono text-zinc-400 shrink-0">{formatCurrency(s.swing)}/mo</div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
