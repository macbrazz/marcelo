import React from 'react';

interface PdfPreviewModalProps {
  pdfDataUri: string;
  onClose: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ pdfDataUri, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex flex-col items-center justify-center p-2">
      <div className="w-full h-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col">
        <header className="flex justify-between items-center p-3 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-700">Visualização do PDF</h2>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold"
            aria-label="Fechar visualização do PDF"
          >
            Fechar
          </button>
        </header>
        <div className="flex-grow p-1 bg-slate-100">
          <iframe
            src={pdfDataUri}
            title="Pré-visualização do PDF"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
