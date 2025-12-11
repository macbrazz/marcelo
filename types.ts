
export enum ExpenseCategory {
  ALIMENTACAO = 'Alimentação',
  CAFE = 'Café',
  HOSPEDAGEM = 'Hospedagem',
  COMBUSTIVEL = 'Combustível',
  PEDAGIO = 'Pedágio',
  ESTACIONAMENTO = 'Estacionamento',
  DIVERSOS = 'Diversos',
}

export interface Vehicle {
  id: number;
  model: string;
  plate: string;
}

export type BudgetMethod = 'Pix' | 'Espécie';

export interface Trip {
  destination: string;
  participants: string;
  date: string;
  budget: number;
  budgetMethod?: BudgetMethod; // Método do aporte
  vehicle?: Vehicle; // Veículo vinculado à viagem
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  receipt?: string; // Base64 encoded image
}

export interface TripRecord {
  id: number;
  trip: Trip;
  expenses: Expense[];
  total: number;
}
