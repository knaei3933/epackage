'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MotionWrapperProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const MotionWrapper = ({ children, className, delay = 0 }: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "premium" feel
                delay: delay
            }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
};
