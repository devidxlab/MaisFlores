interface WhatsAppValidationResponse {
  exists: boolean;
  jid: string;
  name: string;
  number: string;
}

interface WhatsAppProfileResponse {
  wuid: string;
  name: string;
  numberExists: boolean;
  picture: string | null;
  status: string;
  isBusiness: boolean;
}

export const validateWhatsAppNumber = async (phone: string): Promise<boolean> => {
  try {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona o código do país (55) se não estiver presente
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const response = await fetch('https://evo.sofia.ms/chat/whatsappNumbers/cleverson-pompeu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '4DBE534E828C-4787-9D2E-6FD8C94AB1DC'
      },
      body: JSON.stringify({
        numbers: [fullPhone]
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao validar WhatsApp');
    }

    const data = await response.json() as WhatsAppValidationResponse[];
    
    // Retorna true se o primeiro número existe no WhatsApp
    return data[0]?.exists ?? false;
  } catch (error) {
    console.error('Erro ao validar WhatsApp:', error);
    return false;
  }
};

export const fetchWhatsAppProfile = async (phone: string): Promise<WhatsAppProfileResponse | null> => {
  try {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona o código do país (55) se não estiver presente
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const response = await fetch('https://evo.sofia.ms/chat/fetchProfile/cleverson-pompeu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '4DBE534E828C-4787-9D2E-6FD8C94AB1DC'
      },
      body: JSON.stringify({
        number: fullPhone
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar perfil do WhatsApp');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar perfil do WhatsApp:', error);
    return null;
  }
}; 