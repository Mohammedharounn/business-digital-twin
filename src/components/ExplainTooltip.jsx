import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

/**
 * "Explain this number" — a small ? icon that opens a plain-English popover
 * explaining what a metric means and how it is calculated. Pure client-side,
 * no API call, so it works instantly and offline.
 */
export default function ExplainTooltip({ title, what, how, tip, className = '' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onEsc);
        return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onEsc); };
    }, [open]);

    return (
        <span className={`relative inline-flex ${className}`} ref={ref}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className="text-zinc-600 hover:text-brand-primary transition-colors"
                title="Explain this"
                aria-label={`Explain ${title}`}
            >
                <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute z-[200] left-1/2 -translate-x-1/2 top-6 w-72 p-4 rounded-2xl bg-[#0a0c15] border border-white/10 shadow-2xl text-left"
                    >
                        <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">{title}</div>
                        {what && <p className="text-xs text-zinc-300 leading-relaxed mb-2">{what}</p>}
                        {how && (
                            <div className="mb-2">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">How it's calculated</div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">{how}</p>
                            </div>
                        )}
                        {tip && (
                            <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                                <span className="text-sm">💡</span>
                                <p className="text-[11px] text-emerald-400/90 leading-relaxed">{tip}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}
