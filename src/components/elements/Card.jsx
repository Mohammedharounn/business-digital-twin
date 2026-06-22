import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className, animate = true, children, ...props }, ref) => {
    const Component = animate ? motion.div : 'div';

    return (
        <Component
            ref={ref}
            initial={animate ? { opacity: 0, y: 10 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            className={cn(
                "glass-panel p-6 relative overflow-hidden group border border-white/5 bg-white/[0.02]",
                className
            )}
            {...props}
        >
            {/* Subtle Internal Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </Component>
    );
});

Card.displayName = "Card";

const CardHeader = ({ className, children, ...props }) => (
    <div className={cn("mb-6 border-b border-white/5 pb-4", className)} {...props}>
        {children}
    </div>
);

const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn("text-[10px] font-black text-white uppercase tracking-[0.2em]", className)} {...props}>
        {children}
    </h3>
);

const CardDescription = ({ className, children, ...props }) => (
    <p className={cn("text-xs text-zinc-500 font-medium", className)} {...props}>
        {children}
    </p>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={cn("", className)} {...props}>
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
