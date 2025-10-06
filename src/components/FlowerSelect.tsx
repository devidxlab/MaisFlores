import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown } from 'lucide-react';
import { useFlowers } from '../hooks/useFlowers';

interface FlowerSelectProps {
  value: string;
  onChange: (flower: { name: string; price: number }) => void;
  className?: string;
}

export const FlowerSelect: React.FC<FlowerSelectProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { flowers, loading, error } = useFlowers();
  const selectedFlower = flowers.find(f => f.name === value);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/80">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400">
        Erro ao carregar produtos: {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-6 py-4 rounded-2xl
          glass-morphism input-focus
          transition-all duration-300
          text-white text-lg
          flex items-center justify-between
          hover:bg-white/[0.08]
          ${className}
        `}
      >
        <div className="flex items-center gap-4">
          {selectedFlower ? (
            <>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                <img
                  src={selectedFlower.image_url || 'https://via.placeholder.com/56'}
                  alt={selectedFlower.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{selectedFlower.name}</div>
                <div className="text-sm text-emerald-400">
                  R$ {selectedFlower.price.toFixed(2)}
                </div>
              </div>
            </>
          ) : (
            <span className="text-white/60">Selecione um produto</span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full mt-2 glass-morphism rounded-2xl overflow-hidden z-20 border border-white/10"
            >
              <div className="max-h-[320px] overflow-y-auto scrollbar-styled">
                {flowers.map((flower) => (
                  <button
                    key={flower.id}
                    onClick={() => {
                      onChange({ name: flower.name, price: flower.price });
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-6 py-4 flex items-center gap-4
                      transition-colors duration-300
                      hover:bg-white/[0.08]
                      ${value === flower.name ? 'bg-white/[0.08]' : ''}
                    `}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                      <img
                        src={flower.image_url || 'https://via.placeholder.com/56'}
                        alt={flower.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-lg">{flower.name}</div>
                      <div className="text-emerald-400">
                        R$ {flower.price.toFixed(2)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};