import React, { useState, useEffect } from 'react';
import { Trip, Vehicle, BudgetMethod } from '../types';
import { PlusIcon, TrashIcon, CheckIcon } from './icons';

interface TripSetupProps {
  isOpen: boolean;
  onTripStart: (trip: Trip) => void;
  onClose: () => void;
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  onDeleteVehicle: (id: number) => void;
}

const TripSetup: React.FC<TripSetupProps> = ({ 
    isOpen, 
    onTripStart, 
    onClose, 
    vehicles, 
    onAddVehicle,
    onDeleteVehicle
}) => {
  const [destination, setDestination] = useState('');
  const [participants, setParticipants] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [budget, setBudget] = useState('');
  const [budgetMethod, setBudgetMethod] = useState<BudgetMethod>('Pix');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
  
  // Estado para o modal interno de cadastro de veículo
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  useEffect(() => {
    // Reseta o formulário quando o modal abre
    if (isOpen) {
      setDestination('');
      setParticipants('');
      setDate(new Date().toISOString().split('T')[0]);
      setBudget('');
      setBudgetMethod('Pix');
      setSelectedVehicleId('');
      setIsAddingVehicle(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim() && participants.trim() && date && budget) {
      const selectedVehicle = vehicles.find(v => v.id === Number(selectedVehicleId));
      
      onTripStart({ 
        destination, 
        participants, 
        date,
        budget: parseFloat(budget),
        budgetMethod,
        vehicle: selectedVehicle
      });
    }
  };

  const handleSaveVehicle = () => {
      if (newVehicleModel && newVehiclePlate) {
          onAddVehicle({ model: newVehicleModel, plate: newVehiclePlate });
          setNewVehicleModel('');
          setNewVehiclePlate('');
          setIsAddingVehicle(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-up relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-3xl text-slate-400 hover:text-slate-600" aria-label="Fechar">
          &times;
        </button>
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Nova Viagem</h1>
        <p className="text-slate-500 text-center mb-6">Preencha os dados para iniciar.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-slate-700">
              Destino
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
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
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
              placeholder="Ex: João, Maria"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                Data de Início
                </label>
                <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                required
                />
            </div>
            <div>
                <label htmlFor="budget" className="block text-sm font-medium text-slate-700">
                Aporte (R$)
                </label>
                <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                placeholder="0,00"
                step="0.01"
                required
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Forma do Aporte</label>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setBudgetMethod('Pix')}
                    className={`flex-1 py-2 px-3 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                        budgetMethod === 'Pix' 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    Pix
                    {budgetMethod === 'Pix' && <CheckIcon className="w-4 h-4" />}
                </button>
                <button
                    type="button"
                    onClick={() => setBudgetMethod('Espécie')}
                    className={`flex-1 py-2 px-3 rounded-md border flex items-center justify-center gap-2 transition-colors ${
                        budgetMethod === 'Espécie' 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    Espécie
                    {budgetMethod === 'Espécie' && <CheckIcon className="w-4 h-4" />}
                </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Veículo Utilizado
            </label>
            
            {!isAddingVehicle ? (
                <div className="flex gap-2">
                    <select
                        value={selectedVehicleId}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedVehicleId(val === '' ? '' : Number(val));
                        }}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    >
                        <option value="">Nenhum veículo</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.model} ({v.plate})</option>
                        ))}
                    </select>
                    <button 
                        type="button"
                        onClick={() => setIsAddingVehicle(true)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                        title="Adicionar Veículo"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                    {selectedVehicleId && (
                        <button 
                            type="button"
                            onClick={() => {
                                if(window.confirm("Deseja excluir este veículo?")) {
                                    onDeleteVehicle(Number(selectedVehicleId));
                                    setSelectedVehicleId('');
                                }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            title="Excluir Veículo Selecionado"
                        >
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Novo Veículo</p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Modelo (ex: Fiat Uno)"
                            value={newVehicleModel}
                            onChange={(e) => setNewVehicleModel(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Placa (ex: ABC-1234)"
                            value={newVehiclePlate}
                            onChange={(e) => setNewVehiclePlate(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm uppercase"
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                type="button" 
                                onClick={() => setIsAddingVehicle(false)}
                                className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSaveVehicle}
                                disabled={!newVehicleModel || !newVehiclePlate}
                                className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 mt-6"
          >
            Iniciar Viagem
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripSetup;