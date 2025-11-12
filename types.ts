export enum ExpenseCategory {
  ALIMENTACAO = 'Alimentação',
  HOSPEDAGEM = 'Hospedagem',
  COMBUSTIVEL = 'Combustível',
  ESTACIONAMENTO = 'Estacionamento',
  DIVERSOS = 'Diversos',
}

export interface Trip {
  destination: string;
  participants: string;
  date: string;
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  receipt: string; // Base64 encoded image
}

export interface TripRecord {
  id: number;
  trip: Trip;
  expenses: Expense[];
  total: number;
}
