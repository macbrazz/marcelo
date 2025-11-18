
import React from 'react';
import { TripRecord } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface TripHistoryProps {
  trips: TripRecord[];
  onStartNewTrip: () => void;
  onDeleteTrip: (tripId: number) => void;
  onSelectTrip: (tripRecord: TripRecord) => void;
}

const TripHistory: React.FC<TripHistoryProps> = ({ trips, onStartNewTrip, onDeleteTrip, onSelectTrip }) => {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md px-4 pb-4 sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Minhas Viagens</h1>
          <button
            onClick={onStartNewTrip}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
            aria-label="Iniciar nova viagem"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nova Viagem</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {trips.length === 0 ? (
          <div className="text-center py-20 px-4 border-2 border-dashed border-slate-300 rounded-lg mt-8">
            <h2 className="text-xl font-semibold text-slate-700">Nenhuma viagem registrada.</h2>
            <p className="text-slate-500 mt-2">Clique em "Nova Viagem" para começar a registrar suas despesas.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {[...trips].reverse().map((record) => (
              <li 
                key={record.id} 
                onClick={() => onSelectTrip(record)}
                className="bg-white p-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer active:bg-slate-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">{new Date(record.trip.date + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{record.trip.destination}</h3>
                    <p className="text-sm text-slate-600">com {record.trip.participants}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Gasto</p>
                      <p className="text-2xl font-extrabold text-indigo-600">R$ {record.total.toFixed(2).replace('.', ',')}</p>
                    </div>
                     <button
                        onClick={(e) => {
                            e.stopPropagation(); // Impede que o clique no lixo abra a viagem
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
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default TripHistory;
