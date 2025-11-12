import React, { useState, useCallback } from 'react';
import { Trip, Expense } from './types';
import TripSetup from './components/TripSetup';
import ExpenseTracker from './components/ExpenseTracker';

// To satisfy TypeScript since jsPDF is loaded from a script tag
declare const window: any;

const App: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateReport = useCallback(async () => {
    if (!trip) return;
    setIsGenerating(true);

    try {
        const { jsPDF } = window.jspdf;
        const safeFilename = trip.destination.replace(/\s/g, '_');

        // --- PDF 1: Summary Report ---
        const summaryDoc = new jsPDF();
        
        // Header
        summaryDoc.setFontSize(22);
        summaryDoc.text("Relatório de Despesas de Viagem", 105, 20, { align: 'center' });
        
        summaryDoc.setFontSize(12);
        summaryDoc.text(`Destino: ${trip.destination}`, 15, 40);
        summaryDoc.text(`Participantes: ${trip.participants}`, 15, 48);
        summaryDoc.text(`Data de Início: ${new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR')}`, 15, 56);
        
        // Summary
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        summaryDoc.setFontSize(16);
        summaryDoc.text(`Total de Despesas: R$ ${total.toFixed(2).replace('.', ',')}`, 15, 70);
        
        // Expenses List
        if (expenses.length > 0) {
            summaryDoc.setFontSize(14);
            summaryDoc.text("Lista de Despesas", 15, 85);
            let yPos = 95;
            expenses.forEach((exp, index) => {
                if (yPos > 270) { // New page if content overflows
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

        summaryDoc.save(`resumo_viagem_${safeFilename}.pdf`);

        // --- PDF 2: Receipts ---
        const expensesWithReceipts = expenses.filter(e => e.receipt);
        if (expensesWithReceipts.length > 0) {
            const receiptsDoc = new jsPDF();
            receiptsDoc.setFontSize(22);
            receiptsDoc.text("Comprovantes da Viagem", 105, 20, { align: 'center' });

            expensesWithReceipts.forEach((exp, index) => {
                try {
                    if (index > 0) {
                        receiptsDoc.addPage();
                    }
                    receiptsDoc.setFontSize(12);
                    receiptsDoc.text(`Comprovante ${index + 1}: ${exp.category} - R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, 20);
                    // Add image - A4 is 210x297mm. We use some margins.
                    receiptsDoc.addImage(exp.receipt, 'JPEG', 15, 30, 180, 160, undefined, 'FAST');
                } catch (e) {
                    console.error("Error adding image to PDF: ", e);
                    if (index > 0) receiptsDoc.addPage();
                    receiptsDoc.text(`Erro ao carregar imagem do comprovante ${index + 1}.`, 15, 40);
                }
            });
            receiptsDoc.save(`comprovantes_viagem_${safeFilename}.pdf`);
        }
        
        if (window.confirm('Relatórios gerados! Deseja encerrar a viagem e limpar os dados?')) {
            setTrip(null);
            setExpenses([]);
        }

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Ocorreu um erro ao gerar os relatórios em PDF.");
    } finally {
        setIsGenerating(false);
    }
  }, [trip, expenses]);
  
  if(isGenerating) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold mt-4">Gerando Relatórios...</h2>
            <p className="text-slate-500">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <TripSetup onTripStart={handleStartTrip} />;
  }

  return (
    <ExpenseTracker
      trip={trip}
      expenses={expenses}
      onAddExpense={handleAddExpense}
      onGenerateReport={handleGenerateReport}
    />
  );
};

export default App;
