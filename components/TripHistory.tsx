
import React from 'react';
import { TripRecord } from '../types';
import { PlusIcon, TrashIcon, CarIcon, BuildingIcon, DatabaseIcon } from './icons';

interface TripHistoryProps {
  trips: TripRecord[];
  onStartNewTrip: () => void;
  onDeleteTrip: (tripId: number) => void;
  onSelectTrip: (tripRecord: TripRecord) => void;
  onOpenCompanySettings: () => void;
  onOpenBackup: () => void;
}

const TripHistory: React.FC<TripHistoryProps> = ({ 
    trips, 
    onStartNewTrip, 
    onDeleteTrip, 
    onSelectTrip,
    onOpenCompanySettings,
    onOpenBackup
}) => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md px-4 pb-4 sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Minhas Viagens</h1>
          <div className="flex gap-2">
             <button
                onClick={onOpenBackup}
                className="p-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 transition"
                title="Backup e Restauração"
                aria-label="Backup e Restauração"
              >
                <DatabaseIcon className="w-5 h-5" />
              </button>
             <button
                onClick={onOpenCompanySettings}
                className="p-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 transition"
                title="Configurar Empresa"
                aria-label="Configurar Empresa"
              >
                <BuildingIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onStartNewTrip}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition text-sm"
                aria-label="Iniciar nova viagem"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nova</span>
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {trips.length === 0 ? (
          <div className="text-center py-20 px-4 border-2 border-dashed border-slate-300 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-slate-700">Nenhuma viagem registrada.</h2>
            <p className="text-slate-500 mt-2">Clique em "Nova" para começar a registrar suas despesas.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {[...trips].reverse().map((record) => {
               const budget = record.trip.budget || 0;
               const balance = budget - record.total;
               
               return (
                  <li 
                    key={record.id} 
                    onClick={() => onSelectTrip(record)}
                    className="bg-white p-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer active:bg-slate-50 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-slate-500">{new Date(record.trip.date + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <h3 className="text-xl font-bold text-slate-800">{record.trip.destination}</h3>
                        <p className="text-sm text-slate-600 mb-2">com {record.trip.participants}</p>
                        
                        {record.trip.vehicle && (
                           <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 py-1 px-2 rounded-md w-fit mt-1 mb-2">
                               <CarIcon className="w-3.5 h-3.5" />
                               <span>{record.trip.vehicle.model} ({record.trip.vehicle.plate})</span>
                           </div>
                        )}

                        <div className="flex gap-4 text-sm mt-3">
                           <div>
                               <p className="text-xs text-slate-400 uppercase">
                                  Aporte {record.trip.budgetMethod ? `(${record.trip.budgetMethod})` : ''}
                               </p>
                               <p className="font-semibold text-slate-700">R$ {budget.toFixed(2).replace('.', ',')}</p>
                           </div>
                           <div>
                               <p className="text-xs text-slate-400 uppercase">Saldo</p>
                               <p className={`font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>R$ {balance.toFixed(2).replace('.', ',')}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                         <div className="text-right">
                          <p className="text-xs text-slate-500">Total Gasto</p>
                          <p className="text-xl font-extrabold text-orange-600">R$ {record.total.toFixed(2).replace('.', ',')}</p>
                        </div>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.')) {
                                    onDeleteTrip(record.id);
                                }
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Excluir viagem"
                            >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </li>
               );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default TripHistory;
