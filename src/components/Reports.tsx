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
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AppData, ReportPeriod } from "@/lib/types";
import { formatCurrency, categoryLabel, categoryColor, getMonthName } from "@/lib/utils";

interface ReportsProps {
  data: AppData;
}

export default function Reports({ data }: ReportsProps) {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.transactions.forEach((t) => years.add(new Date(t.date).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [data.transactions, currentYear]);

  const barChartData = useMemo(() => {
    if (period === "monthly") {
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const monthTx = data.transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() + 1 === m && d.getFullYear() === selectedYear;
        });
        const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return {
          name: getMonthName(m),
          Receitas: income,
          Despesas: expense,
          Saldo: income - expense,
        };
      });
    } else if (period === "quarterly") {
      return Array.from({ length: 4 }, (_, i) => {
        const quarterMonths = [i * 3 + 1, i * 3 + 2, i * 3 + 3];
        const quarterTx = data.transactions.filter((t) => {
          const d = new Date(t.date);
          return quarterMonths.includes(d.getMonth() + 1) && d.getFullYear() === selectedYear;
        });
        const income = quarterTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = quarterTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return {
          name: `T${i + 1}`,
          Receitas: income,
          Despesas: expense,
          Saldo: income - expense,
        };
      });
    } else {
      // Annual - last 5 years
      return Array.from({ length: 5 }, (_, i) => {
        const y = currentYear - 4 + i;
        const yearTx = data.transactions.filter((t) => new Date(t.date).getFullYear() === y);
        const income = yearTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expense = yearTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        return {
          name: String(y),
          Receitas: income,
          Despesas: expense,
          Saldo: income - expense,
        };
      });
    }
  }, [data.transactions, period, selectedYear, currentYear]);

  const categoryBreakdown = useMemo(() => {
    const filtered = data.transactions.filter((t) => {
      if (period === "annual") return true;
      const d = new Date(t.date);
      if (period === "monthly") {
        return d.getFullYear() === selectedYear;
      }
      return d.getFullYear() === selectedYear;
    });

    const expensesByCategory: Record<string, number> = {};
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return Object.entries(expensesByCategory)
      .map(([cat, amount]) => ({
        name: categoryLabel(cat as Parameters<typeof categoryLabel>[0]),
        value: amount,
        color: categoryColor(cat as Parameters<typeof categoryColor>[0]),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data.transactions, period, selectedYear]);

  const lineChartData = useMemo(() => {
    if (period !== "monthly") return [];
    let cumulative = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthTx = data.transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === m && d.getFullYear() === selectedYear;
      });
      const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      cumulative += income - expense;
      return {
        name: getMonthName(m),
        "Saldo Acumulado": cumulative,
      };
    });
  }, [data.transactions, period, selectedYear]);

  const summaryStats = useMemo(() => {
    const filtered = data.transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "annual") return true;
      return d.getFullYear() === selectedYear;
    });
    const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const avgMonthlyExpense = totalExpense / 12;
    return { totalIncome, totalExpense, savingsRate, avgMonthlyExpense };
  }, [data.transactions, period, selectedYear]);

  return (
    <div style={{ padding: "24px", maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>
          Relatórios
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Análise detalhada das suas finanças
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {(["monthly", "quarterly", "annual"] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: period === p ? "#3b82f6" : "#334155",
                background: period === p ? "rgba(59,130,246,0.15)" : "#1e293b",
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
        {period !== "annual" && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              padding: "8px 14px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "10px",
              color: "#f1f5f9",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Receitas",
            value: formatCurrency(summaryStats.totalIncome),
            color: "#10b981",
          },
          {
            label: "Total Despesas",
            value: formatCurrency(summaryStats.totalExpense),
            color: "#ef4444",
          },
          {
            label: "Saldo Líquido",
            value: formatCurrency(summaryStats.totalIncome - summaryStats.totalExpense),
            color:
              summaryStats.totalIncome - summaryStats.totalExpense >= 0 ? "#3b82f6" : "#ef4444",
          },
          {
            label: "Taxa de Poupança",
            value: `${summaryStats.savingsRate.toFixed(1)}%`,
            color: summaryStats.savingsRate >= 20 ? "#10b981" : summaryStats.savingsRate >= 10 ? "#f59e0b" : "#ef4444",
          },
          {
            label: "Média Mensal Despesas",
            value: formatCurrency(summaryStats.avgMonthlyExpense),
            color: "#8b5cf6",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main bar chart */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
          Receitas vs Despesas —{" "}
          {period === "monthly"
            ? `Mensal ${selectedYear}`
            : period === "quarterly"
            ? `Trimestral ${selectedYear}`
            : "Anual (últimos 5 anos)"}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
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
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }} />
            <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Saldo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Category breakdown */}
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
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {categoryBreakdown.map((cat) => {
                  const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? (cat.value / total) * 100 : 0;
                  return (
                    <div
                      key={cat.name}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#94a3b8", flex: 1 }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {pct.toFixed(0)}%
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#f1f5f9" }}>
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#475569", padding: "40px 0" }}>
              Sem dados para o período
            </div>
          )}
        </div>

        {/* Cumulative balance line chart (monthly only) */}
        {period === "monthly" && (
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
              Evolução do Saldo — {selectedYear}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
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
                <Line
                  type="monotone"
                  dataKey="Saldo Acumulado"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top expenses table */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9", marginBottom: "20px" }}>
            Maiores Despesas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.transactions
              .filter((t) => {
                if (t.type !== "expense") return false;
                const d = new Date(t.date);
                if (period === "annual") return true;
                return d.getFullYear() === selectedYear;
              })
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 8)
              .map((t) => (
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
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#f1f5f9" }}>
                      {t.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {categoryLabel(t.category)} •{" "}
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ef4444" }}>
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            {data.transactions.filter((t) => t.type === "expense").length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", padding: "20px 0" }}>
                Sem despesas no período
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
