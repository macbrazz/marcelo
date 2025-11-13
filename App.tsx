
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
              summaryDoc.text(
                  `Data de Início: ${new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}`,
                  15,
                  56
              );

              const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
              summaryDoc.setFontSize(16);
              summaryDoc.text(
                  `Total de Despesas: R$ ${total.toFixed(2).replace('.', ',')}`,
                  15,
                  70
              );

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
                      summaryDoc.text(
                          `${index + 1}. ${exp.category}: R$ ${exp.amount.toFixed(2).replace('.', ',')}`,
                          20,
                          yPos
                      );
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
              const receiptsDoc = new jsPDF();

              receiptsDoc.setFontSize(22);
              receiptsDoc.text("Comprovantes da Viagem", 105, 15, { align: 'center' });
              receiptsDoc.setFontSize(10);
              receiptsDoc.text(`Destino: ${trip.destination}`, 105, 22, { align: 'center' });

              if (expenses.length === 0) {
                  // Gera um PDF válido mesmo sem despesas
                  receiptsDoc.setFontSize(12);
                  receiptsDoc.text("Nenhuma despesa cadastrada para esta viagem.", 105, 60, { align: 'center' });

                  if (isMobile()) {
                      const pdfDataUri = receiptsDoc.output('datauristring');
                      window.open(pdfDataUri, '_blank');
                  } else {
                      receiptsDoc.save(`comprovantes_viagem_${trip.destination}.pdf`);
                  }
              } else {
                  expenses.forEach((exp, index) => {
                      if (index > 0) receiptsDoc.addPage();

                      receiptsDoc.setFontSize(12);
                      receiptsDoc.text(
                          `Despesa ${index + 1}: ${exp.category} - R$ ${exp.amount.toFixed(2).replace('.', ',')}`,
                          15,
                          30
                      );

                      if (exp.receipt) {
                        try {
                          const src = String(exp.receipt);

                          // Detecta o formato a partir do DataURL; padrão = JPEG
                          const format =
                            src.startsWith('data:image/png') ? 'PNG' :
                            (src.startsWith('data:image/jpeg') || src.startsWith('data:image/jpg')) ? 'JPEG' :
                            'JPEG';

                          // A4 com margem simples
                          const x = 15, y = 40, w = 180, h = 230;

                          receiptsDoc.addImage(src, format as any, x, y, w, h, undefined, 'FAST');
                        } catch (e) {
                          console.error('Error adding image to PDF: ', e, { receiptType: typeof exp.receipt });
                          receiptsDoc.setFontSize(11);
                          receiptsDoc.text('Erro ao carregar a imagem do comprovante.', 15, 50);
                        }
                      } else {
                        receiptsDoc.setFontSize(16);
                        receiptsDoc.text('Sem comprovante fiscal para esta despesa.', 105, 150, { align: 'center' });
                      }
                  });

                  if (isMobile()) {
                      const pdfDataUri = receiptsDoc.output('datauristring');
                      window.open(pdfDataUri, '_blank');
                  } else {
                      receiptsDoc.save(`comprovantes_viagem_${trip.destination}.pdf`);
                  }
              }
          }
      } catch (error) {
          console.error("Failed to generate PDF:", error);
          alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
      } finally {
          setIsGenerating(false);
      }

    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center animate-fade-in-up">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Gerar Relatórios</h2>
                <p className="text-slate-500 mb-6">Escolha qual relatório você deseja visualizar.</p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                        Resumo da Viagem
                    </button>
                    <button onClick={() => generatePdf('receipts')} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition">
                        Comprovantes Fiscais
                    </button>
                </div>
                <hr className="my-6 border-slate-200" />
                <button onClick={onEndTrip} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition">
                    Encerrar Viagem e Salvar
                </button>
                <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-slate-700">
                    Voltar
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allTrips, setAllTrips] = useState<TripRecord[]>([]);

  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load trips from localStorage on initial render
  useEffect(() => {
    try {
      const storedTrips = localStorage.getItem('travelApp-allTrips');
      if (storedTrips) {
        setAllTrips(JSON.parse(storedTrips));
      }
    } catch (error) {
      console.error("Could not load trips from localStorage:", error);
    }
  }, []);

  // Save trips to localStorage whenever they change
  const saveTrips = useCallback((trips: TripRecord[]) => {
    try {
      localStorage.setItem('travelApp-allTrips', JSON.stringify(trips));
    } catch (error) {
      console.error("Could not save trips to localStorage:", error);
    }
  }, []);

  const handleTripStart = (trip: Trip) => {
    setActiveTrip(trip);
    setExpenses([]);
    setIsSetupOpen(false);
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now() }]);
  };

  const handleEndTrip = () => {
      if (!activeTrip) return;

      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const newTripRecord: TripRecord = {
          id: Date.now(),
          trip: activeTrip,
          expenses,
          total,
      };

      const updatedTrips = [...allTrips, newTripRecord];
      setAllTrips(updatedTrips);
      saveTrips(updatedTrips);

      // Reset state
      setActiveTrip(null);
      setExpenses([]);
      setIsReportModalOpen(false);
  };

  const handleDeleteTrip = (tripId: number) => {
    const updatedTrips = allTrips.filter(trip => trip.id !== tripId);
    setAllTrips(updatedTrips);
    saveTrips(updatedTrips);
  };

  if (activeTrip) {
    return (
        <>
            <ExpenseTracker
                trip={activeTrip}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onShowReportModal={() => setIsReportModalOpen(true)}
            />
            {isReportModalOpen && (
                <ReportModal
                    trip={activeTrip}
                    expenses={expenses}
                    onClose={() => setIsReportModalOpen(false)}
                    onEndTrip={handleEndTrip}
                    setIsGenerating={setIsGenerating}
                />
            )}
            {isGenerating && (
                 <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-indigo-800 font-semibold">Gerando relatório...</p>
                    </div>
                </div>
            )}
        </>
    );
  }

  return (
    <>
      <TripHistory
        trips={allTrips}
        onStartNewTrip={() => setIsSetupOpen(true)}
        onDeleteTrip={handleDeleteTrip}
      />
      <TripSetup 
        isOpen={isSetupOpen}
        onTripStart={handleTripStart}
        onClose={() => setIsSetupOpen(false)}
      />
    </>
  );
};

export default App;
