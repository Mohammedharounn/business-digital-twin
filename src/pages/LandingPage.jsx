import React from 'react'
import { motion } from 'framer-motion'

export default function LandingPage({ onGetStarted, onLogin }) {
    return (
        <div className="landing-container overflow-x-hidden">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/40 backdrop-blur-2xl">
                <div className="max-w-[1400px] mx-auto px-10 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">DT</div>
                        <div className="hidden md:block">
                            <span className="block font-display font-bold text-lg leading-tight uppercase tracking-tighter">Business Twin</span>
                            <span className="block text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Enterprise Intelligence</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <button className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors" onClick={() => document.getElementById('features-view')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
                        <button className="btn btn-primary px-8 py-3 text-xs" onClick={onGetStarted}>Log In</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-48 pb-32 px-10 flex flex-col items-center min-h-screen">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-indigo-500/20 text-[10px] font-bold text-indigo-300 mb-12 uppercase tracking-[0.2em]"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                    Now Scaling v3.0 Simulation Engine
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-7xl md:text-9xl font-display font-bold tracking-tighter text-center max-w-6xl leading-[0.85] mb-12"
                >
                    Digital Twins for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Architect Founders.</span>
                </motion.h1>

                <p className="text-xl md:text-2xl text-zinc-500 text-center max-w-2xl font-medium mb-16 leading-relaxed">
                    Operate your business in a high-fidelity virtual sandbox.
                    Real-time financials, 3D spatial intelligence, and autonomous optimization.
                </p>

                <div className="flex gap-6 mb-32">
                    <button className="btn btn-primary px-12 py-5 text-sm" onClick={onGetStarted}>Log In</button>
                </div>

                {/* 3D Preview Simulation Placeholder */}
                <div className="w-full max-w-[1200px] aspect-video glass-panel p-4 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent pointer-events-none"></div>
                    <div className="w-full h-full rounded-lg bg-[#050508] border border-white/5 flex flex-col">
                        {/* Fake Editor UI */}
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div className="h-4 w-px bg-white/10 mx-2"></div>
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Simulation Viewer / Terminal_01</span>
                            </div>
                            <div className="text-[10px] text-indigo-400 font-black">STABLE_BUILD_X64</div>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50">
                            <div className="text-center">
                                <div className="text-8xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-700">🏗️</div>
                                <div className="text-sm font-display font-bold text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Virtual Environment Syncing</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Viewport */}
            <section id="features-view" className="py-40 px-10 bg-surface-high/20 border-t border-white/5">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-24">
                        <h2 className="text-5xl font-display font-bold text-white mb-6">Engineered for <br /> <span className="text-indigo-400">Hyper-Performance.</span></h2>
                        <p className="text-zinc-500 max-w-lg text-lg font-medium leading-relaxed">Scaling shouldn't be guesswork. Our engine processes millions of variables to give you the mathematical edge.</p>
                    </div>

                    <div className="bento-grid">
                        {[
                            { title: 'Spatial Intelligence', desc: 'Auto-optimize your physical workspace for foot-traffic and operational flow.', icon: '🦾' },
                            { title: 'Financial Synapse', desc: 'High-fidelity cash flow simulations with 24-month accuracy horizons.', icon: '🧠' },
                            { title: 'Astra AI Advisor', desc: 'Continuous autonomous scouting for margin-leaks and growth levers.', icon: '☄️' },
                            { title: 'Side-by-Side Lab', desc: 'Fork your business into divergent timelines to test pricing strategies.', icon: '🧪' },
                            { title: 'Real-time Telemetry', desc: 'Stream your active business data directly into your virtual replica.', icon: '📡' },
                            { title: 'Boardroom Exports', desc: 'Generate investor-ready PDF models and strategy maps in seconds.', icon: '📄' }
                        ].map((f, i) => (
                            <div key={i} className="glass-panel p-10 hover:shadow-indigo-500/10 hover:shadow-2xl group border-l-4 border-l-transparent hover:border-l-indigo-600 transition-all duration-500">
                                <div className="text-4xl mb-8 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                                <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-tighter">{f.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-10 border-t border-white/5 text-center">
                <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-[1em]">Digital Twin Enterprise • v3.0.2</div>
            </footer>
        </div>
    )
}
