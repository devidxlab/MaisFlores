import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Printer, Trash2, Search } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { Button } from './Button';
import { InventoryCartItem, UserInfo } from '../types';
import { openInventoryPrintWindow } from '../utils/print';
import { ACERVO } from '../data/acervo';

interface InventoryCalculatorProps {
  userInfo: UserInfo | null;
}

export const InventoryCalculator: React.FC<InventoryCalculatorProps> = ({ userInfo }) => {
  // State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [inventoryCart, setInventoryCart] = useState<InventoryCartItem[]>([]);
  const [tipoAcervo, setTipoAcervo] = useState<'proprio' | 'colaborativo'>('proprio');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('todas');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [local, setLocal] = useState<string>('');

  // Formatters
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const calcularDias = (inicio?: string, fim?: string) => {
    if (!inicio || !fim) return 0;
    const start = new Date(inicio);
    const end = new Date(fim);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 0;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const verificarDisponibilidade = (item: { reservations?: Array<{ startDate: string; endDate: string }> }, inicio?: string, fim?: string) => {
    if (!inicio || !fim) return true;
    const startSel = new Date(inicio).getTime();
    const endSel = new Date(fim).getTime();
    if (endSel < startSel) return false;
    const reservas = item.reservations || [];
    return reservas.every(r => {
      const rStart = new Date(r.startDate).getTime();
      const rEnd = new Date(r.endDate).getTime();
      const overlap = !(endSel < rStart || startSel > rEnd);
      return !overlap;
    });
  };

  const categoriasDisponiveis = useMemo(() => {
    const base = ACERVO.filter(i => i.type === tipoAcervo);
    const setCats = new Set(base.map(i => i.category));
    return ['todas', ...Array.from(setCats)];
  }, [tipoAcervo]);

  const listaFiltrada = useMemo(() => {
    let base = ACERVO.filter(i => i.type === tipoAcervo);
    if (categoriaSelecionada !== 'todas') {
      base = base.filter(i => i.category === categoriaSelecionada);
    }
    return base;
  }, [tipoAcervo, categoriaSelecionada]);

  const addToInventoryCart = () => {
    if (!selectedItem || !dataInicio || !dataFim) return;

    const dias = calcularDias(dataInicio, dataFim);
    const aluguel = selectedItem.rentalValue * dias;
    const frete = local && local.trim().length > 0 ? 150 : 0;

    const item: InventoryCartItem = {
      name: selectedItem.name,
      image_url: selectedItem.image_url || null,
      rentalValue: selectedItem.rentalValue,
      quantity: itemQuantity,
      startDate: dataInicio,
      endDate: dataFim,
      days: dias,
      freight: frete,
      location: local,
      total: (aluguel * itemQuantity) + frete,
      isOwned: selectedItem.type === 'proprio'
    } as any;

    setInventoryCart([...inventoryCart, item]);

    setSelectedItem(null);
    setItemQuantity(1);
  };

  const removeFromInventoryCart = (index: number) => {
    setInventoryCart(items => items.filter((_, i) => i !== index));
  };

  const inventoryCartTotal = inventoryCart.reduce((sum, item) => sum + item.total, 0);

  const handlePrint = () => {
    openInventoryPrintWindow(inventoryCart, inventoryCartTotal, userInfo);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid lg:grid-cols-[480px_1fr] gap-4">
        {/* Filtros e Lista */}
        <div>
          <GlassCard className="h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h2 className="text-lg font-medium">Consulta de Acervo</h2>
                  <p className="text-sm text-white/60">Defina período, local e filtre os móveis</p>
                </div>
              </div>

              {/* Período e Local */}
              <div className="grid md:grid-cols-3 gap-3">
                <Input type="date" label="Início do Evento" value={dataInicio || ''} onChange={(e) => setDataInicio(e.target.value)} />
                <Input type="date" label="Fim do Evento" value={dataFim || ''} onChange={(e) => setDataFim(e.target.value)} />
                <Input type="text" label="Local" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Salão Central" />
              </div>

              {/* Tipo de Acervo */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoAcervo('proprio')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${tipoAcervo === 'proprio' ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >Meu Acervo</button>
                <button
                  onClick={() => setTipoAcervo('colaborativo')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${tipoAcervo === 'colaborativo' ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >Acervo Colaborativo</button>
              </div>

              {/* Categorias */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categoriasDisponiveis.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaSelecionada(cat)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${categoriaSelecionada === cat ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                  >{cat}</button>
                ))}
              </div>

              {/* Lista de Móveis */}
              <div className="space-y-3">
                {listaFiltrada.map(item => {
                  const disponivel = verificarDisponibilidade(item, dataInicio, dataFim);
                  const dias = calcularDias(dataInicio, dataFim);
                  const totalPreview = dias > 0 ? item.rentalValue * dias : 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => disponivel && setSelectedItem(item)}
                      disabled={!disponivel}
                      className={`w-full p-4 rounded-lg text-left transition-colors duration-200 ${disponivel ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5 opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/60">IMG</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-white/60">{item.category} • {item.type === 'proprio' ? 'Próprio' : 'Terceiros'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">Diária: {formatCurrency(item.rentalValue)}</div>
                          {dias > 0 && <div className="text-xs text-white/60">{dias} dias • {formatCurrency(totalPreview)}</div>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Orçamento */}
        <div>
          <GlassCard className="h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-medium">Móveis do Orçamento</h2>
                <p className="text-sm text-white/60">
                  Confira os móveis selecionados e o valor total
                </p>
              </div>
            </div>
            {selectedItem && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium mb-3">Foto do Móvel</div>
                    <div className={`w-full aspect-[4/3] rounded-lg overflow-hidden ${selectedItem.image_url ? 'bg-white/5' : 'bg-white/10'} flex items-center justify-center`}>
                      {selectedItem.image_url ? (
                        <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white/60">Sem imagem</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">{selectedItem.name}</div>
                    <div className="text-xs text-white/60 mb-3">{selectedItem.category} • {selectedItem.type === 'proprio' ? 'Próprio' : 'Terceiros'}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium mb-1">Diária</div>
                        <div className="text-sm">{formatCurrency(selectedItem.rentalValue)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Quantidade</div>
                        <Input type="number" min={1} value={itemQuantity} onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)} />
                      </div>
                    </div>
                    <div className="mt-3 text-sm">Dias: {calcularDias(dataInicio, dataFim)}</div>
                    <div className="mt-1 text-sm">Frete: {formatCurrency((local && local.trim().length > 0) ? 150 : 0)}</div>
                    <div className="mt-2 text-sm font-medium">Total: {formatCurrency(((selectedItem.rentalValue * calcularDias(dataInicio, dataFim)) * itemQuantity) + ((local && local.trim().length > 0) ? 150 : 0))}</div>
                    <Button
                      variant="primary"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={addToInventoryCart}
                      disabled={!dataInicio || !dataFim || calcularDias(dataInicio, dataFim) <= 0}
                      className="w-full h-[45px] text-base mt-3"
                    >
                      Adicionar ao Orçamento
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto -mx-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="px-4 pb-3 text-sm font-medium text-white">MÓVEL</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">TIPO</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">PERÍODO</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">DIÁRIAS</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">VALOR DIÁRIA</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right w-24">QTDE</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">FRETE</th>
                    <th className="px-4 pb-3 text-sm font-medium text-white text-right">TOTAL</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryCart.map((item, index) => (
                    <tr 
                      key={`${item.name}-${index}`}
                      className="border-b border-white/[0.05]"
                    >
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={item.isOwned ? 'text-emerald-400' : 'text-amber-400'}>
                          {item.isOwned ? 'Próprio' : 'Terceiros'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{item.startDate} - {item.endDate}</td>
                      <td className="px-4 py-3 text-right">{item.days}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.rentalValue)}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.freight || 0)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.total)}</td>
                      <td className="py-3 pr-2">
                        <button
                          onClick={() => removeFromInventoryCart(index)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium text-emerald-400">
                    <td colSpan={7} className="px-4 py-3 text-right">Total Geral</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(inventoryCartTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {inventoryCart.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button
                  variant="primary"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Imprimir Orçamento
                </Button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};