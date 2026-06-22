import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIChatAdvisor, AIInsightEngine, formatCurrency } from '../engine/SimulationEngine'
import { Card } from '../components/elements/Card'
import { Button } from '../components/elements/Button'
import { Bot, Sparkles, Terminal, Activity, ShieldCheck, Target, Zap, Waves } from 'lucide-react'
import { cn } from '../lib/utils'

export default function AIAdvisorPage({ financialData, riskData, insights, businessConfig }) {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `Astra Intelligence v3.0 // ANALYTICAL_OVERVIEW_READY\n\nI have successfully mapped the core parameters of your **${businessConfig?.businessName || 'Business Entity'}** twin.\n\n• **Revenue Capacity**: ${formatCurrency(financialData?.monthlyRevenue || 0)} / mo\n• **Margin Delta**: ${financialData?.profitMargin || 0}%\n• **Risk Profile**: ${riskData?.riskScore?.level || 'MODERATE'}\n\nReady for strategic inquiry.`,
            type: 'status'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const quickActions = [
        { text: 'Profitability Audit', icon: <Activity className="w-3 h-3" /> },
        { text: 'Risk Vector Analysis', icon: <ShieldCheck className="w-3 h-3" /> },
        { text: 'Break-Even Roadmap', icon: <Target className="w-3 h-3" /> },
        { text: 'Capital Efficiency', icon: <Zap className="w-3 h-3" /> },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = (text) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const advisor = new AIChatAdvisor(financialData, businessConfig, riskData?.risks || []);
            const response = advisor.generateResponse(messageText);
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    const aiEngine = new AIInsightEngine(financialData, businessConfig);
    const execSummary = aiEngine.generateExecutiveSummary();

    return (
        <div className="max-w-[1700px] mx-auto animate-fade-in flex flex-col h-[calc(100vh-140px)]">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center">
                            <Bot className="w-7 h-7 text-brand-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Intelligence Console</h1>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Quantum-Ready Synthesis Deck</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-8 border-l border-white/5 pl-8">
                    <div className="text-right">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Neural Connection</div>
                        <div className="text-xs font-bold text-emerald-500 font-mono">ENCRYPTED_EXT_LNK</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Compute Load</div>
                        <div className="text-xs font-bold text-brand-cyan font-mono">4.2%_CPU</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* 1. Terminal Console */}
                <Card className="col-span-12 lg:col-span-8 p-0 flex flex-col border-white/10 group overflow-hidden bg-black/40">
                    <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center group-hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-4 h-4 text-zinc-600" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Astra Core Instance // SESSION_ID_9921</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-white/5" />
                            <div className="w-2 h-2 rounded-full bg-white/5" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide" ref={scrollRef}>
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                                >
                                    <div className={cn(
                                        "max-w-[85%] p-8 rounded-3xl",
                                        msg.role === 'user'
                                            ? "bg-brand-primary/10 border border-brand-primary/30 text-white font-bold"
                                            : "bg-white/[0.03] border border-white/5 text-zinc-300"
                                    )}>
                                        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                            {msg.role === 'user' ? <Waves className="w-4 h-4 text-brand-primary" /> : <Sparkles className="w-4 h-4 text-brand-cyan" />}
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                                {msg.role === 'user' ? 'Direct_Command_Entry' : 'Astra_Synthetic_Observation'}
                                            </span>
                                        </div>
                                        <div className="whitespace-pre-wrap font-mono uppercase tracking-tight text-xs leading-relaxed">
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex gap-3 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce shadow-[0_0_10px_#6366f1]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s] shadow-[0_0_10px_#6366f1]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s] shadow-[0_0_10px_#6366f1]" />
                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-2">Mapping Context Clusters</span>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="p-8 border-t border-white/10 bg-black/20">
                        <div className="flex flex-wrap gap-2 mb-8">
                            {quickActions.map((q, i) => (
                                <button
                                    key={i}
                                    className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[9px] font-black text-zinc-500 hover:text-white hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all uppercase tracking-[0.15em] flex items-center gap-2"
                                    onClick={() => sendMessage(q.text)}
                                >
                                    {q.icon}
                                    {q.text}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                className="w-full bg-white/[0.03] border-2 border-white/5 rounded-3xl px-10 py-6 text-white text-sm outline-none focus:border-brand-primary/40 focus:bg-white/[0.05] transition-all font-bold placeholder:text-zinc-800"
                                placeholder="ISSUE STRATEGIC COMMAND TO ASTRA..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5">EX_CMD</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Tactical Metrics Pane */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <Card className="p-8 bg-brand-primary/[0.02] border-brand-primary/20 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-10 self-start">Funding Readiness Matrix</h3>
                        <div className="w-48 h-48 rounded-full border border-white/5 flex items-center justify-center relative mb-10">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="96" cy="96" r="80"
                                    className="stroke-white/[0.05] fill-none"
                                    strokeWidth="2"
                                />
                                <motion.circle
                                    cx="96" cy="96" r="80"
                                    className="stroke-brand-primary fill-none shadow-[0_0_20px_#6366f1]"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 1000" }}
                                    animate={{ strokeDasharray: `${(execSummary.fundingReadiness.score / 100) * 502} 1000` }}
                                    transition={{ duration: 2, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="text-center">
                                <div className="text-5xl font-display font-black text-white">{execSummary.fundingReadiness.score}</div>
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1">{execSummary.fundingReadiness.label}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 w-full gap-4">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Stability</div>
                                <div className="text-xs font-bold text-emerald-500 font-mono">0.88x</div>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                                <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">Growth</div>
                                <div className="text-xs font-bold text-brand-cyan font-mono">1.24x</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-dashed border-white/10 bg-transparent flex-1">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Sparkles className="w-3 h-3 text-brand-secondary" />
                            Astra Strategic Synthesis
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium italic border-l-2 border-brand-primary/30 pl-6">
                                    "{execSummary.overview}"
                                </p>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Immediate Directive</span>
                                </div>
                                <p className="text-[11px] font-bold text-white tracking-tight leading-relaxed">
                                    {execSummary.recommendation}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
