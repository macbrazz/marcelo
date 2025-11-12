import React, { useState } from 'react';
import { Trip, Expense, ExpenseCategory } from '../types';
import { getCategoryIcon, CameraIcon, PlusIcon } from './icons';
import Camera from './Camera';

interface ExpenseTrackerProps {
  trip: Trip;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onShowReportModal: () => void;
}

const AddExpenseForm: React.FC<{ onAdd: (expense: Omit<Expense, 'id'>) => void; onCancel: () => void; }> = ({ onAdd, onCancel }) => {
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
        if (amount && category && receipt) {
            onAdd({ amount: parseFloat(amount), category, receipt });
        } else {
            alert('Por favor, preencha o valor, a categoria e anexe a nota fiscal.');
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
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)}
                               step="0.01" placeholder="0,00" required
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                            {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nota Fiscal</label>
                        <button type="button" onClick={() => setShowCamera(true)}
                                className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <CameraIcon className="w-5 h-5"/>
                            {receipt ? 'Nota fiscal capturada' : 'Capturar com a Câmera'}
                        </button>
                        {receipt && <img src={receipt} alt="Preview" className="mt-2 rounded-md max-h-40 mx-auto"/>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ trip, expenses, onAddExpense, onShowReportModal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-500">Viagem para</p>
          <h1 className="text-2xl font-bold text-indigo-800">{trip.destination}</h1>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{trip.participants}</span>
            <span>{new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Despesas</h2>
            <div className="text-right">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="font-bold text-2xl text-indigo-600">R$ {total.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
            <p className="text-gray-400 text-sm mt-2">Clique em '+' para adicionar a primeira.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {expenses.map(expense => (
              <li key={expense.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between transition-transform hover:scale-102">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                    {getCategoryIcon(expense.category, "w-6 h-6")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{expense.category}</p>
                    <p className="text-lg font-bold text-gray-900">R$ {expense.amount.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <button onClick={() => setViewingImage(expense.receipt)} className="w-16 h-16 rounded-md overflow-hidden border-2 border-gray-200">
                    <img src={expense.receipt} alt="Nota Fiscal" className="w-full h-full object-cover"/>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="fixed bottom-4 right-4 z-20 flex flex-col items-center gap-3">
         <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110">
            <PlusIcon className="w-8 h-8"/>
        </button>
      </div>

       <div className="fixed bottom-4 left-4 z-20">
         <button onClick={onShowReportModal} className="bg-green-600 text-white rounded-full py-2 px-4 text-sm shadow-lg hover:bg-green-700 focus:outline-none">
            Relatórios e Encerrar
         </button>
       </div>
      
      {isAdding && <AddExpenseForm onAdd={(expense) => { onAddExpense(expense); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />}
      
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center" onClick={() => setViewingImage(null)}>
          <img src={viewingImage} alt="Nota Fiscal Ampliada" className="max-w-full max-h-full rounded-lg"/>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;