import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { icon: '👋', title: 'Welcome to your Business Digital Twin', body: 'This is a virtual simulation of your business. Configure it, forecast it, and stress-test it before spending real money.' },
    { icon: '📊', title: 'Overview & Dashboard', body: 'Your Overview shows revenue, profit, break-even and risk. Quick-action buttons there let you export to Excel or print an investor one-pager.' },
    { icon: '🧰', title: 'Decision Tools', body: 'Cash runway, a live-rate loan calculator, Egypt VAT, and a "what matters most" chart — all in the Decision Tools page.' },
    { icon: '📊', title: 'Market Benchmarks', body: 'Compare your plan to the market: live nearby competitor counts (OpenStreetMap), Egypt’s real lending rate (World Bank), and reference ranges.' },
    { icon: '🏛️', title: 'Marketplace', body: 'Search real eBay equipment with live prices in E£, and add items straight into your startup costs.' },
    { icon: '🌍', title: 'Language & Theme', body: 'Top-right: switch the whole app to Arabic (ع) or toggle light/dark mode. Your choices are remembered.' },
];

export default function GuidedTour({ open, onClose }) {
    const [i, setI] = useState(0);
    useEffect(() => { if (open) setI(0); }, [open]);
    if (!open) return null;
    const step = STEPS[i];
    const last = i === STEPS.length - 1;

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={onClose}>
                <motion.div initial={{ scale: 0.95, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md bg-[#0a0c15] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="text-5xl mb-5">{step.icon}</div>
                    <h2 className="text-xl font-display font-bold text-white mb-3">{step.title}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">{step.body}</p>

                    <div className="flex items-center justify-center gap-1.5 mb-6">
                        {STEPS.map((_, k) => (
                            <div key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-brand-primary' : 'w-1.5 bg-white/15'}`} />
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button onClick={onClose} className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest">Skip</button>
                        <div className="flex gap-2">
                            {i > 0 && (
                                <button onClick={() => setI(i - 1)} className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-5 py-2.5 text-[10px]">Back</button>
                            )}
                            <button onClick={() => (last ? onClose() : setI(i + 1))} className="btn btn-primary px-6 py-2.5 text-[10px]">
                                {last ? 'Get started' : 'Next'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
