import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none gap-2",
    {
        variants: {
            variant: {
                primary: "bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.5)]",
                secondary: "bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] hover:border-brand-primary/40 backdrop-blur-md",
                outline: "bg-transparent border border-white/5 text-zinc-400 hover:text-white hover:border-white/20",
                ghost: "bg-transparent text-zinc-500 hover:text-white",
                danger: "bg-brand-rose/10 border border-brand-rose/20 text-brand-rose hover:bg-brand-rose/20"
            },
            size: {
                sm: "px-4 py-2 text-[10px]",
                md: "px-6 py-3",
                lg: "px-8 py-4 text-sm",
                icon: "h-10 w-10 p-0"
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md"
        }
    }
);

const Button = React.forwardRef(({ className, variant, size, children, ...props }, ref) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
