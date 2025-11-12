import React, { useState, useCallback } from 'react';
import { Trip, Expense } from './types';
import TripSetup from './components/TripSetup';
import ExpenseTracker from './components/ExpenseTracker';

// To satisfy TypeScript since jsPDF is loaded from a script tag
declare const window: any;

const ReportModal: React.FC<{
    trip: Trip;
    expenses: Expense[];
    onClose: () => void;
    onEndTrip: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
}> = ({ trip, expenses, onClose, onEndTrip, setIsGenerating }) => {

    const generatePdf = async (type: 'summary' | 'receipts') => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 50)); // Allow UI to update

        try {
            const { jsPDF } = window.jspdf;

            if (type === 'summary') {
                const summaryDoc = new jsPDF();
                
                summaryDoc.setFontSize(22);
                summaryDoc.text("Relatório de Despesas de Viagem", 105, 20, { align: 'center' });
                
                summaryDoc.setFontSize(12);
                summaryDoc.text(`Destino: ${trip.destination}`, 15, 40);
                summaryDoc.text(`Participantes: ${trip.participants}`, 15, 48);
                summaryDoc.text(`Data de Início: ${new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, 56);
                
                const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                summaryDoc.setFontSize(16);
                summaryDoc.text(`Total de Despesas: R$ ${total.toFixed(2).replace('.', ',')}`, 15, 70);
                
                if (expenses.length > 0) {
                    summaryDoc.setFontSize(14);
                    summaryDoc.text("Lista de Despesas", 15, 85);
                    let yPos = 95;
                    expenses.forEach((exp, index) => {
                        if (yPos > 270) {
                            summaryDoc.addPage();
                            yPos = 20;
                        }
                        summaryDoc.setFontSize(11);
                        summaryDoc.text(`${index + 1}. ${exp.category}: R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 20, yPos);
                        yPos += 7;
                    });
                } else {
                     summaryDoc.setFontSize(12);
                     summaryDoc.text("Nenhuma despesa registrada.", 15, 85);
                }

                const pdfDataUri = summaryDoc.output('datauristring');
                window.open(pdfDataUri, '_blank');

            } else if (type === 'receipts') {
                const expensesWithReceipts = expenses.filter(e => e.receipt);
                if (expensesWithReceipts.length === 0) {
                    alert('Não há comprovantes para exibir.');
                    return;
                }
                
                const receiptsDoc = new jsPDF();
                receiptsDoc.setFontSize(22);
                receiptsDoc.text("Comprovantes da Viagem", 105, 20, { align: 'center' });

                expensesWithReceipts.forEach((exp, index) => {
                    try {
                        if (index > 0) receiptsDoc.addPage();
                        receiptsDoc.setFontSize(12);
                        receiptsDoc.text(`Comprovante ${index + 1}: ${exp.category} - R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, 20);
                        receiptsDoc.addImage(exp.receipt, 'JPEG', 15, 30, 180, 160, undefined, 'FAST');
                    } catch (e) {
                        console.error("Error adding image to PDF: ", e);
                        if (index > 0) receiptsDoc.addPage();
                        receiptsDoc.text(`Erro ao carregar imagem do comprovante ${index + 1}.`, 15, 40);
                    }
                });
                
                const pdfDataUri = receiptsDoc.output('datauristring');
                window.open(pdfDataUri, '_blank');
            }
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Ocorreu um erro ao gerar o relatório em PDF.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-up">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Opções do Relatório</h2>
                <p className="text-slate-600 mb-6">Selecione uma opção para visualizar. O relatório será aberto em uma nova aba.</p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
                        Visualizar Resumo da Viagem
                    </button>
                    <button onClick={() => generatePdf('receipts')} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition">
                        Visualizar Comprovantes
                    </button>
                    <button onClick={onEndTrip} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 transition mt-4">
                        Encerrar Viagem e Limpar Dados
                    </button>
                </div>
                <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:text-slate-700">
                    Cancelar
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleStartTrip = useCallback((tripDetails: Trip) => {
    setTrip(tripDetails);
    setExpenses([]);
  }, []);

  const handleAddExpense = useCallback((newExpenseData: Omit<Expense, 'id'>) => {
    setExpenses(prevExpenses => [
      ...prevExpenses,
      { ...newExpenseData, id: Date.now() }
    ]);
  }, []);
  
  const handleEndTrip = useCallback(() => {
    if (window.confirm('Tem certeza que deseja encerrar a viagem? Todos os dados serão apagados.')) {
        setTrip(null);
        setExpenses([]);
        setShowReportModal(false);
    }
  }, []);
  
  if(isGenerating) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold mt-4">Gerando Relatório...</h2>
            <p className="text-slate-500">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <TripSetup onTripStart={handleStartTrip} />;
  }

  return (
    <>
      <ExpenseTracker
        trip={trip}
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onShowReportModal={() => setShowReportModal(true)}
      />
      {showReportModal && trip && (
        <ReportModal 
            trip={trip}
            expenses={expenses}
            onClose={() => setShowReportModal(false)}
            onEndTrip={handleEndTrip}
            setIsGenerating={setIsGenerating}
        />
      )}
    </>
  );
};

export default App;