import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '' }, ref) => (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      layout
      layoutTransition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-morphism rounded-3xl p-8 ${className}`}
    >
      {children}
    </motion.div>
  )
);

GlassCard.displayName = 'GlassCard';