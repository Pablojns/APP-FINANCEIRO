export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "other_income"
  | "food"
  | "transport"
  | "housing"
  | "health"
  | "education"
  | "entertainment"
  | "clothing"
  | "utilities"
  | "other_expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // ISO date string
  cardId?: string; // optional link to a card
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyTarget: number;
  deadline: string; // ISO date string
  color: string;
  icon: string;
}

export interface Card {
  id: string;
  name: string;
  lastFourDigits: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface CardExpense {
  id: string;
  cardId: string;
  description: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  installments?: number;
  currentInstallment?: number;
}

export type ReportPeriod = "monthly" | "quarterly" | "annual";

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  cards: Card[];
  cardExpenses: CardExpense[];
}
