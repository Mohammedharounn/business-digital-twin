import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/i18n'

const PAGE_METADATA = {
    dashboard: { title: 'Terminal / Overview', key: 'SYS-SR-01' },
    scenarios: { title: 'Terminal / Scenario Forge', key: 'SYS-SF-02' },
    reports: { title: 'Archive / Report Engine', key: 'SYS-RE-01' },
    visualizer: { title: 'Laboratory / 3D Spatial', key: 'SYS-3D-01' },
    location: { title: 'Laboratory / Territory', key: 'SYS-LI-01' },
    optimization: { title: 'Intelligence / Optimizer', key: 'SYS-OP-01' },
};

export default function TopBar({ currentPage, onToggleSidebar, onToggleChat, businessConfig, onNewProject }) {
    const meta = PAGE_METADATA[currentPage] || { title: 'Terminal / Active Link', key: 'SYS-GEN-01' };
    const { theme, toggleTheme, language, toggleLanguage } = useAppStore();
    const { t } = useT();

    return (
        <div className="h-20 glass-panel !rounded-none !border-x-0 !border-t-0 border-white/5 px-4 md:px-10 gap-3 flex items-center justify-between sticky top-0 z-[60] bg-black/40 backdrop-blur-3xl">
            <div className="flex items-center gap-10">
                <button className="text-zinc-500 hover:text-white transition-all active:scale-90" onClick={onToggleSidebar}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                </button>

                <div className="h-6 w-px bg-white/5 hidden md:block"></div>

                <div className="hidden lg:flex items-center gap-10">
                    <div>
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">{meta.key}</div>
                        <h1 className="text-xs font-display font-bold text-white uppercase tracking-widest">{meta.title}</h1>
                    </div>
                    {businessConfig?.location && (
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Location Hub</div>
                            <div className="text-[11px] font-bold text-zinc-300 tracking-tight">{businessConfig.location}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2">
                    <div className="flex flex-col items-end">
                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Simulation Sync</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Live Connection Est.</div>
                    </div>
                    <div className="h-8 w-px bg-white/5"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                </div>

                {/* Language toggle — never auto-translate this control */}
                <button
                    data-no-translate
                    onClick={toggleLanguage}
                    title="Switch language"
                    className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-3 py-2.5 text-[9px] font-black"
                >
                    {language === 'en' ? 'ع' : 'EN'}
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title="Toggle light / dark"
                    className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-3 py-2.5 text-sm"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {onNewProject && (
                    <button
                        className="btn btn-secondary !bg-white/[0.03] !border-white/8 px-4 py-2.5 text-[9px] flex items-center gap-2 group"
                        onClick={onNewProject}
                        title="Start a new project from scratch"
                    >
                        <span className="text-sm">✨</span>
                        <span className="font-black hidden lg:block">{t('common.newProject')}</span>
                    </button>
                )}
                <button
                    className="btn btn-secondary !bg-indigo-600/10 !border-indigo-500/20 px-6 py-2.5 text-[9px] flex items-center gap-3 group"
                    onClick={onToggleChat}
                >
                    <span className="text-sm group-hover:scale-125 transition-transform">🤖</span>
                    <span className="font-black">{t('common.commandAstra')}</span>
                </button>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-white to-zinc-200 flex items-center justify-center text-[10px] font-black text-black cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all shadow-xl">
                    S
                </div>
            </div>
        </div>
    );
}
