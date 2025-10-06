import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Printer, Check, Trash2, Search, AlertCircle, ArrowRight,
  Calculator, ClipboardList, Box, Users, ArrowLeft, FileText, Ruler,
  LogOut, Settings
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { UserRegistration } from './components/UserRegistration';
import { ProductList } from './components/ProductList';
import { InventoryCalculator } from './components/InventoryCalculator';
import { FlowerItem, UserInfo, ArrangementItem, ToolType } from './types';
import { useFlowers } from './hooks/useFlowers';
import { openPrintWindow } from './utils/print';
import { LaborCalculator } from './components/LaborCalculator';
import { ScenographyCalculator } from './components/ScenographyCalculator';
import flowersJson from './data/flowers.json';

const tools = [
  { id: 'calculator', name: 'Calculadora de Flores', icon: Calculator },
  { id: 'inventory', name: 'Calculadora de Acervo', icon: Box },
  { id: 'cenography', name: 'Calculadora de Cenografia', icon: Ruler },
  { id: 'labor', name: 'Calculadora de Mão de Obra', icon: Users }
] as const;

function App() {
  // User registration state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Step control
  const [currentStep, setCurrentStep] = useState<'arrangement' | 'calculator'>('arrangement');
  
  // Arrangement step state
  const [arrangementType, setArrangementType] = useState('Mesa');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [flowers, setFlowers] = useState<FlowerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectingType, setIsSelectingType] = useState(true);
  
  // Calculator step state
  const [arrangements, setArrangements] = useState<ArrangementItem[]>([]);
  const [arrangementQuantity, setArrangementQuantity] = useState(1);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { flowers: availableFlowers, loading: loadingFlowers } = useFlowers();

  // Tool selection state
  const [currentTool, setCurrentTool] = useState<ToolType>('calculator');

  const [showFlowerAdmin, setShowFlowerAdmin] = useState(false);

  // Telefones autorizados para o menu secreto
  const ADMIN_PHONES = ['5567991257171', '5511997252150', '6791257171', '11997252150'];
  function normalizePhone(phone) {
    return phone.replace(/^55/, '').replace(/^0+/, '').replace(/\D/g, '');
  }
  const isAdmin = userInfo && ADMIN_PHONES.includes(userInfo.phone) || (userInfo && ADMIN_PHONES.includes(normalizePhone(userInfo.phone)));

  const [flowersAdmin, setFlowersAdmin] = useState(() => {
    const saved = localStorage.getItem('flowersAdmin');
    return saved ? JSON.parse(saved) : [...flowersJson.flowers];
  });

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem('flowersAdmin', JSON.stringify(flowersAdmin));
  }, [flowersAdmin]);

  // Funções de gestão de flores
  const handleFlowerChange = (id, field, value) => {
    setFlowersAdmin(flowersAdmin => flowersAdmin.map(f => f.id === id ? { ...f, [field]: value } : f));
  };
  const handleRemoveFlower = (id) => {
    setFlowersAdmin(flowersAdmin => flowersAdmin.filter(f => f.id !== id));
  };
  const handleAddFlower = () => {
    const nextId = Math.max(0, ...flowersAdmin.map(f => f.id)) + 1;
    setFlowersAdmin([...flowersAdmin, { id: nextId, name: '', price: 0, image_url: '' }]);
  };
  // Upload de imagem
  const handleImageUpload = (id, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Salva a imagem em public/assets
      const fileName = `flower_${id}_${Date.now()}.${file.name.split('.').pop()}`;
      fetch(`/assets/${fileName}`, {
        method: 'PUT',
        body: file
      }).then(() => {
        handleFlowerChange(id, 'image_url', `/assets/${fileName}`);
      });
    };
    reader.readAsArrayBuffer(file);
  };
  // Baixar JSON atualizado
  const handleDownloadJson = () => {
    const data = JSON.stringify({ flowers: flowersAdmin }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowers.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addFlower = (flower: { name: string; price: number; image_url: string | null }) => {
    const total = flower.price * currentQuantity;
    setFlowers([...flowers, {
      name: flower.name,
      quantity: currentQuantity,
      price: flower.price,
      total: total,
      image_url: flower.image_url
    }]);
    setCurrentQuantity(1);
  };

  const removeFlower = (index: number) => {
    setFlowers(flowers.filter((_, i) => i !== index));
  };

  const arrangementTotal = flowers.reduce((sum, flower) => sum + (flower.quantity * flower.price), 0);

  const startArrangement = () => {
    setIsSelectingType(false);
  };

  const saveArrangement = () => {
    if (flowers.length === 0) return;
    
    setArrangements([...arrangements, {
      type: arrangementType,
      quantity: arrangementQuantity,
      unitPrice: arrangementTotal,
      flowers: [...flowers]
    }]);

    // Reset arrangement form
    setFlowers([]);
    setArrangementType('Mesa');
    setCurrentQuantity(1);
    setArrangementQuantity(1);
    setIsSelectingType(true);
    
    // Move to calculator step
    setCurrentStep('calculator');
  };

  const removeArrangement = (index: number) => {
    setArrangements(arrangements.filter((_, i) => i !== index));
  };

  const totalGeneral = arrangements.reduce((sum, arr) => sum + (arr.unitPrice * arr.quantity), 0);

  const handlePrint = (showPrices: boolean = true) => {
    openPrintWindow(userInfo, arrangements, null, null, showPrices);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex-1 relative">
        {/* Watermark - Only show when authenticated */}
        {userInfo && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50 z-0">
            <img src="/assets/maisflores.png" alt="Mais Flores" style={{ width: '194px', height: '226px', objectFit: 'contain' }} />
          </div>
        )}

        {/* Header with Tools Menu - Only show when authenticated */}
        {userInfo && (
          <div className="mb-8 relative z-10">
            <GlassCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <nav className="flex items-center gap-2">
                    {tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => setCurrentTool(tool.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-colors duration-200
                          ${currentTool === tool.id 
                            ? 'bg-emerald-500 text-white' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <tool.icon className="w-4 h-4" />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
                {/* User Profile Picture, Settings (admin) e Logout */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-white/60">{userInfo?.name}</div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    {userInfo?.profilePicture ? (
                      <img
                        src={userInfo.profilePicture}
                        alt={userInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white">
                        {userInfo?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setShowFlowerAdmin(true)}
                      className="ml-1 p-2 rounded-xl glass-morphism hover:bg-white/[0.08] transition-colors duration-200"
                      title="Gestão de Flores"
                    >
                      <Settings className="w-5 h-5 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => setUserInfo(null)}
                    className="ml-2 p-2 rounded-xl glass-morphism hover:bg-white/[0.08] transition-colors duration-200"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {!userInfo ? (
            <div className="flex flex-col items-center">
              <img 
                src="/assets/maisflores.png" 
                alt="Mais Flores" 
                style={{ maxHeight: '120px', width: 'auto', objectFit: 'contain', marginBottom: 24 }}
                className="mx-auto"
              />
              <UserRegistration onSubmit={setUserInfo} key="registration" />
            </div>
          ) : currentTool === 'calculator' ? (
            <motion.div 
              className="space-y-4 md:space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              key="calculator"
            >
              <div className="grid lg:grid-cols-[480px_1fr] gap-4">
                {currentStep === 'arrangement' ? (
                  <>
                    {/* Arrangement Step */}
                    <div>
                      <GlassCard className="h-full">
                <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                              1
                            </div>
                            <div>
                              <h2 className="text-lg font-medium">Monte seu Arranjo</h2>
                              <p className="text-sm text-white/60">
                                {flowers.length === 0 
                                  ? "Primeiro, escolha o tipo de arranjo que deseja montar"
                                  : "Adicione as flores ao seu arranjo"
                                }
                              </p>
                            </div>
                          </div>

                    <div className="space-y-4">
                            {isSelectingType ? (
                              <div>
                                <div className="text-sm font-medium mb-2">Escolha o Tipo de Arranjo</div>
                                <Input
                                  type="select"
                                  label="Tipo de Arranjo"
                                  value={arrangementType}
                                  onChange={(e) => setArrangementType(e.target.value)}
                                  options={[
                                    'Mesa',
                                    'Recepção',
                                    'Mesa de Bolo',
                                    'Mesa de Buffet',
                                    'Estantes/Cantos/Lounges',
                                    'Pendentes/Aéreos',
                                    'Arranjos sob Medida'
                                  ]}
                                />
                                <div className="flex justify-end mt-4">
                                  <Button
                                    variant="primary"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    onClick={startArrangement}
                                  >
                                    Começar Montagem
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                                  <div className="text-sm">Tipo de Arranjo:</div>
                                  <div className="font-medium">{arrangementType}</div>
                                </div>
                                
                                <div>
                                  <div className="text-sm font-medium mb-2">Adicione as Flores ao Arranjo</div>
                                  <div className="space-y-4">
                                    <div className="flex gap-4">
                                      <div className="flex-1">
                                        <Input
                                          placeholder="Digite o nome da flor..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          icon={<Search className="w-4 h-4" />}
                                          className="h-[38px] !py-0"
                                        />
                                      </div>
                                      <div className="flex items-center">
                                        <Button
                                          variant="secondary"
                                          onClick={() => setIsSelectingType(true)}
                                          className="h-[38px] px-4"
                                          icon={<ArrowLeft className="w-4 h-4" />}
                                        >
                                          Voltar
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="pr-2">
                                      <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        <ProductList
                                          flowers={availableFlowers}
                                          loading={loadingFlowers}
                                          searchTerm={searchTerm}
                                          onSelect={addFlower}
                                          quantity={currentQuantity}
                                          setQuantity={setCurrentQuantity}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                    </div>
                  </GlassCard>
                </div>

                    {/* Flowers List */}
                    <div>
                      <GlassCard className="h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                            2
                          </div>
                          <div>
                            <h2 className="text-lg font-medium">Seu Arranjo Atual</h2>
                            <p className="text-sm text-white/60">
                              {flowers.length === 0 
                                ? "Primeiro escolha o tipo de arranjo ao lado"
                                : "Confira as flores selecionadas e finalize este arranjo"
                              }
                            </p>
                          </div>
                    </div>

                  <AnimatePresence mode="popLayout">
                          {flowers.length > 0 ? (
                            <div className="space-y-4">
                              <div className="overflow-x-auto -mx-4">
                            <table className="w-full">
                              <thead>
                                <tr className="text-left border-b border-white/10">
                                      <th className="px-4 pb-3 text-sm font-medium text-white">Flor</th>
                                      <th className="px-4 pb-3 text-sm font-medium text-white w-20">Qtd</th>
                                      <th className="px-4 pb-3 text-sm font-medium text-white text-right">Preço Un.</th>
                                      <th className="px-4 pb-3 text-sm font-medium text-white text-right">Total</th>
                                      <th className="w-12"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {flowers.map((flower, index) => (
                                  <motion.tr 
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-white/[0.05]"
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                                          <img
                                            src={flower.image_url || 'https://via.placeholder.com/40'}
                                            alt={flower.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="font-medium text-sm">{flower.name}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{flower.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(flower.price)}</td>
                                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(flower.price * flower.quantity)}</td>
                                    <td className="py-3 pr-2">
                                      <button
                                        onClick={() => removeFlower(index)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </motion.tr>
                                ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="font-medium text-emerald-400">
                                      <td colSpan={3} className="px-4 py-3">Total do Arranjo</td>
                                      <td className="px-4 py-3 text-right">{formatCurrency(arrangementTotal)}</td>
                                  <td></td>
                                </tr>
                                  </tfoot>
                            </table>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm font-medium mb-2">3. Quantidade deste Arranjo</div>
                                  <Input
                                    type="number"
                                    label="Quantidade"
                                    min={1}
                                    value={arrangementQuantity}
                                    onChange={(e) => setArrangementQuantity(parseInt(e.target.value) || 1)}
                                  />
                                  <p className="text-xs text-white/60 mt-1">Quantas unidades deste mesmo arranjo você deseja?</p>
                                </div>
                                <div className="flex flex-col justify-end">
                                  <Button
                                    variant="primary"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    onClick={saveArrangement}
                                  >
                                    Salvar e Continuar
                                  </Button>
                                  <p className="text-xs text-white/60 mt-1">
                                    Você poderá adicionar mais arranjos diferentes depois
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-sm text-white/60">
                              Selecione o tipo de arranjo para começar
                            </div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Calculator Step */}
                    <div className="lg:col-span-2">
                      <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                            3
                          </div>
                          <div>
                            <h2 className="text-lg font-medium">Calculadora de Flores</h2>
                            <p className="text-sm text-white/60">
                              Aqui estão todos os seus arranjos. Você pode adicionar mais arranjos diferentes ou finalizar o orçamento.
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto -mx-4">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left border-b border-white/10">
                                <th className="px-4 pb-3 text-sm font-medium text-white">Tipo de Arranjo</th>
                                <th className="px-4 pb-3 text-sm font-medium text-white w-20">Qtd</th>
                                <th className="px-4 pb-3 text-sm font-medium text-white text-right">Valor Un.</th>
                                <th className="px-4 pb-3 text-sm font-medium text-white text-right">Total</th>
                                <th className="w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {arrangements.map((arrangement, index) => (
                                <motion.tr 
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-b border-white/[0.05]"
                                >
                                  <td className="px-4 py-3 font-medium text-sm">{arrangement.type}</td>
                                  <td className="px-4 py-3 text-sm">{arrangement.quantity}</td>
                                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(arrangement.unitPrice)}</td>
                                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(arrangement.quantity * arrangement.unitPrice)}</td>
                                  <td className="py-3 pr-2">
                                    <button
                                      onClick={() => removeArrangement(index)}
                                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="font-medium text-emerald-400">
                                <td colSpan={3} className="px-4 py-3">Total Geral</td>
                                <td className="px-4 py-3 text-right">{formatCurrency(totalGeneral)}</td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          <div className="flex flex-col">
                            <Button
                              variant="secondary"
                              icon={<Plus className="w-4 h-4" />}
                              onClick={() => setCurrentStep('arrangement')}
                            >
                              Adicionar Novo Arranjo
                            </Button>
                            <p className="text-xs text-white/60 mt-1">
                              Monte um arranjo diferente dos anteriores
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="primary"
                              icon={<Printer className="w-4 h-4" />}
                              onClick={() => handlePrint(true)}
                              disabled={arrangements.length === 0}
                            >
                              Imprimir Orçamento
                            </Button>
                            <Button
                              variant="secondary"
                              icon={<FileText className="w-4 h-4" />}
                              onClick={() => handlePrint(false)}
                              disabled={arrangements.length === 0}
                            >
                              Imprimir Receita
                            </Button>
                            <p className="text-xs text-white/60 mt-1">
                              Gerar orçamento ou receita com todos os arranjos
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : currentTool === 'inventory' ? (
            <InventoryCalculator userInfo={userInfo} />
          ) : currentTool === 'cenography' ? (
            <ScenographyCalculator userInfo={userInfo} />
          ) : currentTool === 'labor' ? (
            <LaborCalculator userInfo={userInfo} />
          ) : (
            <InventoryCalculator userInfo={userInfo} />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`
                glass-morphism rounded-2xl p-4 flex items-center gap-3
                ${notification.type === 'success' ? 'text-emerald-400' : 'text-red-400'}
              `}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-lg">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de gestão de flores (a ser implementado) */}
        {showFlowerAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-[#223127] rounded-2xl p-8 shadow-2xl max-w-6xl w-full relative">
              <button
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white"
                onClick={() => setShowFlowerAdmin(false)}
                title="Fechar"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" /> Gestão de Flores
              </h2>
              <div className="flex flex-wrap gap-6 justify-start items-stretch overflow-y-auto max-h-[70vh] pb-4">
                {flowersAdmin.map(flower => (
                  <div key={flower.id} className="bg-[#2c3f2d] rounded-xl p-4 flex flex-col gap-3 min-w-[260px] max-w-[320px] flex-1 shadow border border-white/5 relative">
                    <button
                      onClick={() => handleRemoveFlower(flower.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-500/20 text-red-400"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/60">Nome</label>
                      <input
                        className="w-full bg-transparent border-b border-white/20 focus:border-emerald-400 outline-none text-white px-1"
                        value={flower.name}
                        onChange={e => handleFlowerChange(flower.id, 'name', e.target.value)}
                        placeholder="Nome da flor"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/60">Preço</label>
                      <input
                        type="number"
                        className="w-full bg-transparent border-b border-white/20 focus:border-emerald-400 outline-none text-white px-1"
                        value={flower.price}
                        onChange={e => handleFlowerChange(flower.id, 'price', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                        placeholder="Preço"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-white/60">Imagem</label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-full bg-transparent border-b border-white/20 focus:border-emerald-400 outline-none text-white px-1"
                          value={flower.image_url || ''}
                          onChange={e => handleFlowerChange(flower.id, 'image_url', e.target.value)}
                          placeholder="URL da imagem"
                        />
                        <label className="ml-2 cursor-pointer text-xs bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded text-white">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) handleImageUpload(flower.id, e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>
                      {flower.image_url && (
                        <img src={flower.image_url} alt={flower.name} className="w-full h-32 object-cover rounded mt-1 border border-white/10" />
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleAddFlower}
                  className="flex flex-col items-center justify-center gap-2 min-w-[260px] max-w-[320px] flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl p-4 shadow border border-white/10 transition-colors duration-200"
                  style={{ minHeight: 220 }}
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-medium">Nova Flor</span>
                </button>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow"
                >
                  <FileText className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;