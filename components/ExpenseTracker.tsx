
import React, { useState } from 'react';
import { Trip, Expense, ExpenseCategory } from '../types';
import { getCategoryIcon, CameraIcon, PlusIcon, ArrowLeftIcon, CarIcon } from './icons';
import Camera from './Camera';

interface ExpenseTrackerProps {
  trip: Trip;
  expenses: Expense[];
  onAddExpense?: (expense: Omit<Expense, 'id'>) => void;
  onShowReportModal: () => void;
  readOnly?: boolean;
  onBack?: () => void;
}

const AddExpenseForm: React.FC<{
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.ALIMENTACAO);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (imageDataUrl: string) => {
    setReceipt(imageDataUrl);
    setShowCamera(false); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && category) {
      onAdd({
        amount: parseFloat(amount),
        category,
        receipt: receipt || undefined, 
      });
    } else {
      alert('Por favor, preencha pelo menos o valor e a categoria.');
    }
  };

  if (showCamera) {
    return <Camera onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative animate-fade-in-up">
        <h3 className="text-xl font-bold mb-4">Adicionar Despesa</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              placeholder="0,00"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-2"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-2"
            >
              {Object.values(ExpenseCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nota Fiscal (Opcional)</label>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CameraIcon className="w-5 h-5" />
              {receipt ? 'Nota fiscal capturada' : 'Capturar com a Câmera'}
            </button>
            {receipt && <img src={receipt} alt="Preview" className="mt-2 rounded-md max-h-40 mx-auto" />}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  trip,
  expenses,
  onAddExpense,
  onShowReportModal,
  readOnly = false,
  onBack
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budget = trip.budget || 0;
  const balance = budget - total;

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <header className="bg-white shadow-sm px-4 pb-4 sticky top-0 z-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          {readOnly && onBack && (
             <button 
               onClick={onBack}
               className="mt-1 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
               aria-label="Voltar"
             >
               <ArrowLeftIcon className="w-6 h-6" />
             </button>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{readOnly ? 'Histórico' : 'Em andamento'}</p>
                    <h1 className="text-xl font-bold text-indigo-900 leading-tight">{trip.destination}</h1>
                </div>
                {trip.vehicle && (
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs text-slate-600">
                        <CarIcon className="w-3 h-3" />
                        <span className="font-medium truncate max-w-[100px]">{trip.vehicle.model}</span>
                    </div>
                )}
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>{new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pt-2">
        {/* Painel Financeiro */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-slate-100">
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">
                        Aporte {trip.budgetMethod && <span className="text-[10px] font-normal bg-indigo-50 text-indigo-700 px-1 rounded ml-0.5">{trip.budgetMethod}</span>}
                    </span>
                    <span className="text-base font-bold text-blue-600 truncate">R$ {budget.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">Despesas</span>
                    <span className="text-base font-bold text-orange-600 truncate">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">Saldo</span>
                    <span className={`text-base font-bold truncate ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        R$ {balance.toFixed(2).replace('.', ',')}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-lg font-bold text-gray-800">Lançamentos</h2>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-slate-50">
            <p className="text-gray-500 font-medium">Nenhuma despesa cadastrada.</p>
            {!readOnly && <p className="text-gray-400 text-sm mt-2">Toque no botão + para começar.</p>}
          </div>
        ) : (
          <ul className="space-y-3">
            {[...expenses].reverse().map((expense) => (
              <li
                key={expense.id}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border-l-4 border-indigo-500"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-full">
                    {getCategoryIcon(expense.category, 'w-5 h-5')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{expense.category}</p>
                    <p className="text-base font-bold text-gray-900">
                      R$ {expense.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {expense.receipt ? (
                  <button
                    onClick={() => setViewingImage(expense.receipt!)}
                    className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0"
                    title="Ver nota fiscal"
                  >
                    <img src={expense.receipt} alt="Nota Fiscal" className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-12 h-12 rounded-md border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 text-center flex-shrink-0 bg-gray-50">
                    Sem anexo
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {!readOnly && (
        <div className="fixed right-4 z-20 flex flex-col items-center gap-3 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      <div className="fixed left-4 z-20 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={onShowReportModal}
          className={`${readOnly ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-full py-2 px-4 text-sm shadow-lg focus:outline-none transition-colors font-medium`}
        >
          {readOnly ? 'Relatórios PDF' : 'Relatórios / Encerrar'}
        </button>
      </div>

      {isAdding && !readOnly && onAddExpense && (
        <AddExpenseForm
          onAdd={(expense) => {
            onAddExpense(expense);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <img src={viewingImage} alt="Nota Fiscal Ampliada" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
