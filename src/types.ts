export type ToolType = 'calculator' | 'inventory' | 'labor' | 'cenography';

export interface FlowerItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  image_url: string | null;
}

export interface ArrangementItem {
  type: string;
  flowers: FlowerItem[];
  total: number;
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  logo_url: string | null;
  eventName: string;
}

export interface LaborWorker {
  name: string;
  quantity: number;
  unit: string;
  unitValue: number;
  total: number;
}

export interface LaborLodging {
  name: string;
  quantity: number;
  unit: string;
  unitValue: number;
  total: number;
}

export interface LaborFood {
  name: string;
  quantity: number;
  unit: string;
  unitValue: number;
  total: number;
}

export interface LaborCalculation {
  workers: LaborWorker[];
  lodging: LaborLodging[];
  food: LaborFood[];
  discount: number;
  subtotal: number;
  total: number;
}

export const UNITS = {
  UND: 'UND',
  MTS: 'MTS',
  KG: 'KG',
  LT: 'LT',
  DIA: 'DIA',
  DIARIA: 'DIÁRIA',
  HR: 'HR',
  PAR: 'PAR',
  CX: 'CX',
  PCT: 'PCT',
  ROL: 'ROL',
  M2: 'M²',
  M3: 'M³'
} as const;

export interface InventoryItem {
  name: string;
  investmentValue: number;
  percentage: number;
  rentalValue: number;
  quantity: number;
  total: number;
}

export interface InventoryBasicItem {
  name: string;
  investmentValue: number;
  percentage: number;
  rentalValue: number;
  image_url?: string | null;
}

export interface InventoryEditItem {
  name: string;
  image_url?: string | null;
}

export interface InventoryCartItem {
  name: string;
  image_url?: string | null;
  rentalValue: number; // valor da diária
  quantity: number;
  startDate: string; // início do evento
  endDate: string;   // fim do evento
  days: number;      // número de dias
  freight?: number;  // frete
  location?: string; // local do evento
  total: number;     // total (aluguel * qtd + frete)
  isOwned: boolean;  // se pertence ao acervo próprio
}

// Tipo genérico para itens de mão de obra usados nas três seções
export interface LaborItem {
  name: string;
  quantity: number;
  unit: string;
  unitValue: number;
  total: number;
  readonlyName?: boolean;
}

export interface ScenographyMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  value: number;
  total: number;
}

export interface CleaningMaterial {
  name: string;
  quantity: number;
  unit: string;
  value: number;
  total: number;
}

export interface ScenographyData {
  wood: ScenographyMaterial;
  materials: ScenographyMaterial[];
  cleaningMaterials: CleaningMaterial[];
  totalWood: number;
  totalMaterials: number;
  totalCleaning: number;
  totalGeneral: number;
}

export const DEFAULT_CLEANING_MATERIALS: CleaningMaterial[] = [
  { name: 'SACO DE LIXO', quantity: 4, unit: 'SC', value: 89.00, total: 356.00 },
  { name: 'DETERGENTE', quantity: 2, unit: 'UND', value: 3.00, total: 6.00 },
  { name: 'DESINFETANTE', quantity: 2, unit: 'UND', value: 6.00, total: 12.00 },
  { name: 'ÁLCOOL', quantity: 2, unit: 'UND', value: 11.99, total: 23.98 },
  { name: 'LIMPA VIDRO', quantity: 2, unit: 'UND', value: 12.99, total: 25.98 },
  { name: 'PAPEL TOALHA', quantity: 10, unit: 'ROLO', value: 6.00, total: 60.00 },
  { name: 'PANO DE CHAO', quantity: 5, unit: 'UND', value: 4.00, total: 20.00 },
  { name: 'FLANELA DE LIMPEZA', quantity: 5, unit: 'UND', value: 3.00, total: 15.00 },
  { name: 'FLOTADOR', quantity: 1, unit: 'LITRO', value: 110.00, total: 110.00 },
  { name: 'PLASTISCO BOLHA', quantity: 1, unit: 'BOBINA', value: 300.00, total: 300.00 },
  { name: 'PLASTISCO FILME', quantity: 1, unit: 'BOBINA', value: 200.00, total: 200.00 },
  { name: 'SACO TRANSPARENTE', quantity: 1, unit: 'BOBINA', value: 150.00, total: 150.00 }
];

export const SCENOGRAPHY_UNITS = {
  MTS: 'MTS',
  UND: 'UND',
  KG: 'KG',
  CX: 'CX',
  SC: 'SC',
  GALAO: 'GALÃO',
  LATA: 'LATA'
} as const;

export const DEFAULT_SCENOGRAPHY_MATERIALS = [
  { name: 'TECIDO DIOLEN', unit: 'MTS', value: 4.00 },
  { name: 'TECIDO OXFORD', unit: 'MTS', value: 16.00 },
  { name: 'PARAFUSO', unit: 'CX', value: 74.00 },
  { name: 'PREGOS', unit: 'SC', value: 14.00 },
  { name: 'ARAMES', unit: 'KG', value: 14.00 },
  { name: 'FITA DUPLA FACE', unit: 'UND', value: 30.00 },
  { name: 'FITA CETIM', unit: 'UND', value: 28.00 },
  { name: 'FITA ISOLANTE', unit: 'UND', value: 5.00 },
  { name: 'FITA CADARÇO', unit: 'MTS', value: 0.25 },
  { name: 'FITA ADESIVA', unit: 'UND', value: 10.00 },
  { name: 'FITILHO', unit: 'UND', value: 16.00 },
  { name: 'THINNER', unit: 'UND', value: 86.00 },
  { name: 'TINTAS', unit: 'GALAO', value: 130.00 },
  { name: 'SPRAY', unit: 'LATA', value: 25.00 },
  { name: 'GRAMPO', unit: 'CX', value: 19.00 },
  { name: 'COLA TUDO', unit: 'UND', value: 28.00 }
];