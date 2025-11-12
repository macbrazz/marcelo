import React, { useState, useEffect } from 'react';
import { Trip } from '../types';

interface TripSetupProps {
  isOpen: boolean;
  onTripStart: (trip: Trip) => void;
  onClose: () => void;
}

const TripSetup: React.FC<TripSetupProps> = ({ isOpen, onTripStart, onClose }) => {
  const [destination, setDestination] = useState('');
  const [participants, setParticipants] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Reseta o formulário quando o modal abre
    if (isOpen) {
      setDestination('');
      setParticipants('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim() && participants.trim() && date) {
      onTripStart({ destination, participants, date });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-up relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-3xl text-slate-400 hover:text-slate-600" aria-label="Fechar">
          &times;
        </button>
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Nova Viagem</h1>
        <p className="text-slate-500 text-center mb-8">Preencha os dados para iniciar o controle.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
              Destino
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: São Paulo, SP"
              required
            />
          </div>
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-slate-700">
              Participantes
            </label>
            <input
              type="text"
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: João, Maria"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              Data de Início
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            Iniciar Viagem
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripSetup;
