import { TransactionCategory } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function categoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    salary: "Salário",
    freelance: "Freelance",
    investment: "Investimento",
    other_income: "Outra Receita",
    food: "Alimentação",
    transport: "Transporte",
    housing: "Moradia",
    health: "Saúde",
    education: "Educação",
    entertainment: "Entretenimento",
    clothing: "Vestuário",
    utilities: "Contas/Serviços",
    other_expense: "Outra Despesa",
  };
  return labels[category] || category;
}

export function categoryColor(category: TransactionCategory): string {
  const colors: Record<TransactionCategory, string> = {
    salary: "#10b981",
    freelance: "#3b82f6",
    investment: "#8b5cf6",
    other_income: "#06b6d4",
    food: "#f59e0b",
    transport: "#6366f1",
    housing: "#ef4444",
    health: "#ec4899",
    education: "#14b8a6",
    entertainment: "#f97316",
    clothing: "#a855f7",
    utilities: "#64748b",
    other_expense: "#94a3b8",
  };
  return colors[category] || "#94a3b8";
}

export function getMonthName(month: number): string {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return months[month - 1] || "";
}

export function getFullMonthName(month: number): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return months[month - 1] || "";
}
