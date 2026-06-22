import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OTPInput({ length = 6, onComplete, onResend, error, loading, email }) {
    const [values, setValues] = useState(Array(length).fill(''));
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) {
            // Handle paste into single field
            const digits = value.replace(/\D/g, '').slice(0, length);
            if (digits.length > 1) {
                handlePaste(digits);
                return;
            }
            value = value.slice(-1);
        }

        if (value && !/^\d$/.test(value)) return;

        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);

        // Auto-advance
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (value && index === length - 1) {
            const code = newValues.join('');
            if (code.length === length) {
                onComplete?.(code);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newValues = [...values];
            newValues[index - 1] = '';
            setValues(newValues);
        }
        if (e.key === 'Enter') {
            const code = values.join('');
            if (code.length === length) {
                onComplete?.(code);
            }
        }
    };

    const handlePaste = (pastedOrEvent) => {
        let digits;
        if (typeof pastedOrEvent === 'string') {
            digits = pastedOrEvent;
        } else {
            pastedOrEvent.preventDefault();
            digits = pastedOrEvent.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        }

        if (digits.length === 0) return;

        const newValues = Array(length).fill('');
        digits.split('').forEach((d, i) => {
            if (i < length) newValues[i] = d;
        });
        setValues(newValues);

        // Focus last filled or next empty
        const nextEmpty = newValues.findIndex(v => !v);
        inputRefs.current[nextEmpty === -1 ? length - 1 : nextEmpty]?.focus();

        if (digits.length === length) {
            onComplete?.(digits);
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        setCanResend(false);
        setCountdown(60);
        setValues(Array(length).fill(''));
        inputRefs.current[0]?.focus();
        onResend?.();
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Email indicator */}
            <div className="text-center">
                <p className="text-zinc-400 text-sm">We sent a code to</p>
                <p className="text-white font-semibold text-sm mt-1">{email}</p>
            </div>

            {/* OTP Boxes */}
            <div className="flex gap-3">
                {values.map((val, i) => (
                    <motion.input
                        key={i}
                        ref={el => inputRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        onPaste={i === 0 ? handlePaste : undefined}
                        disabled={loading}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            borderColor: error
                                ? 'rgba(239, 68, 68, 0.5)'
                                : val
                                    ? 'rgba(99, 102, 241, 0.5)'
                                    : 'rgba(255, 255, 255, 0.05)'
                        }}
                        transition={{ delay: i * 0.05 }}
                        className={`
                            w-12 h-14 text-center text-xl font-bold rounded-xl
                            bg-white/[0.03] border-2 outline-none
                            text-white font-mono
                            focus:border-indigo-500 focus:bg-indigo-500/[0.05]
                            transition-colors duration-200
                            disabled:opacity-50
                            ${error ? 'border-red-500/50 bg-red-500/[0.03]' : 'border-white/[0.05]'}
                            ${val ? 'border-indigo-500/30' : ''}
                        `}
                    />
                ))}
            </div>

            {/* Error */}
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-semibold text-center"
                >
                    {error}
                </motion.p>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    Verifying...
                </div>
            )}

            {/* Resend */}
            <div className="text-center">
                {canResend ? (
                    <button
                        onClick={handleResend}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        Resend Code
                    </button>
                ) : (
                    <p className="text-zinc-600 text-xs font-medium">
                        Resend code in <span className="text-zinc-400 font-bold">{countdown}s</span>
                    </p>
                )}
            </div>
        </div>
    );
}
