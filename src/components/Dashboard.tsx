"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AppData } from "@/lib/types";
import { formatCurrency, categoryLabel, categoryColor, getMonthName } from "@/lib/utils";

interface DashboardProps {
  data: AppData;
}

type Period = "monthly" | "quarterly" | "annual";

export default function Dashboard({ data }: DashboardProps) {
  const [period, setPeriod] = useState<Period>("monthly");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const summaryData = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const monthTransactions = data.transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const cardTotal = data.cardExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalIncome, totalExpense, balance, cardTotal };
  }, [data]);

  const chartData = useMemo(() => {
    if (period === "monthly") {
      // Last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - 1 - i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthTx = data.transactions.filter((t) => {
          const td = new Date(t.date);
          return td.getMonth() + 1 === m && td.getFullYear() === y;
        });
        const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        months.push({ name: getMonthName(m), income, expense, balance: income - expense });
      }
      return months;
    } else if (period === "quarterly") {
      // Last 4 quarters
      const quarters = [];
      for (let i = 3; i >= 0; i--) {
        const quarterStart = new Date(currentYear, currentMonth - 1 - i * 3 - 2, 1);
        const quarterMonths = [0, 1, 2].map((offset) => {
          const d = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + offset, 1);
          return { month: d.getMonth() + 1, year: d.getFullYear() };
        });
        const income = data.transactions
          .filter((t) => {
            const td = new Date(t.date);
            return (
              t.type === "income" &&
              quarterMonths.some(
                (qm) => qm.month === td.getMonth() + 1 && qm.year === td.getFullYear()
              )
            );
          })
          .reduce((s, t) => s + t.amount, 0);
        const expense = data.transactions
          .filter((t) => {
            const td = new Date(t.date);
            return (
              t.type === "expense" &&
              quarterMonths.some(
                (qm) => qm.month === td.getMonth() + 1 && qm.year === td.getFullYear()
              )
            );
          })
          .reduce((s, t) => s + t.amount, 0);
        const qNum = Math.ceil((quarterStart.getMonth() + 1) / 3);
        quarters.push({
          name: `T${qNum}/${quarterStart.getFullYear()}`,
          income,
          expense,
          balance: income - expense,
        });
      }
      return quarters;
    } else {
      // Annual - last 3 years
      const years = [];
      for (let i = 2; i >= 0; i--) {
        const y = currentYear - i;
        const yearTx = data.transactions.filter((t) => new Date(t.date).getFullYear() === y);
        const income = yearTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = yearTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        years.push({ name: String(y), income, expense, balance: income - expense });
      }
      return years;
    }
  }, [data, period, currentYear, currentMonth]);

  const expenseByCategory = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthExpenses = data.transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    const grouped: Record<string, number> = {};
    monthExpenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([cat, amount]) => ({
        name: categoryLabel(cat as Parameters<typeof categoryLabel>[0]),
        value: amount,
        color: categoryColor(cat as Parameters<typeof categoryColor>[0]),
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const recentTransactions = useMemo(() => {
    return [...data.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [data]);

  const totalGoalsProgress = useMemo(() => {
    if (data.goals.length === 0) return 0;
    const total = data.goals.reduce((s, g) => s + g.targetAmount, 0);
    const current = data.goals.reduce((s, g) => s + g.currentAmount, 0);
    return total > 0 ? (current / total) * 100 : 0;
  }, [data]);

  const cardUsage = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return data.cards.map((card) => {
      const spent = data.cardExpenses
        .filter((e) => {
          const d = new Date(e.date);
          return e.cardId === card.id && d.getMonth() + 1 === month && d.getFullYear() === year;
        })
        .reduce((s, e) => s + e.amount, 0);
      return { ...card, spent, usage: card.limit > 0 ? (spent / card.limit) * 100 : 0 };
    });
  }, [data]);

  return (
    <div style={{ padding: "24px", maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Visão geral das suas finanças
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <SummaryCard
          title="Receitas do Mês"
          value={formatCurrency(summaryData.totalIncome)}
          icon={<TrendingUp size={20} />}
          color="#10b981"
          bgColor="rgba(16,185,129,0.1)"
          trend="+12%"
          trendUp
        />
        <SummaryCard
          title="Despesas do Mês"
          value={formatCurrency(summaryData.totalExpense)}
          icon={<TrendingDown size={20} />}
          color="#ef4444"
          bgColor="rgba(239,68,68,0.1)"
          trend="+5%"
          trendUp={false}
        />
        <SummaryCard
          title="Saldo do Mês"
          value={formatCurrency(summaryData.balance)}
          icon={<DollarSign size={20} />}
          color={summaryData.balance >= 0 ? "#3b82f6" : "#ef4444"}
          bgColor={summaryData.balance >= 0 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)"}
        />
        <SummaryCard
          title="Fatura Cartões"
          value={formatCurrency(summaryData.cardTotal)}
          icon={<CreditCard size={20} />}
          color="#8b5cf6"
          bgColor="rgba(139,92,246,0.1)"
        />
        <SummaryCard
          title="Progresso Metas"
          value={`${totalGoalsProgress.toFixed(0)}%`}
          icon={<Target size={20} />}
          color="#f59e0b"
          bgColor="rgba(245,158,11,0.1)"
        />
      </div>

      {/* Period Filter + Bar Chart */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
            Receitas vs Despesas
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["monthly", "quarterly", "annual"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: period === p ? "#3b82f6" : "#334155",
                  background: period === p ? "rgba(59,130,246,0.15)" : "transparent",
                  color: period === p ? "#60a5fa" : "#64748b",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: period === p ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {p === "monthly" ? "Mensal" : p === "quarterly" ? "Trimestral" : "Anual"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value) => [formatCurrency(Number(value)), ""]}
            />
            <Legend
              wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
              formatter={(value) =>
                value === "income" ? "Receitas" : value === "expense" ? "Despesas" : "Saldo"
              }
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income" />
            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="expense" />
            <Bar dataKey="balance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="balance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Expense by category pie */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
            Despesas por Categoria
          </h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", color: "#475569", padding: "40px 0" }}>
              Nenhuma despesa este mês
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
            Últimos Lançamentos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "#0f172a",
                  borderRadius: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: t.type === "income" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight size={16} color="#10b981" />
                    ) : (
                      <ArrowDownRight size={16} color="#ef4444" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9" }}>
                      {t.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {categoryLabel(t.category)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: t.type === "income" ? "#10b981" : "#ef4444",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", padding: "20px 0" }}>
                Nenhum lançamento ainda
              </div>
            )}
          </div>
        </div>

        {/* Card usage */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
            Uso dos Cartões
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {cardUsage.map((card) => (
              <div key={card.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: card.color,
                      }}
                    />
                    <span style={{ fontSize: "13px", color: "#f1f5f9" }}>
                      {card.name} •••• {card.lastFourDigits}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {formatCurrency(card.spent)} / {formatCurrency(card.limit)}
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "#0f172a",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(card.usage, 100)}%`,
                      background:
                        card.usage > 80
                          ? "#ef4444"
                          : card.usage > 60
                          ? "#f59e0b"
                          : card.color,
                      borderRadius: "3px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  {card.usage.toFixed(0)}% utilizado
                </div>
              </div>
            ))}
            {cardUsage.length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", padding: "20px 0" }}>
                Nenhum cartão cadastrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
}

function SummaryCard({ title, value, icon, color, bgColor, trend, trendUp }: SummaryCardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>{title}</span>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>{value}</div>
      {trend && (
        <div
          style={{
            fontSize: "12px",
            color: trendUp ? "#10b981" : "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend} vs mês anterior
        </div>
      )}
    </div>
  );
}
