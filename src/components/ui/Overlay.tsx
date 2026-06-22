import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/elements/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[calc(100vw-40px)]"
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    className
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full glass-panel !rounded-[32px] border border-white/10 shadow-2xl bg-bg-surface-high/80 backdrop-blur-2xl overflow-hidden flex flex-col",
                            sizeClasses[size],
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                {title && (
                                    <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">{title}</h3>
                                )}
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Nodal Configuration Matrix</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-10 overflow-y-auto max-h-[70vh]">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="p-8 bg-white/[0.01] border-t border-white/5 flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const Drawer: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    className
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "absolute top-0 right-0 h-full w-full max-w-[500px] glass-panel !rounded-none border-y-0 border-r-0 border-white/10 bg-bg-surface/90 backdrop-blur-3xl flex flex-col",
                            className
                        )}
                    >
                        <div className="p-10 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-sm font-display font-bold text-white tracking-widest uppercase">{title}</h3>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto">
                            {children}
                        </div>

                        {footer && (
                            <div className="p-10 border-t border-white/5 bg-white/[0.01]">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
