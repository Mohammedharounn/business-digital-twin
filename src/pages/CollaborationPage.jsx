import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/elements/Card';
import { Button } from '../components/elements/Button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAppStore } from '../store/useAppStore';

const TEAM = [
    { id: 1, name: "Alex Rivet", role: "Owner", status: "online", email: "alex@rivet.ai", avatar: "👤" },
    { id: 2, name: "Sarah Chen", role: "Co-Founder", status: "online", email: "sarah@rivet.ai", avatar: "👩‍💻" },
    { id: 3, name: "Mekhi Jordan", role: "Investor", status: "offline", email: "mj@ven.vc", avatar: "💼" },
];

const RECENT_ACTIVITY = [
    { user: "Sarah Chen", action: "Modified 'Scenario Zeta' parameters", time: "14m ago" },
    { user: "Alex Rivet", action: "Updated 3D layout in 'Main Lounge'", time: "2h ago" },
    { user: "System Engine", action: "Weekly AI Synthesis generated", time: "5h ago" },
];

export default function CollaborationPage() {
    const [inviteEmail, setInviteEmail] = useState("");
    const { activeProjectId } = useAppStore();
    const [shareUrl, setShareUrl] = useState("");
    const [sharing, setSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateShare = async () => {
        if (!activeProjectId) { setShareUrl("ERROR: Open a project first to generate a link."); return; }
        setSharing(true);
        try {
            const res = await api.post(`/business/${activeProjectId}/share`, { enable: true });
            const url = `${window.location.origin}/twin/${res.data.shareId}`;
            setShareUrl(url);
            try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard may be blocked */ }
        } catch (err) {
            setShareUrl("ERROR: " + (err.response?.data?.error || err.message));
        } finally {
            setSharing(false);
        }
    };

    // ── Real project comments ────────────────────────────────────────────────
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState("");
    const [cLoading, setCLoading] = React.useState(false);

    React.useEffect(() => {
        if (!activeProjectId) { setComments([]); return; }
        let alive = true;
        api.get(`/business/${activeProjectId}/comments`)
            .then(res => { if (alive) setComments(res.data?.data || []); })
            .catch(() => { if (alive) setComments([]); });
        return () => { alive = false; };
    }, [activeProjectId]);

    const handleAddComment = async () => {
        const text = newComment.trim();
        if (!text || !activeProjectId) return;
        setCLoading(true);
        try {
            const res = await api.post(`/business/${activeProjectId}/comments`, { text });
            setComments(c => [res.data.data, ...c]);
            setNewComment("");
        } catch (_) { /* ignore */ } finally { setCLoading(false); }
    };

    const handleDeleteComment = async (id) => {
        try {
            await api.delete(`/business/${activeProjectId}/comments/${id}`);
            setComments(c => c.filter(x => x._id !== id));
        } catch (_) { /* ignore */ }
    };

    const timeAgo = (iso) => {
        const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🤝</span>
                    <h1 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Multi-Agent Collaboration</h1>
                </div>
                <p className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">Synchronous business strategy and co-twin management</p>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* Team Management */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <Card className="p-0 border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Operatives</h3>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full border border-emerald-500/20">LIVE SYNC ACTIVE</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {TEAM.map(member => (
                                <div key={member.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-bg-deep ${member.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-display font-bold text-white tracking-tight mb-0.5">{member.name}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{member.role}</span>
                                                <span className="text-[10px] text-zinc-600 font-mono">{member.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="sm">Permission Scope</Button>
                                        <Button variant="danger" size="sm">Revoke</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-10 border-dashed border-white/10 bg-transparent text-center">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Authorize New Access Node</h4>
                        <div className="max-w-md mx-auto flex gap-4">
                            <input
                                className="flex-1 bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-3 text-white text-sm outline-none focus:border-brand-primary transition-all font-bold placeholder:text-zinc-700"
                                placeholder="operative@entity.ai"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                            />
                            <Button>Invite</Button>
                        </div>
                    </Card>
                </div>

                {/* Global Activity Log */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card className="p-8">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Project Notes & Comments</h3>

                        {!activeProjectId ? (
                            <p className="text-[11px] text-zinc-600">Open a project to add notes and comments.</p>
                        ) : (
                            <>
                                <div className="flex gap-2 mb-6">
                                    <input
                                        className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-brand-primary transition-all placeholder:text-zinc-700"
                                        placeholder="Leave a note on this twin…"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                                    />
                                    <Button size="sm" onClick={handleAddComment} disabled={cLoading || !newComment.trim()}>
                                        {cLoading ? '…' : 'Post'}
                                    </Button>
                                </div>

                                {comments.length === 0 ? (
                                    <p className="text-[11px] text-zinc-700 text-center py-4">No comments yet. Be the first to leave a note.</p>
                                ) : (
                                    <div className="space-y-5 max-h-[420px] overflow-y-auto">
                                        {comments.map((c) => (
                                            <div key={c._id} className="relative pl-6 border-l border-white/5 group">
                                                <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_#6366f1]"></div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[11px] font-bold text-white">{c.authorName}</div>
                                                    <button onClick={() => handleDeleteComment(c._id)} className="text-[9px] text-zinc-700 hover:text-brand-rose opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Delete</button>
                                                </div>
                                                <div className="text-[11px] text-zinc-400 leading-snug my-1">{c.text}</div>
                                                <div className="text-[9px] font-mono text-zinc-700 uppercase">{timeAgo(c.createdAt)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>

                    <Card className="p-8 bg-brand-secondary/5 border-brand-secondary/20">
                        <h3 className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-6">Investor Mode</h3>
                        <p className="text-[11px] text-zinc-500 leading-relaxed mb-8">
                            Generate a secure, read-only "Presentation Twin" URI. Perfect for venture capital disclosures and strategic pitches.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={handleGenerateShare}
                            disabled={sharing}
                            className="w-full !border-brand-secondary/30 text-brand-secondary hover:!bg-brand-secondary/10"
                        >
                            {sharing ? 'Generating…' : 'Generate Secure URI'}
                        </Button>
                        {shareUrl && (
                            <div className="mt-5">
                                {shareUrl.startsWith('ERROR') ? (
                                    <p className="text-[11px] text-brand-rose">{shareUrl.replace('ERROR: ', '')}</p>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Read-only link {copied && <span className="text-emerald-400">· copied!</span>}</span>
                                            <button onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }} className="text-[9px] font-black text-brand-secondary uppercase tracking-widest hover:underline">Copy</button>
                                        </div>
                                        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-mono text-brand-secondary bg-black/30 border border-brand-secondary/20 rounded-lg px-3 py-2 break-all hover:bg-black/50 transition-colors">
                                            {shareUrl}
                                        </a>
                                    </>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

            </div>
        </div>
    );
}
