import React from 'react';
import { motion } from 'framer-motion';

export const Logo = () => (
  <motion.div 
    className="flex justify-center mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <img 
      src="/assets/maisflores.png" 
      alt="Mais Flores" 
      className="hover:scale-105 transition-transform duration-500 drop-shadow-2xl" 
      style={{ width: '194px', height: '226px', objectFit: 'contain' }}
    />
  </motion.div>
);