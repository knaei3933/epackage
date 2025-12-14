'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export const GlassCard = ({ children, className, hoverEffect = false, onClick }: GlassCardProps) => {
    return (
        <motion.div
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-md shadow-xl",
                hoverEffect && "cursor-pointer transition-all duration-300 hover:bg-white/80 hover:shadow-2xl hover:-translate-y-1",
                className
            )}
            whileHover={hoverEffect ? { scale: 1.02 } : undefined}
            whileTap={hoverEffect ? { scale: 0.98 } : undefined}
        >
            {/* Glossy reflection effect */}
            <div className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

            {children}
        </motion.div>
    );
};
