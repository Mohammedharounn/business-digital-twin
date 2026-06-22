import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BenchmarksEngine } from '../engine/BenchmarksEngine';
import { formatCurrency } from '../engine/SimulationEngine';
import { Card } from '../components/elements/Card';
import ExplainTooltip from '../components/ExplainTooltip';
import api from '../lib/api';

const bandStyle = {
    below: { label: 'Below market', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    typical: { label: 'On market', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    above: { label: 'Above market', cls: 'text-brand-rose bg-brand-rose/10 border-brand-rose/20' },
};

const LiveBadge = () => (
    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
    </span>
);
const CuratedBadge = () => (
    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/10">Curated estimate</span>
);

export default function BenchmarksPage({ businessConfig }) {
    const analysis = useMemo(() => (businessConfig ? BenchmarksEngine.analyze(businessConfig) : null), [businessConfig]);
    const [loan, setLoan] = useState(null);
    const [comp, setComp] = useState({ loading: true, data: null });

    useEffect(() => {
        api.get('/market/loan-rate').then(r => setLoan(r.data)).catch(() => setLoan(null));
    }, []);

    useEffect(() => {
        if (!businessConfig?.location) { setComp({ loading: false, data: null }); return; }
        setComp({ loading: true, data: null });
        api.get('/market/competitors', { params: { location: businessConfig.location, type: businessConfig.businessType || 'cafe', radius: 2 } })
            .then(r => setComp({ loading: false, data: r.data?.success ? r.data : null }))
            .catch(() => setComp({ loading: false, data: null }));
    }, [businessConfig?.location, businessConfig?.businessType]);

    if (!analysis) {
        return (
            <div className="max-w-[1600px] mx-auto animate-fade-in">
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md w-full p-12 text-center">
                        <div className="text-4xl mb-6">📊</div>
                        <h2 className="text-xl font-display font-bold text-white mb-3">No Business Twin Yet</h2>
                        <p className="text-zinc-500 text-sm">Create a business configuration to compare it against market benchmarks.</p>
                    </Card>
                </div>
            </div>
        );
    }

    // Live loan rate (real) drives the financing estimate when available
    const liveRate = loan?.rate ?? BenchmarksEngine.SME_LOAN_RATES.typical;
    const subsidizedRate = 8;
    const startup = analysis.startupEstimate;
    const financingTypical = Math.round(startup * (liveRate / 100));
    const financingSubsidized = Math.round(startup * (subsidizedRate / 100));

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📊</span>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Market Benchmarks</h1>
                </div>
                <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">{analysis.verticalLabel} · Egypt SME Market</p>
            </div>

            {/* Live competitors + live loan rate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Nearby Competitors</h3>
                        <LiveBadge />
                        <ExplainTooltip title="Nearby Competitors (Live)" what="The real number of similar businesses near your location, counted live from OpenStreetMap." how="We geocode your location, then count matching venues within a 2 km radius." tip="More competitors = more demand validation, but also more rivalry." />
                    </div>
                    {comp.loading ? (
                        <div className="text-zinc-600 text-sm py-6">Scanning the map around “{businessConfig.location}”…</div>
                    ) : comp.data ? (
                        <>
                            <div className="text-5xl font-display font-black text-white mb-1">{comp.data.count}</div>
                            <div className="text-sm text-zinc-400 mb-4">{analysis.verticalLabel.toLowerCase()}s within {comp.data.radiusKm} km of <span className="text-white">{businessConfig.location}</span></div>
                            <div className="text-[10px] text-zinc-600">Source: {comp.data.source} · live</div>
                        </>
                    ) : (
                        <div className="text-zinc-600 text-sm py-6">Couldn't fetch live competitor data for “{businessConfig.location || '—'}”. Try a clearer city name (e.g. “Cairo”).</div>
                    )}
                </Card>

                <Card className="p-8">
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">SME Financing</h3>
                        {loan ? <LiveBadge /> : <CuratedBadge />}
                        <ExplainTooltip title="Financing Cost" what="Estimated first-year interest if your startup capital were financed by a loan." how="Startup capital × annual lending rate. The typical rate is Egypt's real lending interest rate." tip="Egypt's Central Bank has run subsidized SME programmes at lower rates — check eligibility." />
                    </div>
                    <div className="mb-4">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Estimated Startup Capital</div>
                        <div className="text-2xl font-display font-black text-white">{formatCurrency(startup)}</div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-xs text-zinc-400">Typical SME loan ({liveRate}%{loan ? `, ${loan.year}` : ''})</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{formatCurrency(financingTypical)}<span className="text-[10px] text-zinc-600"> / yr</span></span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-xs text-zinc-400">Subsidized programme (≈{subsidizedRate}%)</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(financingSubsidized)}<span className="text-[10px] text-zinc-600"> / yr</span></span>
                        </div>
                        {loan && <div className="text-[10px] text-zinc-600 pt-1">Rate source: {loan.source}</div>}
                    </div>
                </Card>
            </div>

            {/* Curated benchmark comparison */}
            <Card className="p-8 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Your Twin vs. Reference Ranges</h3>
                    <CuratedBadge />
                    <ExplainTooltip title="Reference Ranges" what="Compares your configuration against typical ranges for this business type." how="Curated reference ranges (not a live feed); your value is placed against low / typical / high, adjusted for your city." tip="Use these as a sanity check, not exact market quotes." />
                </div>
                <div className="space-y-4">
                    {analysis.rows.map((r, i) => {
                        const b = bandStyle[r.band];
                        return (
                            <motion.div key={r.metric} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <div className="sm:w-56 text-sm font-bold text-white">{r.metric}</div>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="text-2xl font-display font-black text-white tabular-nums">{r.user.toLocaleString()}</div>
                                    <div className="text-[11px] text-zinc-500">market: {r.low.toLocaleString()} – {r.high.toLocaleString()} <span className="text-zinc-600">(typ. {r.typ.toLocaleString()})</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[11px] font-mono ${r.deltaPct > 0 ? 'text-brand-rose' : r.deltaPct < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{r.deltaPct > 0 ? '+' : ''}{r.deltaPct}% vs typ.</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${b.cls}`}>{b.label}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Card>

            {/* Curated comparables */}
            <Card className="p-8 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Example Comparable Businesses</h3>
                    <CuratedBadge />
                    <ExplainTooltip title="Comparable Businesses" what="Illustrative example businesses of the same type, to sanity-check revenue and cost scale." how="These are curated example figures, NOT real named companies." tip="For real nearby counts, see the live ‘Nearby Competitors’ card above." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.comparables.map((c, i) => (
                        <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white">{c.name}</span>
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{c.margin}%</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div><div className="text-sm font-mono font-bold text-white">{formatCurrency(c.revenue)}</div><div className="text-[8px] text-zinc-600 uppercase tracking-widest">Rev/mo</div></div>
                                <div><div className="text-sm font-mono font-bold text-white">{c.staff}</div><div className="text-[8px] text-zinc-600 uppercase tracking-widest">Staff</div></div>
                                <div><div className="text-sm font-mono font-bold text-white">{formatCurrency(c.rent)}</div><div className="text-[8px] text-zinc-600 uppercase tracking-widest">Rent/mo</div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Data sources / honesty panel */}
            <Card className="p-8">
                <div className="flex items-center gap-2 mb-5">
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Where these numbers come from</h3>
                    <span className="text-lg">🔎</span>
                </div>
                <div className="space-y-3 text-xs">
                    {[
                        ['Currency (USD→E£)', 'Live', 'exchangerate-api.com', true],
                        ['SME loan / interest rate', loan ? 'Live' : 'Estimate', loan ? 'World Bank (Egypt lending rate)' : 'fallback estimate', !!loan],
                        ['Nearby competitor count', comp.data ? 'Live' : 'Unavailable', 'OpenStreetMap', !!comp.data],
                        ['Rent / staff / ticket ranges', 'Curated', 'Indicative reference data (not a live feed)', false],
                        ['Example comparable businesses', 'Curated', 'Illustrative examples, not real companies', false],
                    ].map(([label, kind, src, live]) => (
                        <div key={label} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-zinc-300">{label}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-zinc-600">{src}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${live ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-white/5 text-zinc-500 border-white/10'}`}>{kind}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
