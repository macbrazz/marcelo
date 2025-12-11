
import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Expense, TripRecord, Vehicle } from './types';
import TripSetup from './components/TripSetup';
import ExpenseTracker from './components/ExpenseTracker';
import TripHistory from './components/TripHistory';
import CompanySettings from './components/CompanySettings';
import BackupModal from './components/BackupModal';

// To satisfy TypeScript since jsPDF is loaded from a script tag
declare const window: any;

const ReportModal: React.FC<{
    trip: Trip;
    expenses: Expense[];
    onClose: () => void;
    onEndTrip: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
    isHistoryView?: boolean;
    companyHeader: string | null;
    companyFooter: string | null;
}> = ({ trip, expenses, onClose, onEndTrip, setIsGenerating, isHistoryView = false, companyHeader, companyFooter }) => {

    const downloadPdf = (doc: any, filename: string) => {
        try {
            doc.save(filename);
        } catch (e) {
            console.warn("doc.save() failed, falling back to output.", e);
            try {
                doc.output('dataurlnewwindow', { filename: filename });
            } catch (e2) {
                console.error("Fallback PDF method also failed:", e2);
                alert("Ocorreu um erro ao gerar o PDF. Não foi possível baixar ou abrir o arquivo.");
            }
        }
    };

    const addCompanyBranding = (doc: any) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let topMargin = 20;
        let bottomMargin = 20;

        if (companyHeader) {
            try {
                const imgProps = doc.getImageProperties(companyHeader);
                // Scale to fit width, max height e.g. 40mm
                const headerHeight = (imgProps.height * pageWidth) / imgProps.width;
                // Limit height if absurdly tall, though scaling to width usually fixes it.
                // We'll place it at 0,0
                doc.addImage(companyHeader, 'PNG', 0, 0, pageWidth, headerHeight);
                topMargin = headerHeight + 10;
            } catch (e) {
                console.error("Error adding header", e);
            }
        }

        if (companyFooter) {
            try {
                const imgProps = doc.getImageProperties(companyFooter);
                const footerHeight = (imgProps.height * pageWidth) / imgProps.width;
                doc.addImage(companyFooter, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
                bottomMargin = footerHeight + 10;
            } catch (e) {
                console.error("Error adding footer", e);
            }
        }
        
        return { topMargin, bottomMargin };
    };

    const generatePdf = async (type: 'summary' | 'detailed') => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            const { jsPDF } = window.jspdf;
            const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const budget = trip.budget || 0;
            const balance = budget - total;

            if (type === 'summary') {
                const summaryDoc = new jsPDF();
                
                // Add Branding and get adjusted margins
                const { topMargin } = addCompanyBranding(summaryDoc);

                summaryDoc.setFontSize(22);
                summaryDoc.text("Relatório de Despesas de Viagem", 105, topMargin + 10, { align: 'center' });
                
                let currentY = topMargin + 30;

                summaryDoc.setFontSize(12);
                summaryDoc.text(`Destino: ${trip.destination}`, 15, currentY);
                summaryDoc.text(`Participantes: ${trip.participants}`, 15, currentY + 8);
                summaryDoc.text(`Data de Início: ${new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, currentY + 16);
                
                if (trip.vehicle) {
                     summaryDoc.text(`Veículo: ${trip.vehicle.model} - Placa: ${trip.vehicle.plate}`, 15, currentY + 24);
                }

                currentY += trip.vehicle ? 32 : 24;

                // Resumo Financeiro
                summaryDoc.setDrawColor(200, 200, 200);
                summaryDoc.line(15, currentY, 195, currentY);
                
                currentY += 8;

                summaryDoc.setFontSize(14);
                summaryDoc.text("Resumo Financeiro", 15, currentY);
                summaryDoc.setFontSize(12);
                
                const methodText = trip.budgetMethod ? ` (${trip.budgetMethod})` : '';
                summaryDoc.text(`Aporte Inicial${methodText}:`, 15, currentY + 10);
                summaryDoc.text(`R$ ${budget.toFixed(2).replace('.', ',')}`, 195, currentY + 10, { align: 'right' });
                
                summaryDoc.text(`Total de Despesas:`, 15, currentY + 18);
                summaryDoc.setTextColor(200, 0, 0); // Red
                summaryDoc.text(`R$ ${total.toFixed(2).replace('.', ',')}`, 195, currentY + 18, { align: 'right' });
                summaryDoc.setTextColor(0, 0, 0); // Reset

                summaryDoc.setFontSize(14);
                summaryDoc.text(`Saldo Final:`, 15, currentY + 28);
                if (balance < 0) summaryDoc.setTextColor(200, 0, 0);
                else summaryDoc.setTextColor(0, 128, 0);
                summaryDoc.text(`R$ ${balance.toFixed(2).replace('.', ',')}`, 195, currentY + 28, { align: 'right' });
                summaryDoc.setTextColor(0, 0, 0); // Reset

                currentY += 45;

                if (expenses.length > 0) {
                    summaryDoc.setFontSize(14);
                    summaryDoc.text("Lista de Despesas", 15, currentY);
                    currentY += 10;
                    expenses.forEach((exp, index) => {
                        if (currentY > 250) { // Simple page break check, rudimentary
                            summaryDoc.addPage();
                            addCompanyBranding(summaryDoc); // Add branding to new page
                            currentY = topMargin + 10;
                        }
                        summaryDoc.setFontSize(11);
                        summaryDoc.text(`${index + 1}. ${exp.category}`, 15, currentY);
                        summaryDoc.text(`R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 195, currentY, { align: 'right' });
                        currentY += 7;
                    });
                } else {
                     summaryDoc.setFontSize(12);
                     summaryDoc.text("Nenhuma despesa registrada.", 15, currentY);
                }

                downloadPdf(summaryDoc, `resumo_viagem_${trip.destination}.pdf`);

            } else if (type === 'detailed') {
                if (expenses.length === 0) {
                    alert('Nenhuma despesa foi registrada para gerar o relatório.');
                    setIsGenerating(false);
                    return;
                }

                const detailedDoc = new jsPDF();
                
                // Add branding to first page
                const { topMargin, bottomMargin } = addCompanyBranding(detailedDoc);
                const pageHeight = detailedDoc.internal.pageSize.getHeight();
                const availableHeight = pageHeight - bottomMargin;

                detailedDoc.setFontSize(22);
                detailedDoc.text("Relatório Detalhado da Viagem", 105, topMargin + 10, { align: 'center' });
                detailedDoc.setFontSize(10);
                detailedDoc.text(`Destino: ${trip.destination} | Saldo: R$ ${balance.toFixed(2).replace('.', ',')}`, 105, topMargin + 17, { align: 'center' });
                if (trip.vehicle) {
                     detailedDoc.text(`Veículo: ${trip.vehicle.model} (${trip.vehicle.plate})`, 105, topMargin + 22, { align: 'center' });
                }

                let currentY = topMargin + 35; // Initial Y after header info

                expenses.forEach((exp, index) => {
                    // Check if we have space for the text block (approx 20 units) + image (min 50 units)
                    if (currentY > availableHeight - 60) {
                        detailedDoc.addPage();
                        addCompanyBranding(detailedDoc);
                        currentY = topMargin + 10;
                    }

                    detailedDoc.setFontSize(14);
                    detailedDoc.text(`Despesa #${index + 1}`, 15, currentY); 
                    
                    detailedDoc.setFontSize(12);
                    detailedDoc.text(`Categoria: ${exp.category}`, 15, currentY + 10);
                    detailedDoc.text(`Valor: R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, currentY + 18);
                    
                    currentY += 25;

                    if (exp.receipt) {
                        try {
                            const img = new Image();
                            img.src = exp.receipt;
                            const imgProps = detailedDoc.getImageProperties(img.src);
                            const pdfWidth = detailedDoc.internal.pageSize.getWidth();
                            const margin = 15;
                            const maxImgWidth = pdfWidth - 2 * margin;
                            
                            // Calculate remaining height on page
                            let maxImgHeight = availableHeight - currentY - 10; // 10 padding

                            // If hardly any space left, new page for image
                            if (maxImgHeight < 40) { 
                                detailedDoc.addPage();
                                addCompanyBranding(detailedDoc);
                                currentY = topMargin + 10;
                                maxImgHeight = availableHeight - currentY - 10;
                            }

                            const aspectRatio = imgProps.width / imgProps.height;
                            let imgWidth = maxImgWidth;
                            let imgHeight = imgWidth / aspectRatio;

                            if (imgHeight > maxImgHeight) {
                                imgHeight = maxImgHeight;
                                imgWidth = imgHeight * aspectRatio;
                            }

                            const x = (pdfWidth - imgWidth) / 2;
                            detailedDoc.addImage(exp.receipt, 'JPEG', x, currentY, imgWidth, imgHeight);
                            currentY += imgHeight + 10; // Space after image

                        } catch(e) {
                            console.error("Error adding image to PDF:", e);
                            detailedDoc.text("Erro ao carregar imagem do comprovante.", 15, currentY);
                            currentY += 10;
                        }
                    } else {
                        detailedDoc.setFontSize(11);
                        detailedDoc.setTextColor(100); 
                        detailedDoc.text("Sem comprovante anexado.", 15, currentY);
                        detailedDoc.setTextColor(0); 
                        currentY += 10;
                    }
                    
                    currentY += 5; // Separator space
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
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{isHistoryView ? "Relatórios da Viagem" : "Finalizar Viagem"}</h2>
                <p className="text-slate-500 mb-6">
                    {isHistoryView 
                        ? "Gere segundas vias dos relatórios desta viagem." 
                        : "Gere relatórios ou encerre a viagem atual. A viagem será salva no seu histórico."
                    }
                </p>
                <div className="space-y-3">
                    <button onClick={() => generatePdf('summary')} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        Gerar Resumo (PDF)
                    </button>
                    <button onClick={() => generatePdf('detailed')} className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                        Gerar Relatório Detalhado (PDF)
                    </button>
                    
                    {!isHistoryView && (
                        <>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                            </div>
                            <button onClick={onEndTrip} className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                                Encerrar e Salvar Viagem
                            </button>
                        </>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 text-slate-500 hover:text-slate-700 text-sm">
                    Fechar
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

    const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
        try {
            const storedVehicles = localStorage.getItem('vehicles');
            return storedVehicles ? JSON.parse(storedVehicles) : [];
        } catch (error) {
            console.error("Failed to load vehicles from localStorage", error);
            return [];
        }
    });

    const [companyHeader, setCompanyHeader] = useState<string | null>(() => {
        try { return localStorage.getItem('companyHeader'); } catch { return null; }
    });
    const [companyFooter, setCompanyFooter] = useState<string | null>(() => {
        try { return localStorage.getItem('companyFooter'); } catch { return null; }
    });

    const [isTripSetupOpen, setIsTripSetupOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewingHistoryTrip, setViewingHistoryTrip] = useState<TripRecord | null>(null);

    // --- Data Persistence Effects ---

    useEffect(() => {
        try {
            if (currentTrip) {
                localStorage.setItem('currentTrip', JSON.stringify(currentTrip));
            } else {
                localStorage.removeItem('currentTrip');
                localStorage.removeItem('currentExpenses');
            }
        } catch (error) {
            console.error("Failed to save current trip to localStorage", error);
        }
    }, [currentTrip]);

    useEffect(() => {
        try {
            if (currentTrip) {
                localStorage.setItem('currentExpenses', JSON.stringify(expenses));
            }
        } catch (error) {
            console.error("Failed to save expenses to localStorage", error);
        }
    }, [expenses, currentTrip]);

    useEffect(() => {
        try {
            localStorage.setItem('tripHistory', JSON.stringify(tripHistory));
        } catch (error) {
            console.error("Failed to save trip history to localStorage", error);
        }
    }, [tripHistory]);
    
    useEffect(() => {
        try {
            localStorage.setItem('vehicles', JSON.stringify(vehicles));
        } catch (error) {
             console.error("Failed to save vehicles to localStorage", error);
        }
    }, [vehicles]);

    const handleSaveCompanySettings = (header: string | null, footer: string | null) => {
        setCompanyHeader(header);
        setCompanyFooter(footer);
        try {
            if (header) localStorage.setItem('companyHeader', header);
            else localStorage.removeItem('companyHeader');
            
            if (footer) localStorage.setItem('companyFooter', footer);
            else localStorage.removeItem('companyFooter');
        } catch (e) {
            console.error("Failed to save company settings locally", e);
            alert("Erro ao salvar imagens. Verifique se o tamanho não é muito grande.");
        }
    };

    // --- Backup & Restore Logic ---

    const handleBackup = () => {
        try {
            const dataToExport = {
                version: 1,
                date: new Date().toISOString(),
                tripHistory,
                vehicles,
                currentTrip,
                currentExpenses: expenses, // Ensure we use current expenses state
                companyHeader,
                companyFooter
            };
            
            const jsonString = JSON.stringify(dataToExport);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_despesas_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Backup failed:", e);
            alert("Erro ao gerar backup. Tente novamente.");
        }
    };

    const handleRestore = async (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                // Basic validation
                if (!json || typeof json !== 'object') {
                    throw new Error("Formato inválido");
                }

                // Update States
                if (Array.isArray(json.tripHistory)) setTripHistory(json.tripHistory);
                if (Array.isArray(json.vehicles)) setVehicles(json.vehicles);
                
                // Restore current trip if exists, or clear it
                if (json.currentTrip) {
                    setCurrentTrip(json.currentTrip);
                    if (Array.isArray(json.currentExpenses)) {
                        setExpenses(json.currentExpenses);
                    } else {
                        setExpenses([]);
                    }
                } else {
                    setCurrentTrip(null);
                    setExpenses([]);
                }

                // Restore settings
                setCompanyHeader(json.companyHeader || null);
                setCompanyFooter(json.companyFooter || null);
                
                // Force persist to localStorage immediately to sync state
                localStorage.setItem('tripHistory', JSON.stringify(json.tripHistory || []));
                localStorage.setItem('vehicles', JSON.stringify(json.vehicles || []));
                
                if (json.currentTrip) {
                    localStorage.setItem('currentTrip', JSON.stringify(json.currentTrip));
                    localStorage.setItem('currentExpenses', JSON.stringify(json.currentExpenses || []));
                } else {
                    localStorage.removeItem('currentTrip');
                    localStorage.removeItem('currentExpenses');
                }

                if (json.companyHeader) localStorage.setItem('companyHeader', json.companyHeader);
                else localStorage.removeItem('companyHeader');

                if (json.companyFooter) localStorage.setItem('companyFooter', json.companyFooter);
                else localStorage.removeItem('companyFooter');

                alert("Dados restaurados com sucesso!");
                // Reset views
                setIsTripSetupOpen(!json.currentTrip && (!json.tripHistory || json.tripHistory.length === 0));
                setViewingHistoryTrip(null);

            } catch (err) {
                console.error("Restore failed:", err);
                alert("Erro ao restaurar arquivo. Verifique se é um backup válido.");
            }
        };
        reader.readAsText(file);
    };


    // --- App Logic ---

    const handleStartTrip = (trip: Trip) => {
        setCurrentTrip(trip);
        setExpenses([]); 
        setIsTripSetupOpen(false);
        setViewingHistoryTrip(null);
    };

    const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...expense,
            id: Date.now(),
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
        if (viewingHistoryTrip && viewingHistoryTrip.id === tripId) {
            setViewingHistoryTrip(null);
        }
    };
    
    const handleSelectHistoryTrip = (record: TripRecord) => {
        setViewingHistoryTrip(record);
    };
    
    const handleAddVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
        const newVehicle = { ...vehicle, id: Date.now() };
        setVehicles(prev => [...prev, newVehicle]);
    };
    
    const handleDeleteVehicle = (id: number) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
    };

    useEffect(() => {
        const hasActiveTrip = !!localStorage.getItem('currentTrip');
        const storedHistory = localStorage.getItem('tripHistory');
        const hasHistory = storedHistory && JSON.parse(storedHistory).length > 0;
        if (!hasActiveTrip && !hasHistory) {
            setIsTripSetupOpen(true);
        }
    }, []);

    const activeTripData = currentTrip 
        ? { trip: currentTrip, expenses: expenses } 
        : (viewingHistoryTrip ? { trip: viewingHistoryTrip.trip, expenses: viewingHistoryTrip.expenses } : null);

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
                vehicles={vehicles}
                onAddVehicle={handleAddVehicle}
                onDeleteVehicle={handleDeleteVehicle}
            />

            <CompanySettings 
                isOpen={isCompanySettingsOpen}
                onClose={() => setIsCompanySettingsOpen(false)}
                onSave={handleSaveCompanySettings}
                initialHeader={companyHeader}
                initialFooter={companyFooter}
            />

            <BackupModal
                isOpen={isBackupModalOpen}
                onClose={() => setIsBackupModalOpen(false)}
                onBackup={handleBackup}
                onRestore={handleRestore}
            />

            {isReportModalOpen && activeTripData && (
                <ReportModal 
                    trip={activeTripData.trip}
                    expenses={activeTripData.expenses}
                    onClose={() => setIsReportModalOpen(false)}
                    onEndTrip={handleEndTrip}
                    setIsGenerating={setIsGenerating}
                    isHistoryView={!!viewingHistoryTrip && !currentTrip}
                    companyHeader={companyHeader}
                    companyFooter={companyFooter}
                />
            )}

            {currentTrip ? (
                <ExpenseTracker
                    trip={currentTrip}
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onShowReportModal={() => setIsReportModalOpen(true)}
                />
            ) : viewingHistoryTrip ? (
                 <ExpenseTracker
                    trip={viewingHistoryTrip.trip}
                    expenses={viewingHistoryTrip.expenses}
                    onShowReportModal={() => setIsReportModalOpen(true)}
                    readOnly={true}
                    onBack={() => setViewingHistoryTrip(null)}
                />
            ) : (
                <TripHistory
                    trips={tripHistory}
                    onStartNewTrip={() => setIsTripSetupOpen(true)}
                    onDeleteTrip={handleDeleteTrip}
                    onSelectTrip={handleSelectHistoryTrip}
                    onOpenCompanySettings={() => setIsCompanySettingsOpen(true)}
                    onOpenBackup={() => setIsBackupModalOpen(true)}
                />
            )}
        </>
    );
};

export default App;
