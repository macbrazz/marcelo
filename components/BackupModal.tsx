
import React, { useRef } from 'react';
import { DownloadIcon, UploadIcon } from './icons';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm("ATENÇÃO: A restauração substituirá TODOS os dados atuais (viagens, configurações, veículos) pelos dados do arquivo. Deseja continuar?")) {
          onRestore(file);
          onClose();
      }
    }
    // Clear input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Backup & Dados</h2>
            <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 leading-none">
            &times;
            </button>
        </div>
        
        <p className="text-slate-500 mb-6 text-sm">
            Salve suas informações localmente ou restaure um backup anterior.
        </p>

        <div className="space-y-4">
          <button 
            onClick={onBackup}
            className="w-full py-4 px-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-3"
          >
            <DownloadIcon className="w-6 h-6" />
            <div className="text-left">
                <span className="block text-sm font-bold">Fazer Backup</span>
                <span className="block text-xs font-normal opacity-80">Salvar dados em arquivo</span>
            </div>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-slate-400">OU</span>
            </div>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-3"
          >
             <UploadIcon className="w-6 h-6" />
             <div className="text-left">
                <span className="block text-sm font-bold">Restaurar Dados</span>
                <span className="block text-xs font-normal opacity-80">Carregar arquivo de backup</span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="mt-6 bg-yellow-50 p-3 rounded-md border border-yellow-100">
            <p className="text-xs text-yellow-800 text-center">
                Nota: O arquivo de backup contém suas despesas e imagens. Guarde-o em local seguro.
            </p>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
