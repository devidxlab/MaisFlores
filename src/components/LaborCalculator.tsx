import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Printer, Trash2, Search } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { Button } from './Button';
import { LaborItem, LaborCalculation, UNITS, UserInfo } from '../types';
import { openPrintWindow } from '../utils/print';
import { mockProfissionais } from '../data/profissionais';

interface LaborCalculatorProps {
  userInfo: UserInfo | null;
}

export const LaborCalculator: React.FC<LaborCalculatorProps> = ({ userInfo }) => {
  // Estados para cada seção
  const [workers, setWorkers] = useState<LaborItem[]>([]);
  const [lodging, setLodging] = useState<LaborItem[]>([]);
  const [food, setFood] = useState<LaborItem[]>([]);
  const [discount, setDiscount] = useState(0);
  // Datas do evento e modal
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [agendaVisivelId, setAgendaVisivelId] = useState<number | null>(null);

  const PROFESSIONAL_OPTIONS = [
    'Florista',
    'Montador',
    'Ajudante'
  ];

  // Cálculo dos totais
  const workersTotal = workers.reduce((sum, item) => sum + item.total, 0);
  const lodgingTotal = lodging.reduce((sum, item) => sum + item.total, 0);
  const foodTotal = food.reduce((sum, item) => sum + item.total, 0);
  const subtotal = workersTotal + lodgingTotal + foodTotal;
  const discountValue = (subtotal * discount) / 100;
  const total = subtotal - discountValue;

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Funções para adicionar novas linhas
  const addWorkerRow = () => {
    setWorkers([...workers, {
      name: '',
      quantity: 0,
      unit: UNITS.DIARIA,
      unitValue: 0,
      total: 0,
      readonlyName: false
    }]);
  };

  const addLodgingRow = () => {
    setLodging([...lodging, {
      name: '',
      quantity: 0,
      unit: UNITS.DIARIA,
      unitValue: 0,
      total: 0
    }]);
  };

  const addFoodRow = () => {
    setFood([...food, {
      name: '',
      quantity: 0,
      unit: UNITS.UND,
      unitValue: 0,
      total: 0
    }]);
  };

  // Funções para remover linhas
  const removeWorkerRow = (index: number) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  const removeLodgingRow = (index: number) => {
    setLodging(lodging.filter((_, i) => i !== index));
  };

  const removeFoodRow = (index: number) => {
    setFood(food.filter((_, i) => i !== index));
  };

  // Funções para atualizar valores
  const updateItem = (
    index: number,
    field: keyof LaborItem,
    value: string | number,
    items: LaborItem[],
    setItems: React.Dispatch<React.SetStateAction<LaborItem[]>>
  ) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitValue') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitValue;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  // Adiciona linhas vazias quando não há nenhuma
  useEffect(() => {
    if (workers.length === 0) addWorkerRow();
    if (lodging.length === 0) addLodgingRow();
    if (food.length === 0) addFoodRow();
  }, [workers.length, lodging.length, food.length]);

  const handlePrint = () => {
    const laborData: LaborCalculation = {
      workers,
      lodging,
      food,
      discount,
      subtotal,
      total
    };
    openPrintWindow(userInfo, null, null, laborData);
  };

  // ===== Fluxo de agendamento (Diárias) =====
  const calcularDias = (): number => {
    if (!dataInicio || !dataFim) return 0;
    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const temSobreposicao = (startA: string, endA: string, startB: string, endB: string): boolean => {
    const aStart = new Date(startA).getTime();
    const aEnd = new Date(endA).getTime();
    const bStart = new Date(startB).getTime();
    const bEnd = new Date(endB).getTime();
    return aStart <= bEnd && bStart <= aEnd;
  };

  const profissionalDisponivelNoPeriodo = (bookings: { startDate: string; endDate: string }[]): boolean => {
    if (!dataInicio || !dataFim) return false;
    return bookings.every(b => !temSobreposicao(dataInicio, dataFim, b.startDate, b.endDate));
  };

  const reservarProfissional = (prof: { id: number; name: string; role: string; dailyRate: number; imageUrl?: string; bookings: { startDate: string; endDate: string }[] }) => {
    const dias = calcularDias();
    if (dias <= 0) return;
    const novoItem: LaborItem = {
      name: prof.name,
      quantity: dias,
      unit: UNITS.DIARIA,
      unitValue: prof.dailyRate,
      total: dias * prof.dailyRate,
      readonlyName: true
    };
    setWorkers(prev => [...prev, novoItem]);
    setShowModal(false);
  };

  // Função para renderizar uma seção
  const renderSection = (
    title: string,
    subtitle: string,
    number: number,
    items: LaborItem[],
    setItems: React.Dispatch<React.SetStateAction<LaborItem[]>>,
    addRow: () => void,
    removeRow: (index: number) => void,
    nameLabel: string,
    sectionTotal: number
  ) => (
    <GlassCard>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            {number}
          </div>
          <div>
            <h2 className="text-base font-medium">{title}</h2>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
        </div>
        {title === 'Diárias' ? (
          <Button
            variant="secondary"
            onClick={() => setShowModal(true)}
            icon={<Search className="w-4 h-4" />}
            className="flex-shrink-0"
            disabled={!dataInicio || !dataFim}
          >
            Buscar e Adicionar Profissionais
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={addRow}
            icon={<Plus className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Nova Linha
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="px-2 pb-2 text-xs font-medium text-white w-[25%]">Profissional</th>
              <th className="px-2 pb-2 text-xs font-medium text-white w-[25%]">Qtde de Diárias</th>
              <th className="px-2 pb-2 text-xs font-medium text-white w-[25%]">Valor Unitário</th>
              <th className="px-2 pb-2 text-xs font-medium text-white w-[25%] text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-white/[0.05]">
                <td className="px-2 py-2 flex items-center">
                  {title === 'Diárias' && item.readonlyName ? (
                    <Input
                      type="text"
                      value={item.name}
                      readOnly
                      className="h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus text-white text-base"
                    />
                  ) : (
                    <select
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value, items, setItems)}
                      className="w-full h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus transition-all duration-300 text-white text-base bg-[#223127] border-none appearance-none focus:ring-2 focus:ring-emerald-400 outline-none"
                      style={{ minHeight: 40, height: 40, lineHeight: '1.5', fontFamily: 'inherit' }}
                    >
                      <option value="" disabled className="text-white/50 bg-[#223127]">Selecione</option>
                      {PROFESSIONAL_OPTIONS.map(option => (
                        <option key={option} value={option} className="text-white bg-[#223127] hover:bg-emerald-600">{option}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0, items, setItems)}
                    min={0}
                    step="1"
                    className="h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus text-white text-base"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={item.unitValue}
                    onChange={(e) => updateItem(index, 'unitValue', parseFloat(e.target.value) || 0, items, setItems)}
                    min={0}
                    step="0.01"
                    className="h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus text-white text-base"
                  />
                </td>
                <td className="px-2 py-2 text-right align-middle">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium text-emerald-400">
              <td colSpan={3} className="px-2 py-2 text-right">Total {title}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(sectionTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </GlassCard>
  );

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Seletores de data do evento */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">⏱</div>
          <div>
            <h2 className="text-base font-medium">Período do Evento</h2>
            <p className="text-xs text-white/60">Defina a data de início e fim para buscar profissionais disponíveis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-medium mb-1">Data de Início</div>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium mb-1">Data de Fim</div>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
        </div>
      </GlassCard>
      {renderSection(
        'Diárias',
        'Profissionais necessários',
        1,
        workers,
        setWorkers,
        addWorkerRow,
        removeWorkerRow,
        'Profissional',
        workersTotal
      )}

      {renderSection(
        'Hospedagens',
        'Acomodação da equipe',
        2,
        lodging,
        setLodging,
        addLodgingRow,
        removeLodgingRow,
        'Hotel',
        lodgingTotal
      )}

      {renderSection(
        'Alimentação',
        'Refeições da equipe',
        3,
        food,
        setFood,
        addFoodRow,
        removeFoodRow,
        'Refeição',
        foodTotal
      )}

      {/* Totais */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            4
          </div>
          <div>
            <h2 className="text-lg font-medium">Resumo do Orçamento</h2>
            <p className="text-sm text-white/60">
              Valores totais e desconto
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Desconto (%)</div>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                label="Desconto"
                min={0}
                max={100}
                step="1"
              />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <p className="text-sm text-white/60">
              Subtotal: {formatCurrency(subtotal)}
            </p>
            <p className="text-sm text-white/60">
              Desconto ({discount}%): {formatCurrency(discountValue)}
            </p>
            <p className="text-lg font-medium text-emerald-400">
              Total Final: {formatCurrency(total)}
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Imprimir Orçamento
            </Button>
          </div>
        </div>
      </GlassCard>
      {/* Modal de busca e reserva de profissionais */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-3xl bg-[#1f2a23] rounded-2xl p-6 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Buscar Profissionais</h3>
                <p className="text-xs text-white/60">Período: {dataInicio || '—'} a {dataFim || '—'} ({calcularDias()} diárias)</p>
              </div>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {mockProfissionais.map((prof) => {
                const disponivel = profissionalDisponivelNoPeriodo(prof.bookings || []);
                return (
                  <div key={prof.id} className="flex items-start justify-between gap-4 p-4 rounded-xl glass-morphism border border-white/10">
                    <div className="flex items-center gap-4">
                      {prof.imageUrl && (
                        <img src={prof.imageUrl} alt={prof.name} className="w-14 h-14 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium">{prof.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${disponivel ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-600/30 text-red-300'}`}>
                            {disponivel ? 'Disponível' : 'Ocupado'}
                          </span>
                        </div>
                        <p className="text-xs text-white/60">{prof.role} • Diária {formatCurrency(prof.dailyRate)}</p>
                        {agendaVisivelId === prof.id && (
                          <div className="mt-2 space-y-1">
                            {prof.bookings && prof.bookings.length > 0 ? (
                              prof.bookings.map((b, idx) => (
                                <div key={idx} className="text-xs text-white/70">{b.eventName}: {b.startDate} a {b.endDate}</div>
                              ))
                            ) : (
                              <div className="text-xs text-white/60">Sem reservas anteriores</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setAgendaVisivelId(agendaVisivelId === prof.id ? null : prof.id)}
                      >
                        Ver Agenda
                      </Button>
                      <Button
                        variant="primary"
                        disabled={!disponivel || !dataInicio || !dataFim}
                        onClick={() => reservarProfissional(prof)}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};