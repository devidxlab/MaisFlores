import React from 'react';
import { FlowerItem, UserInfo } from '../types';

interface PrintLayoutProps {
  flowers: FlowerItem[];
  arrangementType: string;
  total: number;
  userInfo: UserInfo;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ 
  flowers, 
  arrangementType, 
  total, 
  userInfo 
}) => {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <div className="print-only bg-white text-gray-800 p-8 max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-8">
        <div>
          <img 
            src="/assets/maisflores.png" 
            alt="Mais Flores" 
            style={{ width: '194px', height: '226px', objectFit: 'contain' }}
          />
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-light mb-2">Orçamento Exclusivo</h1>
          <p className="text-gray-500">Data: {today}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-10">
        {/* Client Info */}
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Cliente</h2>
            <p className="text-xl">{userInfo.name}</p>
            <p className="text-gray-600">{userInfo.phone}</p>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Tipo de Arranjo</h2>
            <p className="text-xl">{arrangementType}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="print-shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-emerald-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm uppercase tracking-wider text-emerald-800 font-medium">Produto</th>
                <th className="py-4 px-6 text-center text-sm uppercase tracking-wider text-emerald-800 font-medium">Qtd</th>
                <th className="py-4 px-6 text-right text-sm uppercase tracking-wider text-emerald-800 font-medium">Valor Unit.</th>
                <th className="py-4 px-6 text-right text-sm uppercase tracking-wider text-emerald-800 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flowers.map((flower, index) => (
                <tr key={index} className="text-gray-700">
                  <td className="py-4 px-6">{flower.name}</td>
                  <td className="py-4 px-6 text-center">{flower.quantity}</td>
                  <td className="py-4 px-6 text-right">R$ {flower.price.toFixed(2)}</td>
                  <td className="py-4 px-6 text-right">R$ {(flower.quantity * flower.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-50">
              <tr className="font-medium text-emerald-800">
                <td colSpan={3} className="py-4 px-6">Total do Arranjo</td>
                <td className="py-4 px-6 text-right">R$ {total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>• Orçamento válido por 7 dias</p>
          <p>• Pagamento: 50% no fechamento e 50% na entrega</p>
          <p>• Prazo de entrega: a combinar</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500">
        <p className="text-sm">Mais Flores • Desde 2013</p>
        <p className="text-sm">Arranjos exclusivos para momentos especiais</p>
      </div>
    </div>
  );
};