
import React, { useState } from 'react';
import { TripRecord } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface TripHistoryProps {
  trips: TripRecord[];
  onStartNewTrip: () => void;
  onDeleteTrip: (tripId: number) => void;
}

const ConfirmationModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h2>
        <p className="text-slate-500 mb-6">Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

const TripHistory: React.FC<TripHistoryProps> = ({ trips, onStartNewTrip, onDeleteTrip }) => {
  const [tripToDelete, setTripToDelete] = useState<TripRecord | null>(null);

  const handleDeleteRequest = (record: TripRecord) => {
    setTripToDelete(record);
  };

  const confirmDelete = () => {
    if (tripToDelete) {
      onDeleteTrip(tripToDelete.id);
      setTripToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTripToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
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
              <li key={record.id} className="bg-white p-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-500">{new Date(record.trip.date + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{record.trip.destination}</h3>
                    <p className="text-sm text-slate-600">com {record.trip.participants}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-slate-500">Total Gasto</p>
                    <p className="text-2xl font-extrabold text-indigo-600">R$ {record.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRequest(record)}
                  className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label="Excluir viagem"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {tripToDelete && (
        <ConfirmationModal
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default TripHistory;
