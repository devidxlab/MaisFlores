import { 
  UserInfo, 
  ArrangementItem, 
  InventoryCartItem, 
  LaborCalculation,
  ScenographyMaterial,
  CleaningMaterial
} from '../types';

// Função para gerar número de orçamento aleatório
const generateBudgetNumber = () => {
  return Math.floor(Math.random() * 900000) + 100000; // Gera número entre 100000 e 999999
};

export const openPrintWindow = (
  userInfo: UserInfo | null,
  arrangements: ArrangementItem[] | null,
  inventoryItems: InventoryCartItem[] | null,
  laborCalculation: LaborCalculation | null,
  showPrices: boolean = true
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  let content = `
    <div class="header">
      ${userInfo?.logo_url ? `<img src="${userInfo.logo_url}" alt="${userInfo.company}" class="logo" />` : ''}
      <div class="company-info">
        <h1>${userInfo?.company || 'Mais Flores'}</h1>
        <p>${userInfo?.name || ''}</p>
        ${userInfo?.eventName ? `<p><strong>Evento:</strong> ${userInfo.eventName}</p>` : ''}
        <p>${userInfo?.phone || ''}</p>
        <p>${userInfo?.email || ''}</p>
      </div>
      <div class="date">
        <p>Data: ${formatDate(new Date())}</p>
      </div>
    </div>
  `;

  if (arrangements && arrangements.length > 0) {
    content += `
      <div class="section">
        <h2>Arranjos</h2>
        ${arrangements.map((arrangement, index) => `
          <div class="arrangement">
            <h3>${arrangement.type} (${arrangement.quantity} unidades)</h3>
            <table>
              <thead>
                <tr>
                  <th>Flor</th>
                  <th>Quantidade</th>
                  ${showPrices ? '<th>Valor Unitário</th>' : ''}
                  ${showPrices ? '<th>Total</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${arrangement.flowers.map(flower => `
                  <tr>
                    <td>${flower.name}</td>
                    <td>${flower.quantity}</td>
                    ${showPrices ? `<td>${formatCurrency(flower.price)}</td>` : ''}
                    ${showPrices ? `<td>${formatCurrency(flower.total)}</td>` : ''}
                  </tr>
                `).join('')}
                ${showPrices ? `
                  <tr class="total">
                    <td colspan="${showPrices ? '3' : '1'}">Total do Arranjo (${arrangement.quantity}x)</td>
                    <td>${formatCurrency(arrangement.unitPrice * arrangement.quantity)}</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        `).join('')}
        ${showPrices ? `
          <div class="total-section">
            <h3>Total Geral: ${formatCurrency(arrangements.reduce((sum, arr) => sum + (arr.unitPrice * arr.quantity), 0))}</h3>
          </div>
        ` : ''}
      </div>
    `;
  }

  if (inventoryItems && inventoryItems.length > 0) {
    const total = inventoryItems.reduce((sum, item) => sum + item.total, 0);
    content += `
      <div class="section">
        <h2>Acervo</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitValue)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">Total</td>
              <td>${formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  if (laborCalculation) {
    const { workers, lodging, food, discount } = laborCalculation;
    const workersTotal = workers.reduce((sum, item) => sum + item.total, 0);
    const lodgingTotal = lodging.reduce((sum, item) => sum + item.total, 0);
    const foodTotal = food.reduce((sum, item) => sum + item.total, 0);
    const subtotal = workersTotal + lodgingTotal + foodTotal;
    const discountValue = (subtotal * discount) / 100;
    const total = subtotal - discountValue;

    content += `
      <div class="section">
        <h2>Mão de Obra</h2>
        <div class="company-info">
          <p><strong>Cliente:</strong> ${userInfo?.name || ''}</p>
          ${userInfo?.eventName ? `<p><strong>Evento:</strong> ${userInfo.eventName}</p>` : ''}
          <p><strong>Telefone:</strong> ${userInfo?.phone || ''}</p>
        </div>

        <h3>Diárias</h3>
        <table>
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${workers.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${formatCurrency(item.unitValue)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="4">Total Diárias</td>
              <td>${formatCurrency(workersTotal)}</td>
            </tr>
          </tbody>
        </table>

        <h3>Hospedagens</h3>
        <table>
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${lodging.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${formatCurrency(item.unitValue)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="4">Total Hospedagens</td>
              <td>${formatCurrency(lodgingTotal)}</td>
            </tr>
          </tbody>
        </table>

        <h3>Alimentação</h3>
        <table>
          <thead>
            <tr>
              <th>Refeição</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${food.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${formatCurrency(item.unitValue)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="4">Total Alimentação</td>
              <td>${formatCurrency(foodTotal)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <table>
            <tr>
              <td>Subtotal</td>
              <td>${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td>Desconto (${discount}%)</td>
              <td>${formatCurrency(discountValue)}</td>
            </tr>
            <tr class="final-total">
              <td>Total</td>
              <td>${formatCurrency(total)}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  const styles = `
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 2px solid #eee;
      }
      
      .logo {
        max-width: 150px;
        max-height: 100px;
        object-fit: contain;
      }
      
      .company-info {
        text-align: center;
        flex: 1;
        margin: 0 20px;
      }
      
      .company-info h1 {
        margin: 0 0 10px 0;
        color: #2F855A;
      }
      
      .company-info p {
        margin: 5px 0;
      }
      
      .date {
        text-align: right;
      }
      
      .section {
        margin-bottom: 40px;
      }
      
      h2 {
        color: #2F855A;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      
      h3 {
        color: #2F855A;
        margin: 20px 0 10px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      th {
        background-color: #f8f8f8;
        font-weight: bold;
      }
      
      .total td {
        font-weight: bold;
        border-top: 2px solid #eee;
      }
      
      .total-section {
        margin-top: 20px;
        text-align: right;
      }
      
      .total-section table {
        width: auto;
        margin-left: auto;
      }
      
      .total-section td {
        padding: 8px 12px;
      }
      
      .final-total td {
        font-weight: bold;
        font-size: 1.2em;
        border-top: 2px solid #eee;
      }
      
      .arrangement {
        margin-bottom: 30px;
      }
      
      @media print {
        body {
          padding: 0;
        }
        
        .header {
          margin-bottom: 20px;
        }
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Orçamento - Mais Flores</title>
        ${styles}
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

export const openInventoryPrintWindow = (
  inventoryItems: InventoryCartItem[],
  totalGeneral: number,
  userInfo: UserInfo | null
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const budgetNumber = generateBudgetNumber();

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Orçamento #${budgetNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #2F855A;
            margin-bottom: 30px;
          }
          .info {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f8f8;
          }
          .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #2F855A;
            text-align: right;
            margin-top: 20px;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
        </style>
      </head>
      <body>
        <h1>Orçamento #${budgetNumber}</h1>
        
        ${userInfo ? `
          <div class="info">
            <p><strong>Cliente:</strong> ${userInfo.name}</p>
            ${userInfo.eventName ? `<p><strong>Evento:</strong> ${userInfo.eventName}</p>` : ''}
            <p><strong>Telefone:</strong> ${userInfo.phone}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>Móvel</th>
              <th>Período</th>
              <th>Dias</th>
              <th>Valor Diária</th>
              <th>Quantidade</th>
              <th>Frete</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.startDate} - ${item.endDate}${item.location ? ` • ${item.location}` : ''}</td>
                <td>${item.days}</td>
                <td>R$ ${item.rentalValue.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>R$ ${(item.freight || 0).toFixed(2)}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" style="text-align: right;"><strong>Total Geral</strong></td>
              <td><strong>R$ ${totalGeneral.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 40px; font-size: 0.9em; color: #666;">
          <p>• Orçamento válido por 7 dias</p>
          <p>• Pagamento: 50% no fechamento e 50% na entrega</p>
          <p>• Prazo de entrega: a combinar</p>
        </div>

        <div style="margin-top: 60px; text-align: center; color: #666; font-size: 0.9em;">
          <p>Mais Flores • Desde 2013</p>
          <p>Arranjos exclusivos para momentos especiais</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  
  // Aguarda o carregamento do conteúdo antes de imprimir
  printWindow.onload = () => {
    printWindow.print();
  };
};

export const openScenographyPrintWindow = (
  wood: ScenographyMaterial,
  materials: ScenographyMaterial[],
  cleaningMaterials: CleaningMaterial[],
  totalGeneral: number,
  userInfo: UserInfo | null
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const today = new Date().toLocaleDateString('pt-BR');

  // Filtra apenas os materiais com quantidade maior que zero
  const materialsToShow = materials.filter(material => material.quantity > 0);
  const cleaningToShow = cleaningMaterials.filter(material => material.quantity > 0);

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Orçamento Cenografia</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            color: #2F855A;
            margin-bottom: 30px;
          }
          .info {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f8f8;
          }
          .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #2F855A;
            text-align: right;
            margin-top: 20px;
          }
          @media print {
            body {
              margin: 20px;
            }
          }
          .logo {
            max-width: 120px;
            max-height: 80px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 24px;">
          ${userInfo?.logo_url ? `<img src="${userInfo.logo_url}" alt="Logo" class="logo" />` : ''}
          <h1>Mais Flores</h1>
          <div class="info">
            <p><strong>Cliente:</strong> ${userInfo?.name || ''}</p>
            ${userInfo?.eventName ? `<p><strong>Evento:</strong> ${userInfo.eventName}</p>` : ''}
            <p><strong>Telefone:</strong> ${userInfo?.phone || ''}</p>
            <p><strong>Data:</strong> ${today}</p>
          </div>
        </div>
        <h2 style="color:#2F855A; border-bottom:2px solid #eee; padding-bottom:10px; margin-bottom:20px;">Orçamento de Cenografia</h2>

        ${wood.quantity > 0 ? `
          <div class="section-title">Madeira</div>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${wood.name}</td>
                <td>${wood.quantity}</td>
                <td>${wood.unit}</td>
                <td>R$ ${wood.value.toFixed(2)}</td>
                <td>R$ ${wood.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        ` : ''}

        ${materialsToShow.length > 0 ? `
          <div class="section-title">Materiais</div>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${materialsToShow.map(material => `
                <tr>
                  <td>${material.name}</td>
                  <td>${material.quantity}</td>
                  <td>${material.unit}</td>
                  <td>R$ ${material.value.toFixed(2)}</td>
                  <td>R$ ${material.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${cleaningToShow.length > 0 ? `
          <div class="section-title">Materiais de Limpeza</div>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cleaningToShow.map(material => `
                <tr>
                  <td>${material.name}</td>
                  <td>${material.quantity}</td>
                  <td>${material.unit}</td>
                  <td>R$ ${material.value.toFixed(2)}</td>
                  <td>R$ ${material.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="total">
          Total Geral: R$ ${totalGeneral.toFixed(2)}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};