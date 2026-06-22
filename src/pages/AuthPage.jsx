import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, CheckCircle, Shield } from 'lucide-react';
import OTPInput from '../components/OTPInput';

const STEPS = { CREDENTIALS: 'credentials', OTP: 'otp', SUCCESS: 'success' };

export default function AuthPage({ onBack }) {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(STEPS.CREDENTIALS);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [devCode, setDevCode] = useState('');

    const { login, signup, verifyOTP, resendOTP, googleLogin, forgotPassword } = useAuth();

    // Auto-redirect handled by App.jsx when user state updates

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else {
                result = await signup(email, password, name, phone);
            }

            // If OTP is required, switch to OTP step
            if (result?.requiresOTP) {
                setStep(STEPS.OTP);
                setSuccessMessage(result.message || 'Verification code sent!');
                if (result.code) {
                    setDevCode(result.code);
                    console.log('Dev Mode OTP Code:', result.code);
                }
            }
            // If login succeeded directly (verified user), App.jsx handles redirect
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOTPComplete = async (code) => {
        setOtpError('');
        setLoading(true);

        try {
            await verifyOTP(email, code);
            setStep(STEPS.SUCCESS);
            // App.jsx will handle redirect when user state updates
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtpError('');
        try {
            const res = await resendOTP(email);
            setSuccessMessage('New code sent!');
            if (res.code) setDevCode(res.code);
        } catch (err) {
            setOtpError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await googleLogin();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccessMessage('Password reset link sent to your email!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setStep(STEPS.CREDENTIALS);
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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {step === STEPS.CREDENTIALS && (
                                <>
                                    <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tighter">
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p className="text-zinc-500 text-sm font-medium">
                                        {isLogin ? 'Sign in to your business digital twin.' : 'Join the enterprise intelligence network.'}
                                    </p>
                                </>
                            )}
                            {step === STEPS.OTP && (
                                <>
                                    <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tighter">
                                        Verify Email
                                    </h2>
                                    <p className="text-zinc-500 text-sm font-medium">
                                        Enter the 6-digit code sent to your email
                                        {devCode && (
                                            <span className="block mt-2 text-indigo-400 font-bold bg-indigo-500/10 py-1 px-3 rounded-lg border border-indigo-500/20">
                                                Development Code: {devCode}
                                            </span>
                                        )}
                                    </p>
                                </>
                            )}
                            {step === STEPS.SUCCESS && (
                                <>
                                    <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tighter">
                                        Verified ✓
                                    </h2>
                                    <p className="text-emerald-400 text-sm font-medium">
                                        Redirecting to dashboard...
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Main Card */}
                <div className="glass-panel p-8 md:p-10 shadow-premium border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    <AnimatePresence mode="wait">
                        {/* ═══ STEP 1: Credentials ═══ */}
                        {step === STEPS.CREDENTIALS && (
                            <motion.div
                                key="credentials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-3 font-semibold"
                                    >
                                        <span className="shrink-0">⚠️</span>
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Name (signup only) */}
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <User className="w-3 h-3" /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 focus:bg-indigo-500/[0.03] transition-all font-medium text-sm"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </motion.div>
                                    )}

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 focus:bg-indigo-500/[0.03] transition-all font-medium text-sm"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    {/* Phone (signup only) */}
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Phone <span className="text-zinc-700">(optional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 focus:bg-indigo-500/[0.03] transition-all font-medium text-sm"
                                                placeholder="+1234567890"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </motion.div>
                                    )}

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Password
                                            </label>
                                            {isLogin && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // For now, if no email entered, show error, otherwise trigger reset
                                                        if (!email) {
                                                            setError('Please enter your email above first.');
                                                        } else {
                                                            handleForgotPassword({ preventDefault: () => { } });
                                                        }
                                                    }}
                                                    className="text-[10px] text-zinc-600 font-bold hover:text-indigo-400 transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={8}
                                                className="w-full bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500 focus:bg-indigo-500/[0.03] transition-all font-medium text-sm pr-12"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {!isLogin && password.length > 0 && (
                                            <div className="flex gap-1 mt-1 ml-1">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${password.length >= i * 3
                                                            ? i <= 2 ? 'bg-red-500' : i === 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                                                            : 'bg-white/10'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full py-4 text-xs mt-2 disabled:opacity-50 shadow-[0_10px_25px_rgba(99,102,241,0.3)] font-bold uppercase tracking-widest"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : (isLogin ? 'Sign In' : 'Create Account')}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="my-7 flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">OR CONTINUE WITH</span>
                                    <div className="h-[1px] flex-1 bg-white/[0.05]"></div>
                                </div>

                                {/* OAuth Buttons */}
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-3 bg-white/[0.03] border-2 border-white/[0.05] rounded-2xl py-4 hover:bg-white/[0.05] hover:border-white/10 transition-all disabled:opacity-50 group"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                                        </svg>
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Continue with Google</span>
                                    </button>
                                </div>

                                {/* Toggle login/signup */}
                                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                    <p className="text-zinc-500 text-sm font-medium">
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                        <button
                                            onClick={switchMode}
                                            className="text-indigo-400 font-bold ml-2 hover:text-indigo-300 transition-colors underline underline-offset-8 decoration-indigo-500/30"
                                        >
                                            {isLogin ? 'Sign Up' : 'Log In'}
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ STEP 2: OTP Verification ═══ */}
                        {step === STEPS.OTP && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="py-4"
                            >
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center font-semibold flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {successMessage}
                                    </motion.div>
                                )}

                                <OTPInput
                                    length={6}
                                    onComplete={handleOTPComplete}
                                    onResend={handleResendOTP}
                                    error={otpError}
                                    loading={loading}
                                    email={email}
                                />

                                <button
                                    onClick={() => { setStep(STEPS.CREDENTIALS); setOtpError(''); }}
                                    className="mt-8 w-full text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Back to {isLogin ? 'Login' : 'Sign Up'}
                                </button>
                            </motion.div>
                        )}

                        {/* ═══ STEP 3: Success ═══ */}
                        {step === STEPS.SUCCESS && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center gap-4"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center"
                                >
                                    <Shield className="w-8 h-8 text-emerald-400" />
                                </motion.div>
                                <p className="text-white font-bold text-lg">Account Verified!</p>
                                <p className="text-zinc-500 text-sm">Redirecting to your dashboard...</p>
                                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mt-4"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Back to Home */}
                {step === STEPS.CREDENTIALS && (
                    <div className="mt-10 text-center">
                        <button
                            onClick={onBack}
                            className="text-zinc-700 hover:text-zinc-400 transition-colors text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto group"
                        >
                            <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span> Back to Home
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Version */}
            <div className="absolute bottom-10 text-zinc-900 text-[10px] font-black tracking-[0.5em] uppercase pointer-events-none">
                BUSINESS DIGITAL TWIN // v3.0
            </div>
        </div>
    );
}
