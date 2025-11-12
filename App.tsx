import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Expense, TripRecord } from './types';
import TripSetup from './components/TripSetup';
import ExpenseTracker from './components/ExpenseTracker';
import TripHistory from './components/TripHistory';

// To satisfy TypeScript since jsPDF is loaded from a script tag
declare const window: any;

// Helper function to detect mobile devices
const isMobile = () => {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent) || ('ontouchstart' in window);
};

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

                if (isMobile()) {
                    const pdfDataUri = summaryDoc.output('datauristring');
                    window.open(pdfDataUri, '_blank');
                } else {
                    summaryDoc.save(`resumo_viagem_${trip.destination}.pdf`);
                }

            } else if (type === 'receipts') {
                const expensesWithReceipts = expenses.filter(e => e.receipt);
                if (expensesWithReceipts.length === 0) {
                    alert('Não há comprovantes para exibir.');
                    setIsGenerating(false);
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
                
                if (isMobile()) {
                    const pdfDataUri = receiptsDoc.output('datauristring');
                    window.open(pdfDataUri, '_blank');
                } else {
                    receiptsDoc.save(`comprovantes_viagem_${trip.destination}.pdf`);
                }
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
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Relatórios</h2>
                <p className="text-slate-600 mb-6">Gere os relatórios ou encerre a viagem para salvá-la no histórico.</p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
                        Gerar Resumo da Viagem
                    </button>
                    <button onClick={() => generatePdf('receipts')} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition">
                        Gerar Comprovantes
                    </button>
                    <button onClick={onEndTrip} className="w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 transition mt-4">
                        Encerrar e Salvar Viagem
                    </button>
                </div>
                <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:text-slate-700">
                    Voltar
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [allTrips, setAllTrips] = useState<TripRecord[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeExpenses, setActiveExpenses] = useState<Expense[]>([]);
  
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem('tripHistory');
      if (savedTrips) {
        setAllTrips(JSON.parse(savedTrips));
      }
    } catch (error) {
      console.error("Could not load trips from localStorage", error);
    }
  }, []);

  const handleStartTrip = useCallback((tripDetails: Trip) => {
    setActiveTrip(tripDetails);
    setActiveExpenses([]);
    setShowSetupModal(false);
  }, []);

  const handleAddExpense = useCallback((newExpenseData: Omit<Expense, 'id'>) => {
    setActiveExpenses(prevExpenses => [
      ...prevExpenses,
      { ...newExpenseData, id: Date.now() }
    ]);
  }, []);
  
  const handleEndAndSaveTrip = useCallback(() => {
    if (!activeTrip) return;

    const total = activeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newTripRecord: TripRecord = {
      id: Date.now(),
      trip: activeTrip,
      expenses: activeExpenses,
      total,
    };

    const updatedTrips = [...allTrips, newTripRecord];
    setAllTrips(updatedTrips);
    localStorage.setItem('tripHistory', JSON.stringify(updatedTrips));
    
    setActiveTrip(null);
    setActiveExpenses([]);
    setShowReportModal(false);
  }, [activeTrip, activeExpenses, allTrips]);
  
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

  if (activeTrip) {
    return (
      <>
        <ExpenseTracker
          trip={activeTrip}
          expenses={activeExpenses}
          onAddExpense={handleAddExpense}
          onShowReportModal={() => setShowReportModal(true)}
        />
        {showReportModal && (
          <ReportModal 
              trip={activeTrip}
              expenses={activeExpenses}
              onClose={() => setShowReportModal(false)}
              onEndTrip={handleEndAndSaveTrip}
              setIsGenerating={setIsGenerating}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TripHistory 
        trips={allTrips}
        onStartNewTrip={() => setShowSetupModal(true)}
      />
      <TripSetup 
        isOpen={showSetupModal}
        onTripStart={handleStartTrip}
        onClose={() => setShowSetupModal(false)}
      />
    </>
  );
};

export default App;
