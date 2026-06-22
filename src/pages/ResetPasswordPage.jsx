import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, CheckCircle, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage({ onBack }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { resetPassword } = useAuth();

    useEffect(() => {
        const path = window.location.pathname;
        const search = window.location.search;
        console.log('[ResetPassword] Path:', path);
        console.log('[ResetPassword] Search:', search);

        const pathParts = path.split('/').filter(p => !!p);

        // 1. Standard Path Extraction (/reset-password/TOKEN)
        const tokenFromPath = pathParts.find((part, index) => pathParts[index - 1] === 'reset-password');

        // 2. Query Param Extraction (?token=TOKEN)
        const urlParams = new URLSearchParams(search);
        const tokenFromQuery = urlParams.get('token') || urlParams.get('t');

        // 3. Last segment fallback (if segments > 1 and it's not the page name)
        const lastPart = pathParts[pathParts.length - 1];
        const tokenFromLast = (pathParts.length > 1 && lastPart !== 'reset-password') ? lastPart : null;

        // 4. Any long hex/alphanumeric part in path (standard tokens are >20 chars)
        const tokenFromLong = pathParts.find(p => p.length > 20);

        const finalToken = tokenFromPath || tokenFromQuery || tokenFromLast || tokenFromLong;

        console.log('[ResetPassword] Extracted finalToken:', finalToken);

        if (finalToken && finalToken.length > 5) {
            setToken(finalToken);
        } else {
            setError('Link issue: Missing reset token in URL.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 8) {
            return setError('Password must be at least 8 characters');
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#02040a] relative selection:bg-indigo-500 selection:text-white">
            {/* Background blurs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Logo + Title */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black text-xl mx-auto mb-5 shadow-2xl"
                    >DT</motion.div>

                    <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tighter">
                        {success ? 'Password Reset' : 'New Password'}
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium">
                        {success ? 'Your security has been updated.' : 'Enter a strong new password for your account.'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass-panel p-8 md:p-10 shadow-premium border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {error && (
                                    <div className="mb-6 flex flex-col gap-2">
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-3 font-semibold">
                                            <span>⚠️</span>
                                            <span>{error}</span>
                                        </div>
                                        {/* DEBUG INFO FOR USER */}
                                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Debug Info</p>
                                            <p className="text-[9px] text-zinc-400 break-all font-mono leading-tight">
                                                Path: {window.location.pathname}<br />
                                                Search: {window.location.search || 'None'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Lock className="w-3 h-3" /> New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all font-medium text-sm pr-12"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 transition-all font-medium text-sm"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !token}
                                        className="btn btn-primary w-full py-4 text-xs mt-2 disabled:opacity-50 shadow-[0_10px_25px_rgba(99,102,241,0.3)] font-bold uppercase tracking-widest"
                                    >
                                        {loading ? 'Updating...' : 'Reset Password'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 flex flex-col items-center gap-6"
                            >
                                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-white font-bold text-xl">Success!</p>
                                    <p className="text-zinc-500 text-sm">Your password has been changed successfully.</p>
                                </div>
                                <button
                                    onClick={onBack}
                                    className="btn btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest mt-4"
                                >
                                    Proceed to Login
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-10 text-center">
                    <button
                        onClick={onBack}
                        className="text-zinc-700 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto group"
                    >
                        <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span> Return to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
