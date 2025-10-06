import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

interface ProductListProps {
  flowers: Array<{
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  }>;
  loading: boolean;
  searchTerm: string;
  onSelect: (flower: { name: string; price: number; image_url: string | null }) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  flowers,
  loading,
  searchTerm,
  onSelect,
  quantity,
  setQuantity
}) => {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const filteredFlowers = flowers.filter(flower =>
    flower.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (flowerId: number, change: number) => {
    const currentQuantity = quantities[flowerId] || 1;
    const newQuantity = Math.max(1, currentQuantity + change);
    setQuantities(prev => ({ ...prev, [flowerId]: newQuantity }));
    setQuantity(newQuantity);
  };

  const handleSelect = (flower: typeof flowers[0]) => {
    const selectedQuantity = quantities[flower.id] || 1;
    onSelect({
      name: flower.name,
      price: flower.price,
      image_url: flower.image_url
    });
    // Reset the quantity for this flower after selection
    setQuantities(prev => ({ ...prev, [flower.id]: 1 }));
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-white/80 p-8">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[480px] overflow-y-auto scrollbar-styled">
      <div className="pb-[10px]">
        {filteredFlowers.map((flower) => (
          <div
            key={flower.id}
            className="w-full p-3 rounded-xl glass-morphism hover:bg-white/[0.08] transition-colors duration-300 mb-4 last:mb-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                <img
                  src={flower.image_url || 'https://via.placeholder.com/48'}
                  alt={flower.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate mb-0.5">{flower.name}</h3>
                <p className="text-emerald-400 font-medium text-sm">R$ {flower.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/[0.03] rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(flower.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <span className="w-6 text-center font-medium text-sm">
                    {quantities[flower.id] || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(flower.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                <button
                  onClick={() => handleSelect(flower)}
                  className="w-8 h-8 rounded-xl glass-morphism flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20 transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFlowers.length === 0 && (
        <div className="text-center py-12 text-white/60">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
};