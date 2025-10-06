// Mock de profissionais com agendas existentes
export const mockProfissionais = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Florista',
    dailyRate: 350.00,
    imageUrl: '/images/joao-silva.jpg',
    bookings: [
      { eventName: 'Casamento B&J', startDate: '2025-11-05', endDate: '2025-11-08' },
      { eventName: 'Evento Corporativo', startDate: '2025-11-20', endDate: '2025-11-22' }
    ]
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    role: 'Montador',
    dailyRate: 280.00,
    imageUrl: '/images/maria-oliveira.jpg',
    bookings: []
  },
  {
    id: 3,
    name: 'Carlos Pereira',
    role: 'Ajudante',
    dailyRate: 200.00,
    imageUrl: '/images/carlos-pereira.jpg',
    bookings: [
      { eventName: 'Aniversário L&P', startDate: '2025-11-10', endDate: '2025-11-10' }
    ]
  }
];