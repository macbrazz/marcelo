
import React from 'react';
import { ExpenseCategory } from '../types';

interface IconProps {
  className?: string;
}

export const FoodIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M18 3v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3M12 3v12M12 3a2 2 0 1 1 4 0v12M12 3a2 2 0 1 0-4 0v12"/>
  </svg>
);

export const LodgingIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 21h20M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 10V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"/>
  </svg>
);

export const FuelIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 7h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1M9 16V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1M3 13h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/>
  </svg>
);

export const ParkingIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4"/>
    <path d="M10 12h4"/><path d="M12 10v4"/><path d="M10 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1"/>
  </svg>
);

export const MiscIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const getCategoryIcon = (category: ExpenseCategory, className?: string) => {
    switch(category) {
        case ExpenseCategory.ALIMENTACAO: return <FoodIcon className={className} />;
        case ExpenseCategory.HOSPEDAGEM: return <LodgingIcon className={className} />;
        case ExpenseCategory.COMBUSTIVEL: return <FuelIcon className={className} />;
        case ExpenseCategory.ESTACIONAMENTO: return <ParkingIcon className={className} />;
        case ExpenseCategory.DIVERSOS: return <MiscIcon className={className} />;
        default: return <MiscIcon className={className} />;
    }
}
