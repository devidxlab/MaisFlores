import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  type?: string;
  options?: string[];
  icon?: React.ReactNode;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  options, 
  icon,
  prefix,
  className = '',
  ...props 
}) => {
  const baseClassName = `
    w-full px-4 py-3 rounded-xl 
    glass-morphism input-focus 
    transition-all duration-300
    placeholder-white/40 text-white text-base
    hover:bg-white/[0.08]
    ${icon ? 'pl-10' : ''} 
    ${prefix ? 'pl-10' : ''}
    ${type === 'date' ? '[color-scheme:dark]' : ''}
    ${className}
  `;

  return (
    <motion.div 
      className="space-y-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-white/90 pl-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
            {icon}
          </div>
        )}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-white/80 select-none flex items-center">
            {prefix}
          </div>
        )}
        {type === 'select' ? (
          <select 
            {...props} 
            className={`${baseClassName} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }}
          >
            {options?.map(option => (
              <option key={option} value={option} className="bg-[#2c3f2d]">{option}</option>
            ))}
          </select>
        ) : (
          <input 
            type={type} 
            {...props} 
            className={baseClassName}
          />
        )}
      </div>
    </motion.div>
  );
};