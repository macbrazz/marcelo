
import React, { useState, useEffect } from 'react';
import { TrashIcon, CameraIcon } from './icons';

interface CompanySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (header: string | null, footer: string | null) => void;
  initialHeader: string | null;
  initialFooter: string | null;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ 
    isOpen, 
    onClose, 
    onSave,
    initialHeader,
    initialFooter
}) => {
  const [header, setHeader] = useState<string | null>(initialHeader);
  const [footer, setFooter] = useState<string | null>(initialFooter);

  useEffect(() => {
    if (isOpen) {
        setHeader(initialHeader);
        setFooter(initialFooter);
    }
  }, [isOpen, initialHeader, initialFooter]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'header') setHeader(reader.result as string);
        else setFooter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(header, footer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 animate-fade-in-up relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-3xl text-slate-400 hover:text-slate-600">
          &times;
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Empresa</h2>
        <p className="text-slate-500 text-sm mb-6">Configure o cabeçalho e rodapé para os relatórios PDF.</p>

        <div className="space-y-6">
            {/* Header Upload */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cabeçalho do Relatório
                </label>
                {header ? (
                    <div className="relative border border-slate-200 rounded-lg overflow-hidden">
                        <img src={header} alt="Cabeçalho" className="w-full h-auto max-h-40 object-contain bg-slate-50" />
                        <button 
                            onClick={() => setHeader(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <CameraIcon className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Toque para enviar imagem</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'header')} />
                    </label>
                )}
            </div>

            {/* Footer Upload */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rodapé do Relatório
                </label>
                {footer ? (
                    <div className="relative border border-slate-200 rounded-lg overflow-hidden">
                        <img src={footer} alt="Rodapé" className="w-full h-auto max-h-40 object-contain bg-slate-50" />
                        <button 
                            onClick={() => setFooter(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <CameraIcon className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Toque para enviar imagem</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'footer')} />
                    </label>
                )}
            </div>
        </div>

        <button
            onClick={handleSave}
            className="w-full mt-8 py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
            Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;
