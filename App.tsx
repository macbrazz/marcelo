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
                if (expenses.length === 0) {
                    alert('Não há despesas para gerar um relatório de comprovantes.');
                    setIsGenerating(false);
                    return;
                }

                const receiptsDoc = new jsPDF();
                receiptsDoc.setFontSize(22);
                receiptsDoc.text("Comprovantes da Viagem", 105, 15, { align: 'center' });
                receiptsDoc.setFontSize(10);
                receiptsDoc.text(`Destino: ${trip.destination}`, 105, 22, { align: 'center' });

                expenses.forEach((exp, index) => {
                    if (index > 0) receiptsDoc.addPage();

                    receiptsDoc.setFontSize(12);
                    receiptsDoc.text(`Despesa ${index + 1}: ${exp.category} - R$ ${exp.amount.toFixed(2).replace('.', ',')}`, 15, 20);
                    
                    if (exp.receipt) {
                        try {
                            receiptsDoc.addImage(exp.receipt, 'JPEG', 15, 