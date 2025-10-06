import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { Button } from './Button';
import { UserInfo } from '../types';
import { validateWhatsAppNumber, fetchWhatsAppProfile } from '../services/whatsapp';

interface UserRegistrationProps {
  onSubmit: (userInfo: UserInfo) => void;
}

const DDD_LIST = [
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
];

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [eventName, setEventName] = useState('');
  const [phone, setPhone] = useState('67');
  const [eventDate, setEventDate] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setPhone(phone.slice(0, 2) + value);
    }
  };

  const handleDDDChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPhone(e.target.value + phone.slice(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !eventName || !phone || !eventDate) return;
    setValidationError(null);
    setValidating(true);

    // Garante número móvel com dígito 9
    const phoneWithNine = phone.slice(0, 2) + '9' + phone.slice(2);

    const exists = await validateWhatsAppNumber(phoneWithNine);
    setValidating(false);

    if (!exists) {
      setValidationError('Este número não possui WhatsApp. Verifique e tente novamente.');
      return;
    }

    // Opcional: buscar foto de perfil do WhatsApp
    let profilePicture: string | null = null;
    try {
      const profile = await fetchWhatsAppProfile(phoneWithNine);
      profilePicture = profile?.picture ?? null;
    } catch {}

    const userInfo: any = {
      name,
      phone: phoneWithNine,
      email: '',
      company: '',
      logo_url: null,
      eventName,
      profilePicture
    };
    onSubmit(userInfo as UserInfo);
  };

  // Função para calcular a data mínima (hoje)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto h-full flex items-center"
    >
      <GlassCard className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Nome Completo e Data do Evento na primeira linha, Nome do Evento na segunda */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                required
                icon={<User className="w-5 h-5 text-white" />}
              />
              <Input
                type="date"
                label="Data do Evento"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={getMinDate()}
                required
              />
            </div>
            <div>
              <Input
                label="Nome do Evento"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Digite o nome do evento"
                required
                icon={<Check className="w-5 h-5 text-white" />}
              />
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">WhatsApp</div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <select 
                  value={phone.slice(0, 2)}
                  onChange={handleDDDChange}
                  className="w-full px-3 py-3 rounded-xl glass-morphism input-focus transition-all duration-500 text-white text-base appearance-none bg-[length:16px] bg-[right_8px_center] bg-no-repeat cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                  }}
                >
                  {DDD_LIST.map(option => (
                    <option key={option} value={option} className="bg-[#364f37]">{option}</option>
                  ))}
                </select>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Phone className="w-4 h-4 text-white" />
                    <span className="text-white/80 select-none text-sm">9</span>
                  </div>
                  <input
                    type="text"
                    value={phone.slice(2)}
                    onChange={handlePhoneChange}
                    placeholder="Digite os 8 dígitos"
                    required
                    maxLength={8}
                    className="w-full pl-12 pr-3 py-3 rounded-xl glass-morphism input-focus transition-all duration-500 placeholder-white/30 text-white text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={!name || !eventName || !phone || !eventDate || validating}
          >
            {'Começar Orçamento'}
          </Button>
          {validationError && (
            <div className="mt-2 text-sm text-red-400">{validationError}</div>
          )}
        </form>
      </GlassCard>
    </motion.div>
  );
};