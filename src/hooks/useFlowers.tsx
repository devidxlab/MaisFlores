import { useState, useEffect } from 'react';
import flowersData from '../data/flowers.json';

interface Flower {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
}

export function useFlowers() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Simula um pequeno delay para manter a experiência de carregamento
      setTimeout(() => {
        setFlowers(flowersData.flowers);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Erro ao carregar as flores');
      setLoading(false);
    }
  }, []);

  return { flowers, loading, error };
} 