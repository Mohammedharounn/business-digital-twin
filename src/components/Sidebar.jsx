import React from 'react'
import { motion } from 'framer-motion'
import { BUSINESS_TYPES } from '../engine/SimulationEngine'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { useT } from '../lib/i18n'

export default function Sidebar({ currentPage, onNavigate, isOpen, businessType }) {
    const bt = BUSINESS_TYPES.find(b => b.id === businessType);
    const { user, logout } = useAuth();
    const { t } = useT();

    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Overview', section: 'Laboratory' },
        { id: 'visualizer', icon: '🏗️', label: '3D Twin', section: 'Laboratory' },
        { id: 'scenarios', icon: '🔄', label: 'Forge', section: 'Laboratory' },
        { id: 'location', icon: '📍', label: 'Territory', section: 'Laboratory' },

        { id: 'optimization', icon: '⚡', label: 'Optimizer', section: 'Intelligence' },
        { id: 'ml_analytics', icon: '🧠', label: 'ML Analytics', section: 'Intelligence' },
        { id: 'benchmarks', icon: '📊', label: 'Benchmarks', section: 'Intelligence' },
        { id: 'decision_tools', icon: '🧰', label: 'Decision Tools', section: 'Intelligence' },
        { id: 'weekly_report', icon: '📅', label: 'Weekly Sync', section: 'Intelligence' },
        { id: 'reports', icon: '📄', label: 'Full Audit', section: 'Intelligence' },

        { id: 'datasets', icon: '📦', label: 'Datasets', section: 'Intelligence' },

        { id: 'research', icon: '🔬', label: 'Research', section: 'Ecosystem' },
        { id: 'marketplace', icon: '🏛️', label: 'Marketplace', section: 'Ecosystem' },
        { id: 'gamification', icon: '🏆', label: 'Achievements', section: 'Ecosystem' },
        { id: 'collaboration', icon: '🤝', label: 'Collaboration', section: 'Ecosystem' },
    ];

    const sections = {};
    navItems.forEach(item => {
        if (!sections[item.section]) sections[item.section] = [];
        sections[item.section].push(item);
    });

    return (
        <div className={cn(
            "h-screen glass-panel !rounded-none !border-y-0 !border-l-0 border-white/5 transition-all duration-500 flex flex-col z-[70] fixed lg:sticky top-0 bg-bg-surface/95 lg:bg-bg-surface/40 backdrop-blur-3xl",
            isOpen ? "w-[280px]" : "w-0 overflow-hidden"
        )}>
            <div className="p-8 mb-4">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onNavigate('landing')}>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xs shadow-xl group-hover:rotate-12 transition-transform">DT</div>
                    <div>
                        <div className="text-sm font-display font-bold text-white tracking-widest uppercase">{t('sidebar.kernel')}</div>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{t('sidebar.activeLink')}</div>
                    </div>
                </div>
            </div>

            {bt && (
                <div className="px-6 mb-10">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.04] transition-all cursor-crosshair">
                        <div className="text-2xl group-hover:scale-110 transition-transform">{bt.icon}</div>
                        <div>
                            <div className="text-[11px] font-black text-white tracking-tight leading-4 mb-0.5">{bt.name}</div>
                            <div className="text-[9px] text-brand-primary font-bold uppercase tracking-widest">Target Entity</div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
                {Object.entries(sections).map(([section, items]) => (
                    <div key={section}>
                        <div className="px-4 mb-4 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">{t('section.' + section)}</div>
                        <div className="space-y-1">
                            {items.map(item => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                                        currentPage === item.id
                                            ? "bg-brand-primary/10 border border-brand-primary/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                            : "text-zinc-600 hover:text-white hover:bg-white/[0.02] border border-transparent"
                                    )}
                                    onClick={() => onNavigate(item.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "text-lg transition-all",
                                            currentPage === item.id ? "opacity-100" : "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                                        )}>
                                            {item.icon}
                                        </span>
                                        <span className="text-[11px] font-bold tracking-tight uppercase tracking-widest whitespace-nowrap">{t('nav.' + item.id)}</span>
                                    </div>
                                    {currentPage === item.id && (
                                        <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-brand-primary shadow-[0_0_10px_#6366f1]"></motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-6">
                {user && (
                    <div className="glass-panel p-4 !rounded-2xl border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/20 border border-white/5 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter shadow-lg">
                                {user.name[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white tracking-tight truncate">{user.name}</div>
                                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{user.role || 'Operative'}</div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-8 h-8 rounded-lg hover:bg-brand-rose/10 border border-transparent hover:border-brand-rose/20 flex items-center justify-center text-zinc-600 hover:text-brand-rose transition-all flex-shrink-0"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M9 21H5a2 2 0 01-2-2V5a2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
