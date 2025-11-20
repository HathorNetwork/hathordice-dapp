import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GoldButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'pill' | 'rectangle' | 'oval';
    isActive?: boolean;
    children: React.ReactNode;
}

export function GoldButton({ variant = 'pill', isActive = false, children, className = '', disabled, ...props }: GoldButtonProps) {
    const baseStyles = "relative font-bold text-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    const variants = {
        pill: `rounded - full border - 2 ${isActive
                ? 'bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-white'
                : 'bg-black/40 border-yellow-700/50 hover:border-yellow-500 hover:bg-black/60'
            } `,
        rectangle: `rounded - lg border - 2 ${isActive
                ? 'bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] text-white'
                : 'bg-black/40 border-yellow-700/50 hover:border-yellow-500 hover:bg-black/60'
            } `,
        oval: `rounded - full bg - gradient - to - b from - yellow - 200 via - yellow - 500 to - yellow - 700 text - yellow - 900 shadow - xl border - 4 border - yellow - 300 hover: brightness - 110 active: scale - 95`
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            className={`${baseStyles} ${variants[variant]} ${className} `}
            disabled={disabled}
            {...props}
        >
            {/* Inner Shine for active/oval buttons */}
            {(isActive || variant === 'oval') && (
                <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            )}
            {children}
        </motion.button>
    );
}
