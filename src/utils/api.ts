interface OrderPayload {
  userInfo: {
    name: string;
    phone: string;
  };
  arrangementType: string;
  flowers: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string | null;
  }>;
  total: number;
  date: string;
}

export async function sendOrder(payload: OrderPayload): Promise<void> {
  const response = await fetch('https://n8n.clps.pro/webhook/mais-flores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${await response.text()}`);
  }
}