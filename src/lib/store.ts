"use client";

import { AppData, Transaction, Goal, Card, CardExpense } from "./types";

const STORAGE_KEY = "financeapp_data";

const defaultData: AppData = {
  transactions: [
    {
      id: "t1",
      type: "income",
      category: "salary",
      description: "Salário Janeiro",
      amount: 5000,
      date: "2026-01-05",
    },
    {
      id: "t2",
      type: "expense",
      category: "housing",
      description: "Aluguel",
      amount: 1500,
      date: "2026-01-10",
    },
    {
      id: "t3",
      type: "expense",
      category: "food",
      description: "Supermercado",
      amount: 450,
      date: "2026-01-15",
    },
    {
      id: "t4",
      type: "income",
      category: "salary",
      description: "Salário Fevereiro",
      amount: 5000,
      date: "2026-02-05",
    },
    {
      id: "t5",
      type: "expense",
      category: "housing",
      description: "Aluguel",
      amount: 1500,
      date: "2026-02-10",
    },
    {
      id: "t6",
      type: "expense",
      category: "transport",
      description: "Combustível",
      amount: 200,
      date: "2026-02-12",
    },
    {
      id: "t7",
      type: "expense",
      category: "health",
      description: "Plano de Saúde",
      amount: 350,
      date: "2026-02-15",
    },
    {
      id: "t8",
      type: "income",
      category: "freelance",
      description: "Projeto Freelance",
      amount: 1200,
      date: "2026-02-20",
    },
  ],
  goals: [
    {
      id: "g1",
      name: "Reserva de Emergência",
      targetAmount: 15000,
      currentAmount: 4500,
      monthlyTarget: 500,
      deadline: "2027-06-01",
      color: "#3b82f6",
      icon: "shield",
    },
    {
      id: "g2",
      name: "Viagem Europa",
      targetAmount: 8000,
      currentAmount: 2000,
      monthlyTarget: 400,
      deadline: "2027-01-01",
      color: "#10b981",
      icon: "plane",
    },
  ],
  cards: [
    {
      id: "c1",
      name: "Nubank",
      lastFourDigits: "1234",
      limit: 5000,
      closingDay: 15,
      dueDay: 22,
      color: "#8b5cf6",
    },
    {
      id: "c2",
      name: "Itaú Visa",
      lastFourDigits: "5678",
      limit: 8000,
      closingDay: 10,
      dueDay: 17,
      color: "#f59e0b",
    },
  ],
  cardExpenses: [
    {
      id: "ce1",
      cardId: "c1",
      description: "Netflix",
      amount: 39.9,
      date: "2026-02-01",
      category: "entertainment",
    },
    {
      id: "ce2",
      cardId: "c1",
      description: "Restaurante",
      amount: 120,
      date: "2026-02-08",
      category: "food",
    },
    {
      id: "ce3",
      cardId: "c1",
      description: "Roupas",
      amount: 250,
      date: "2026-02-10",
      category: "clothing",
    },
    {
      id: "ce4",
      cardId: "c2",
      description: "Eletrônico",
      amount: 899,
      date: "2026-02-05",
      category: "other_expense",
      installments: 6,
      currentInstallment: 1,
    },
    {
      id: "ce5",
      cardId: "c2",
      description: "Farmácia",
      amount: 85,
      date: "2026-02-14",
      category: "health",
    },
  ],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return defaultData;
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Transaction helpers
export function addTransaction(data: AppData, transaction: Omit<Transaction, "id">): AppData {
  const newData = {
    ...data,
    transactions: [...data.transactions, { ...transaction, id: generateId() }],
  };
  saveData(newData);
  return newData;
}

export function updateTransaction(data: AppData, transaction: Transaction): AppData {
  const newData = {
    ...data,
    transactions: data.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
  };
  saveData(newData);
  return newData;
}

export function deleteTransaction(data: AppData, id: string): AppData {
  const newData = {
    ...data,
    transactions: data.transactions.filter((t) => t.id !== id),
  };
  saveData(newData);
  return newData;
}

// Goal helpers
export function addGoal(data: AppData, goal: Omit<Goal, "id">): AppData {
  const newData = {
    ...data,
    goals: [...data.goals, { ...goal, id: generateId() }],
  };
  saveData(newData);
  return newData;
}

export function updateGoal(data: AppData, goal: Goal): AppData {
  const newData = {
    ...data,
    goals: data.goals.map((g) => (g.id === goal.id ? goal : g)),
  };
  saveData(newData);
  return newData;
}

export function deleteGoal(data: AppData, id: string): AppData {
  const newData = {
    ...data,
    goals: data.goals.filter((g) => g.id !== id),
  };
  saveData(newData);
  return newData;
}

// Card helpers
export function addCard(data: AppData, card: Omit<Card, "id">): AppData {
  const newData = {
    ...data,
    cards: [...data.cards, { ...card, id: generateId() }],
  };
  saveData(newData);
  return newData;
}

export function updateCard(data: AppData, card: Card): AppData {
  const newData = {
    ...data,
    cards: data.cards.map((c) => (c.id === card.id ? card : c)),
  };
  saveData(newData);
  return newData;
}

export function deleteCard(data: AppData, id: string): AppData {
  const newData = {
    ...data,
    cards: data.cards.filter((c) => c.id !== id),
    cardExpenses: data.cardExpenses.filter((e) => e.cardId !== id),
  };
  saveData(newData);
  return newData;
}

// Card expense helpers
export function addCardExpense(data: AppData, expense: Omit<CardExpense, "id">): AppData {
  const newData = {
    ...data,
    cardExpenses: [...data.cardExpenses, { ...expense, id: generateId() }],
  };
  saveData(newData);
  return newData;
}

export function updateCardExpense(data: AppData, expense: CardExpense): AppData {
  const newData = {
    ...data,
    cardExpenses: data.cardExpenses.map((e) => (e.id === expense.id ? expense : e)),
  };
  saveData(newData);
  return newData;
}

export function deleteCardExpense(data: AppData, id: string): AppData {
  const newData = {
    ...data,
    cardExpenses: data.cardExpenses.filter((e) => e.id !== id),
  };
  saveData(newData);
  return newData;
}
