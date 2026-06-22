import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GamificationEngine } from '../engine/AdvancedEngines'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { cn } from '../lib/utils'
import api from '../lib/api'

export default function GamificationPage({ financialData, riskData, businessConfig, scenarios, chatQuestions = 4, reportsGenerated = 0, optimizationRuns = 0 }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [leaderboard, setLeaderboard] = useState([]);
    const [lbLoading, setLbLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        api.get('/business/leaderboard')
            .then(res => { if (alive) setLeaderboard(res.data?.data || []); })
            .catch(() => { if (alive) setLeaderboard([]); })
            .finally(() => { if (alive) setLbLoading(false); });
        return () => { alive = false; };
    }, []);

    const userData = useMemo(() => ({
        hasTwin: !!businessConfig,
        scenarioCount: scenarios?.length || 0,
        riskScore: riskData?.riskScore?.score || 100,
        profitMargin: parseFloat(financialData?.profitMargin || 0),
        roi: financialData?.roi?.roi || 0,
        chatQuestions,
        optimizationRuns,
        fundingScore: 0,
        reportsGenerated,
        locationsCompared: 0,
        streakWeeks: 2,
        businessTypes: 1,
        breakEvenMonth: financialData?.breakEven?.month || null,
        costReduction: 0
    }), [financialData, riskData, businessConfig, scenarios, chatQuestions, reportsGenerated, optimizationRuns]);

    const earnedIds = GamificationEngine.evaluateBadges(userData);
    const totalXp = GamificationEngine.calculateXp(earnedIds);
    const level = GamificationEngine.getLevel(totalXp);
    const categories = ['All', ...new Set(GamificationEngine.BADGES.map(b => b.category))];

    const filteredBadges = selectedCategory === 'All'
        ? GamificationEngine.BADGES
        : GamificationEngine.BADGES.filter(b => b.category === selectedCategory);

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🏆</span>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Founder Path</h1>
                </div>
                <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Neural Progression Tracking & Achievement Unlocks</p>
            </div>

            {/* Level Progresion HUD */}
            <Card className="p-0 border-white/5 mb-10 overflow-hidden bg-gradient-to-br from-brand-primary/[0.05] to-zinc-900/40">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 p-10 items-center">
                    {/* Character/Icon Section */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-7xl shadow-2xl relative mb-4">
                            {level.icon}
                            <div className="absolute -bottom-2 -right-2 bg-brand-primary px-3 py-1 rounded-lg text-[10px] font-black text-white shadow-lg">Lvl {level.level}</div>
                        </div>
                        <div className="text-sm font-display font-bold text-white uppercase tracking-widest">{level.name}</div>
                    </div>

                    {/* Progress Track */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">XP Threshold</div>
                                <div className="text-2xl font-display font-black text-white">{totalXp} <span className="text-zinc-600">XP</span></div>
                            </div>
                            {level.nextLevel && (
                                <div className="text-right">
                                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Next Evolution</div>
                                    <div className="text-xs font-bold text-brand-primary uppercase tracking-widest">{level.nextLevel.name}</div>
                                </div>
                            )}
                        </div>
                        <div className="h-4 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${level.progress}%` }}
                                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">{level.xpToNext} XP required for next nodal upgrade</p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Badges', val: earnedIds.length, color: 'brand-primary' },
                            { label: 'Streak', val: '2w', color: 'brand-cyan' },
                            { label: 'Completion', val: `${Math.round((earnedIds.length / GamificationEngine.BADGES.length) * 100)}%`, color: 'brand-emerald' },
                            { label: 'Ranking', val: 'TOP 4%', color: 'brand-secondary' }
                        ].map((s, i) => (
                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center min-w-[100px]">
                                <div className={`text-xl font-display font-bold text-${s.color}`}>{s.val}</div>
                                <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Founder Leaderboard */}
            <Card className="p-8 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-display font-bold text-white uppercase tracking-tight">Founder Leaderboard</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Ranked by Founder Score · profitability + ROI + low risk</p>
                    </div>
                    <span className="text-2xl">🏅</span>
                </div>
                {lbLoading ? (
                    <div className="text-center text-zinc-600 text-sm py-6">Loading rankings…</div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center text-zinc-600 text-sm py-6">No ranked twins yet — complete a business simulation to enter the leaderboard.</div>
                ) : (
                    <div className="space-y-2">
                        {leaderboard.map((row) => (
                            <div
                                key={row.id}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-xl border transition-colors",
                                    row.isMine ? "bg-brand-primary/10 border-brand-primary/30" : "bg-white/[0.02] border-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0",
                                    row.rank === 1 ? "bg-amber-500/20 text-amber-400" :
                                    row.rank === 2 ? "bg-zinc-400/20 text-zinc-300" :
                                    row.rank === 3 ? "bg-orange-700/20 text-orange-400" : "bg-white/[0.03] text-zinc-500"
                                )}>
                                    {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : row.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">
                                        {row.name}{row.isMine && <span className="text-[9px] text-brand-primary ml-2 uppercase tracking-widest">You</span>}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 capitalize">{row.owner} · {row.businessType} · {row.location}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-lg font-display font-black text-white tabular-nums">{row.score}</div>
                                    <div className="text-[8px] text-zinc-700 uppercase tracking-widest">Founder Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Filter Hub */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white/[0.02] border border-white/5 p-2 rounded-2xl w-fit">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest",
                            selectedCategory === cat ? "bg-brand-primary text-white shadow-lg" : "text-zinc-600 hover:text-white"
                        )}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBadges.map(badge => {
                    const earned = earnedIds.includes(badge.id);
                    return (
                        <Card
                            key={badge.id}
                            className={cn(
                                "p-8 transition-all duration-500",
                                !earned && "grayscale opacity-40 border-dashed"
                            )}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={cn(
                                    "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-2xl relative",
                                    earned ? "bg-brand-primary/10 border border-brand-primary/20" : "bg-white/[0.02] border border-white/5"
                                )}>
                                    {earned ? badge.icon : '🔒'}
                                    {earned && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center border-4 border-bg-surface-high">
                                            <span className="text-[10px] text-white">✓</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-sm font-display font-bold text-white mb-2 tracking-tight group-hover:text-brand-primary transition-colors">{badge.name}</h3>
                                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium mb-6 h-8 overflow-hidden">{badge.desc}</p>

                                <div className="w-full pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{badge.category}</span>
                                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">+{badge.xp} XP</span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
