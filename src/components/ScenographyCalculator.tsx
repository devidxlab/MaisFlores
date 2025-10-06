import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Printer } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { Button } from './Button';
import { 
  ScenographyMaterial, 
  ScenographyData, 
  CleaningMaterial,
  DEFAULT_CLEANING_MATERIALS,
  DEFAULT_SCENOGRAPHY_MATERIALS,
  SCENOGRAPHY_UNITS, 
  UserInfo 
} from '../types';
import { openScenographyPrintWindow } from '../utils/print';
import { FORNECEDORES } from '../data/fornecedores';

interface ScenographyCalculatorProps {
  userInfo: UserInfo | null;
}

export const ScenographyCalculator: React.FC<ScenographyCalculatorProps> = ({ userInfo }) => {
  // Estado para madeira
  const [wood, setWood] = useState<ScenographyMaterial>({
    id: '1',
    name: 'MADEIRA',
    quantity: 0,
    unit: 'MTS',
    value: 0,
    total: 0
  });

  // Estado para materiais de cenografia
  const [materials, setMaterials] = useState<ScenographyMaterial[]>(
    DEFAULT_SCENOGRAPHY_MATERIALS.map((item, index) => ({
      id: (index + 2).toString(),
      name: item.name,
      quantity: 0,
      unit: item.unit,
      value: item.value,
      total: 0
    }))
  );

  // Estado para materiais de limpeza
  const [cleaningMaterials, setCleaningMaterials] = useState<CleaningMaterial[]>(
    DEFAULT_CLEANING_MATERIALS.map(material => ({
      name: material.name,
      quantity: 0,
      unit: material.unit,
      value: material.value,
      total: 0
    }))
  );

  // ===== Busca de fornecedores (novo fluxo complementar) =====
  const [categoriaFornecedor, setCategoriaFornecedor] = useState<string>('Todas');
  const [fornecedorSelecionadoId, setFornecedorSelecionadoId] = useState<number | null>(null);

  const fornecedoresFiltrados = useMemo(() => {
    if (categoriaFornecedor === 'Todas') return FORNECEDORES;
    return FORNECEDORES.filter(f => f.category === categoriaFornecedor);
  }, [categoriaFornecedor]);

  const fornecedorSelecionado = useMemo(() => {
    return fornecedoresFiltrados.find(f => f.id === fornecedorSelecionadoId) || null;
  }, [fornecedoresFiltrados, fornecedorSelecionadoId]);

  const adicionarItemFornecedorAoOrcamento = (item: { id: string; name: string; unit: string; value: number }, categoria: string) => {
    const genId = `sup-${categoria}-${item.id}-${Date.now()}`;
    if (categoria === 'Cenografia' || categoria === 'Madeira') {
      // Mantemos madeira como linha única; itens de madeira de fornecedores entram nos materiais
      const novoMaterial: ScenographyMaterial = {
        id: genId,
        name: categoria === 'Madeira' ? `MADEIRA - ${item.name}` : item.name,
        quantity: 0,
        unit: item.unit,
        value: item.value,
        total: 0
      };
      setMaterials(prev => [...prev, novoMaterial]);
    } else if (categoria === 'Limpeza') {
      const novoLimpeza: CleaningMaterial = {
        name: item.name,
        quantity: 0,
        unit: item.unit,
        value: item.value,
        total: 0
      };
      setCleaningMaterials(prev => [...prev, novoLimpeza]);
    }
  };

  // Funções para atualizar madeira
  const updateWoodQuantity = (quantity: number) => {
    const newQuantity = quantity || 0;
    setWood(prev => ({
      ...prev,
      quantity: newQuantity,
      total: newQuantity * prev.value
    }));
  };

  const updateWoodValue = (value: number) => {
    const newValue = value || 0;
    setWood(prev => ({
      ...prev,
      value: newValue,
      total: prev.quantity * newValue
    }));
  };

  // Funções para atualizar materiais de cenografia
  const updateMaterialQuantity = (index: number, quantity: number) => {
    const newQuantity = quantity || 0;
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      quantity: newQuantity,
      total: newQuantity * updatedMaterials[index].value
    };
    setMaterials(updatedMaterials);
  };

  const updateMaterialValue = (index: number, value: number) => {
    const newValue = value || 0;
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      value: newValue,
      total: updatedMaterials[index].quantity * newValue
    };
    setMaterials(updatedMaterials);
  };

  // Funções para atualizar materiais de limpeza
  const updateCleaningMaterialQuantity = (index: number, quantity: number) => {
    const newQuantity = quantity || 0;
    const updatedMaterials = [...cleaningMaterials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      quantity: newQuantity,
      total: newQuantity * updatedMaterials[index].value
    };
    setCleaningMaterials(updatedMaterials);
  };

  const updateCleaningMaterialValue = (index: number, value: number) => {
    const newValue = value || 0;
    const updatedMaterials = [...cleaningMaterials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      value: newValue,
      total: updatedMaterials[index].quantity * newValue
    };
    setCleaningMaterials(updatedMaterials);
  };

  // Cálculo dos totais
  const totalWood = wood.total;
  const totalMaterials = materials.reduce((sum, item) => sum + item.total, 0);
  const totalCleaning = cleaningMaterials.reduce((sum, item) => sum + item.total, 0);
  const totalGeneral = totalWood + totalMaterials + totalCleaning;

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para imprimir
  const handlePrint = () => {
    openScenographyPrintWindow(wood, materials, cleaningMaterials, totalGeneral, userInfo);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Buscar Itens de Fornecedores */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            🔎
          </div>
          <h2 className="text-base font-medium">Buscar Itens de Fornecedores</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <div className="text-xs font-medium mb-1">Categoria</div>
            <select
              value={categoriaFornecedor}
              onChange={(e) => setCategoriaFornecedor(e.target.value)}
              className="w-full h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus transition-all text-white text-sm bg-[#223127] border-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="Todas" className="text-white bg-[#223127]">Todas</option>
              <option value="Madeira" className="text-white bg-[#223127]">Madeira</option>
              <option value="Cenografia" className="text-white bg-[#223127]">Cenografia</option>
              <option value="Limpeza" className="text-white bg-[#223127]">Limpeza</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-medium mb-1">Fornecedor</div>
            <select
              value={fornecedorSelecionadoId ?? ''}
              onChange={(e) => setFornecedorSelecionadoId(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-[40px] px-4 py-2 rounded-xl glass-morphism input-focus transition-all text-white text-sm bg-[#223127] border-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="" className="text-white/70 bg-[#223127]">Selecione...</option>
              {fornecedoresFiltrados.map(f => (
                <option key={f.id} value={f.id} className="text-white bg-[#223127]">{f.name} • {f.category}</option>
              ))}
            </select>
          </div>
        </div>

        {fornecedorSelecionado && (
          <div className="space-y-2">
            {fornecedorSelecionado.items.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl glass-morphism border border-white/10">
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-white/60">UND: {item.unit} • Valor: {formatCurrency(item.value)}</div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => adicionarItemFornecedorAoOrcamento(item, fornecedorSelecionado.category)}
                >
                  Adicionar ao Orçamento
                </Button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
      {/* Madeira */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            1
          </div>
          <h2 className="text-base font-medium">MADEIRA</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="px-4 pb-2 text-xs font-medium text-white">Material</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">QTDE</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">UND</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">VALOR</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/[0.05]">
                <td className="px-4 py-2">{wood.name}</td>
                <td className="px-4 py-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={wood.quantity === 0 ? '' : wood.quantity}
                    onChange={(e) => updateWoodQuantity(Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2">{wood.unit}</td>
                <td className="px-4 py-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={wood.value === 0 ? '' : wood.value}
                    onChange={(e) => updateWoodValue(Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(wood.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Materiais de Cenografia */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            2
          </div>
          <h2 className="text-base font-medium">MATERIAIS DE CENOGRAFIA</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="px-4 pb-2 text-xs font-medium text-white">Material</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">QTDE</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">UND</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">VALOR</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr key={material.id} className="border-b border-white/[0.05]">
                  <td className="px-4 py-2">{material.name}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={material.quantity === 0 ? '' : material.quantity}
                      onChange={(e) => updateMaterialQuantity(index, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2">{material.unit}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={material.value === 0 ? '' : material.value}
                      onChange={(e) => updateMaterialValue(index, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(material.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Materiais de Limpeza */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            3
          </div>
          <h2 className="text-base font-medium">MATERIAIS DE LIMPEZA</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="px-4 pb-2 text-xs font-medium text-white">Material</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">QTDE</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">UND</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32">VALOR</th>
                <th className="px-4 pb-2 text-xs font-medium text-white w-32 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cleaningMaterials.map((material, index) => (
                <tr key={index} className="border-b border-white/[0.05]">
                  <td className="px-4 py-2">{material.name}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={material.quantity === 0 ? '' : material.quantity}
                      onChange={(e) => updateCleaningMaterialQuantity(index, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2">{material.unit}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={material.value === 0 ? '' : material.value}
                      onChange={(e) => updateCleaningMaterialValue(index, Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(material.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Total Geral e Impressão */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
            4
          </div>
          <h2 className="text-base font-medium">TOTAL GERAL</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(totalGeneral)}
          </div>
          <Button
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Imprimir
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
};