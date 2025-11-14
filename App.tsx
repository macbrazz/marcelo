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

// Helper function to specifically detect iOS devices
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


const ReportModal: React.FC<{
    trip: Trip;
    expenses: Expense[];
    onClose: () => void;
    onEndTrip: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
}> = ({ trip, expenses, onClose, onEndTrip, setIsGenerating }) => {

    const downloadPdf = (doc: any, filename: string) => {
        // iOS has unique challenges, especially in PWA mode.
        // Opening in a new tab is the most reliable cross-context (browser/PWA) solution.
        if (isIOS()) {
            try {
                // This tells jsPDF to open the generated PDF in a new window/tab.
                // The user can then use Safari's native share/save functionality.
                doc.output('dataurlnewwindow');
            } catch (e) {
                console.error("Failed to open PDF for iOS:", e);
                alert("Não foi possível exibir o PDF. Por favor, tente usar o app no navegador Safari.");
            }
            return; // Important to stop here for iOS
        }

        // For other mobile devices (Android) and PWAs, creating a download link is effective.
        if (isMobile() || window.matchMedia('(display-mode: standalone)').matches) {
            try {
                // Using a blob is more performant than a large data URI.
                const blob = doc.output('blob');
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // Revoke the object URL to free up memory.
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error("Download failed on mobile:", e);
                alert("Não foi possível baixar o PDF. Tente abrir o aplicativo no navegador do seu celular.");
            }
        } else {
            // Standard desktop download.
            doc.save(filename);
        }
    };

    const generatePdf = async (type: 'summary' | 'detailed') => {
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

                downloadPdf(summaryDoc, `resumo_viagem_${trip.destination}.pdf`);

            } else if (type === 'detailed') {
                if (expenses.length === 0) {
                    alert('Nenhuma despesa foi registrada para gerar o relatório.');
                    setIsGenerating(false);
                    return;
                }

                const detailedDoc = new jsPDF();
                detailedDoc.setFontSize(22);
                detailedDoc.text("Relatório Detalhado da Viagem", 105, 15, { align: 'center' });
                detailedDoc.setFontSize(10);
                detailedDoc.text(`Destino: ${trip.destination}`, 105, 22, { align: 'center' });

                expenses.forEach((exp, index) => {
                    if (index > 0) detailedDoc.addPage();

                    detailedDoc.setFontSize(12);
                    detailedDoc.text(`Despesa ${index + 1}: ${exp.category} - R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, 20);
                    
                    if (exp.receipt) {
                        try {
                             // Dimensions for the image, maintaining aspect ratio
                            const img = new Image();
                            img.src = exp.receipt;
                            const imgProps = detailedDoc.getImageProperties(img.src);
                            const pdfWidth = detailedDoc.internal.pageSize.getWidth();
                            const pdfHeight = detailedDoc.internal.pageSize.getHeight();
                            const margin = 15;
                            const availableWidth = pdfWidth - 2 * margin;
                            const availableHeight = pdfHeight - 40; // Space for header
                            const aspectRatio = imgProps.width / imgProps.height;
                            let imgWidth = availableWidth;
                            let imgHeight = imgWidth / aspectRatio;
                            if (imgHeight > availableHeight) {
                                imgHeight = availableHeight;
                                imgWidth = imgHeight * aspectRatio;
                            }
                            const x = (pdfWidth - imgWidth) / 2;
                            detailedDoc.addImage(exp.receipt, 'JPEG', x, 30, imgWidth, imgHeight);
                        } catch(e) {
                            console.error("Error adding image to PDF:", e);
                            detailedDoc.text("Erro ao carregar imagem do comprovante.", 15, 40);
                        }
                    } else {
                        detailedDoc.setFontSize(11);
                        detailedDoc.setTextColor(100); // gray color
                        detailedDoc.text("Sem comprovante anexado.", 15, 30);
                        detailedDoc.setTextColor(0); // back to black
                    }
                });
                
                downloadPdf(detailedDoc, `relatorio_detalhado_${trip.destination}.pdf`);
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 text-center animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Finalizar Viagem</h2>
                <p className="text-slate-500 mb-6">Gere relatórios ou encerre a viagem atual. A viagem será salva no seu histórico.</p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        Gerar Resumo (PDF)
                    </button>
                    <button onClick={() => generatePdf('detailed')} className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                        Gerar Relatório Detalhado (PDF)
                    </button>
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                    </div>
                    <button onClick={onEndTrip} className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                        Encerrar e Salvar Viagem
                    </button>
                </div>
                <button onClick={onClose} className="mt-6 text-slate-500 hover:text-slate-700 text-sm">
                    Cancelar
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    // Initialize state from localStorage
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(() => {
        try {
            const storedTrip = localStorage.getItem('currentTrip');
            return storedTrip ? JSON.parse(storedTrip) : null;
        } catch (error) {
            console.error("Failed to load trip from localStorage", error);
            return null;
        }
    });
    
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        try {
            // Only load expenses if there is a current trip
            if (localStorage.getItem('currentTrip')) {
                const storedExpenses = localStorage.getItem('currentExpenses');
                return storedExpenses ? JSON.parse(storedExpenses) : [];
            }
            return [];
        } catch (error) {
            console.error("Failed to load expenses from localStorage", error);
            return [];
        }
    });

    const [tripHistory, setTripHistory] = useState<TripRecord[]>(() => {
        try {
            const storedHistory = localStorage.getItem('tripHistory');
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (error) {
            console.error("Failed to load trip history from localStorage", error);
            return [];
        }
    });

    const [isTripSetupOpen, setIsTripSetupOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Data Persistence Effects ---

    // Save current trip state to localStorage
    useEffect(() => {
        try {
            if (currentTrip) {
                localStorage.setItem('currentTrip', JSON.stringify(currentTrip));
            } else {
                // When trip ends, clear both trip and its expenses from storage
                localStorage.removeItem('currentTrip');
                localStorage.removeItem('currentExpenses');
            }
        } catch (error) {
            console.error("Failed to save current trip to localStorage", error);
        }
    }, [currentTrip]);

    // Save expenses of the current trip to localStorage
    useEffect(() => {
        try {
            // Only save expenses if there is an active trip.
            if (currentTrip) {
                localStorage.setItem('currentExpenses', JSON.stringify(expenses));
            }
        } catch (error) {
            console.error("Failed to save expenses to localStorage", error);
        }
    }, [expenses, currentTrip]);

    // Save trip history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('tripHistory', JSON.stringify(tripHistory));
        } catch (error) {
            console.error("Failed to save trip history to localStorage", error);
        }
    }, [tripHistory]);
    
    // --- App Logic ---

    const handleStartTrip = (trip: Trip) => {
        setCurrentTrip(trip);
        setExpenses([]); // Reset expenses for new trip
        setIsTripSetupOpen(false);
    };

    const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...expense,
            id: Date.now(), // simple unique id
        };
        setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    };

    const handleEndTrip = useCallback(() => {
        if (!currentTrip) return;

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const newTripRecord: TripRecord = {
            id: Date.now(),
            trip: currentTrip,
            expenses: expenses,
            total: total,
        };

        setTripHistory(prev => [...prev, newTripRecord]);
        setCurrentTrip(null);
        setExpenses([]);
        setIsReportModalOpen(false);
    }, [currentTrip, expenses]);

    const handleDeleteTrip = (tripId: number) => {
        setTripHistory(prev => prev.filter(trip => trip.id !== tripId));
    };
    
    // On initial load, if there's no active trip and no history, open the setup modal.
    useEffect(() => {
        const hasActiveTrip = !!localStorage.getItem('currentTrip');
        const storedHistory = localStorage.getItem('tripHistory');
        const hasHistory = storedHistory && JSON.parse(storedHistory).length > 0;
        if (!hasActiveTrip && !hasHistory) {
            setIsTripSetupOpen(true);
        }
    }, []);

    // --- Render Logic ---
    
    return (
        <>
            {isGenerating && (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-[100] flex items-center justify-center">
                    <div className="text-center">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3 text-slate-700 font-semibold">Gerando PDF...</p>
                    </div>
                </div>
            )}

            <TripSetup 
                isOpen={isTripSetupOpen} 
                onTripStart={handleStartTrip} 
                onClose={() => setIsTripSetupOpen(false)} 
            />

            {isReportModalOpen && currentTrip && (
                <ReportModal 
                    trip={currentTrip}
                    expenses={expenses}
                    onClose={() => setIsReportModalOpen(false)}
                    onEndTrip={handleEndTrip}
                    setIsGenerating={setIsGenerating}
                />
            )}

            {currentTrip ? (
                <ExpenseTracker
                    trip={currentTrip}
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onShowReportModal={() => setIsReportModalOpen(true)}
                />
            ) : (
                <TripHistory
                    trips={tripHistory}
                    onStartNewTrip={() => setIsTripSetupOpen(true)}
                    onDeleteTrip={handleDeleteTrip}
                />
            )}
        </>
    );
};

export default App;