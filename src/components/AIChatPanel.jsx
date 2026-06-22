import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AIChatAdvisor } from '../engine/SimulationEngine'
import { Button } from './elements/Button'
import { Send, X, Bot, User, Sparkles, MessageSquare } from 'lucide-react'
import { cn } from '../lib/utils'

/* ─── Simple markdown renderer for chat messages ─── */
function renderMarkdown(text) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, li) => {
        // Skip empty lines but add spacing
        if (!line.trim()) {
            elements.push(<div key={`sp-${li}`} className="h-2" />);
            return;
        }

        // Process inline markdown
        let processed = line;

        // Convert **bold** to <strong>
        const parts = [];
        let remaining = processed;
        let partKey = 0;

        while (remaining.length > 0) {
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            if (boldMatch) {
                const idx = remaining.indexOf(boldMatch[0]);
                if (idx > 0) {
                    parts.push(<span key={`t-${li}-${partKey++}`}>{remaining.substring(0, idx)}</span>);
                }
                parts.push(<strong key={`b-${li}-${partKey++}`} className="text-white font-semibold">{boldMatch[1]}</strong>);
                remaining = remaining.substring(idx + boldMatch[0].length);
            } else {
                parts.push(<span key={`t-${li}-${partKey++}`}>{remaining}</span>);
                remaining = '';
            }
        }

        // Check if it's a bullet point
        const isBullet = line.trimStart().startsWith('•') || line.trimStart().startsWith('-') || line.trimStart().match(/^\d+\./);

        if (isBullet) {
            const bulletContent = line.replace(/^\s*[•\-]\s*/, '').replace(/^\s*\d+\.\s*/, '');
            // Re-process bullet content for bold
            const bulletParts = [];
            let bRemaining = bulletContent;
            let bKey = 0;
            while (bRemaining.length > 0) {
                const bMatch = bRemaining.match(/\*\*(.+?)\*\*/);
                if (bMatch) {
                    const bIdx = bRemaining.indexOf(bMatch[0]);
                    if (bIdx > 0) bulletParts.push(<span key={`bt-${li}-${bKey++}`}>{bRemaining.substring(0, bIdx)}</span>);
                    bulletParts.push(<strong key={`bb-${li}-${bKey++}`} className="text-white font-semibold">{bMatch[1]}</strong>);
                    bRemaining = bRemaining.substring(bIdx + bMatch[0].length);
                } else {
                    bulletParts.push(<span key={`bt-${li}-${bKey++}`}>{bRemaining}</span>);
                    bRemaining = '';
                }
            }
            elements.push(
                <div key={`li-${li}`} className="flex items-start gap-2 py-0.5">
                    <span className="text-indigo-400 mt-0.5 text-[10px] flex-shrink-0">▸</span>
                    <span>{bulletParts}</span>
                </div>
            );
        } else {
            elements.push(<p key={`p-${li}`} className={cn(li > 0 && "mt-1.5")}>{parts}</p>);
        }
    });

    return elements;
}

export default function AIChatPanel({ isOpen, onClose, financialData, businessConfig, risks }) {
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: `👋 Greetings. I am Astra, your synchronized simulation advisor. How can I assist with your ${businessConfig?.businessType || 'business'} architecture today?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = () => {
        if (!input.trim() || isTyping) return;

        const userMsg = {
            role: 'user',
            content: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        const question = input;
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const advisor = new AIChatAdvisor(financialData, businessConfig, risks);
            const response = advisor.generateResponse(question);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]" />

                    {/* Chat Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-full max-w-[480px] z-[101] bg-[#0a0c15]/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center relative">
                                        <Bot className="w-5 h-5 text-indigo-400" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0a0c15] rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-display font-bold text-white tracking-wide">Astra AI</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="text-[9px] text-zinc-600">Business Advisor</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-white/15 transition-all flex items-center justify-center">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide space-y-5">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={i}
                                    className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
                                >
                                    {/* Avatar */}
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                                        msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-white/[0.04] border border-white/5')}>
                                        {msg.role === 'user'
                                            ? <User className="w-3.5 h-3.5 text-indigo-400" />
                                            : <Bot className="w-3.5 h-3.5 text-zinc-400" />
                                        }
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={cn("max-w-[80%] flex flex-col", msg.role === 'user' ? 'items-end' : 'items-start')}>
                                        <div className={cn(
                                            "px-4 py-3 rounded-2xl leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-indigo-500 text-white rounded-tr-md text-[13px] font-medium"
                                                : "bg-white/[0.04] border border-white/5 text-zinc-300 rounded-tl-md text-[13px]"
                                        )}>
                                            {msg.role === 'user'
                                                ? msg.content
                                                : renderMarkdown(msg.content)
                                            }
                                        </div>
                                        <span className="text-[9px] text-zinc-700 mt-1.5 px-1">{msg.time}</span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-zinc-400" />
                                    </div>
                                    <div className="bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-md px-5 py-3 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-5 border-t border-white/5 bg-black/30">
                            <div className="relative">
                                <textarea
                                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3.5 text-[13px] text-white placeholder:text-zinc-600 focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all outline-none resize-none min-h-[56px] max-h-[120px] font-medium leading-relaxed pr-14"
                                    placeholder="Ask about your business..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    rows={1}
                                />
                                <button onClick={sendMessage} disabled={!input.trim() || isTyping}
                                    className={cn("absolute right-2.5 bottom-2.5 w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                                        input.trim() && !isTyping
                                            ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:bg-indigo-400"
                                            : "bg-white/5 text-zinc-700"
                                    )}>
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quick Commands */}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-[8px] text-zinc-700 uppercase tracking-widest mr-1">Quick:</span>
                                {[
                                    { label: 'Profitability', cmd: 'Is this profitable?' },
                                    { label: 'Risks', cmd: 'What are my risks?' },
                                    { label: 'Break-even', cmd: 'When will I break even?' }
                                ].map(q => (
                                    <button key={q.label} onClick={() => { setInput(q.cmd); }}
                                        className="text-[9px] px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/20 transition-all">
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
