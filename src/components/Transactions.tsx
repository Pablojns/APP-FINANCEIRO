"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X,
  Check,
} from "lucide-react";
import { AppData, Transaction, TransactionCategory, TransactionType } from "@/lib/types";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/store";
import { formatCurrency, formatDate, categoryLabel } from "@/lib/utils";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import { getTransactionInsights } from "@/lib/aiInsights";

interface TransactionsProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  onTabChange?: (tab: string) => void;
}

const incomeCategories: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment",
  "other_income",
];

const expenseCategories: TransactionCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "education",
  "entertainment",
  "clothing",
  "utilities",
  "other_expense",
];

interface FormState {
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: string;
  date: string;
}

const emptyForm: FormState = {
  type: "expense",
  category: "food",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

export default function Transactions({ data, onDataChange, onTabChange }: TransactionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return data.transactions
      .filter((t) => {
        const matchType = filterType === "all" || t.type === filterType;
        const matchSearch =
          !search ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          categoryLabel(t.category).toLowerCase().includes(search.toLowerCase());
        const matchMonth = !filterMonth || t.date.startsWith(filterMonth);
        return matchType && matchSearch && matchMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.transactions, filterType, search, filterMonth]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const aiInsights = useMemo(() => getTransactionInsights(data), [data]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(t: Transaction) {
    setForm({
      type: t.type,
      category: t.category,
      description: t.description,
      amount: String(t.amount),
      date: t.date,
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.description.trim() || !form.amount || !form.date) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingId) {
      const updated = updateTransaction(data, {
        id: editingId,
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount,
        date: form.date,
      });
      onDataChange(updated);
    } else {
      const updated = addTransaction(data, {
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount,
        date: form.date,
      });
      onDataChange(updated);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      onDataChange(deleteTransaction(data, id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  const categories = form.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>
            Lançamentos
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Registre receitas e despesas
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Novo Lançamento
        </button>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel insights={aiInsights} onActionClick={onTabChange} compact />

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>Receitas</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>
            {formatCurrency(totals.income)}
          </div>
        </div>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>Despesas</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444" }}>
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>Saldo</div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: totals.balance >= 0 ? "#3b82f6" : "#ef4444",
            }}
          >
            {formatCurrency(totals.balance)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "200px",
            position: "relative",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "10px",
              color: "#f1f5f9",
              fontSize: "14px",
            }}
          />
        </div>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "10px",
            color: "#f1f5f9",
            fontSize: "14px",
          }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: filterType === type ? "#3b82f6" : "#334155",
                background: filterType === type ? "rgba(59,130,246,0.15)" : "transparent",
                color: filterType === type ? "#60a5fa" : "#64748b",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: filterType === type ? 600 : 400,
              }}
            >
              {type === "all" ? "Todos" : type === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
            Nenhum lançamento encontrado
          </div>
        ) : (
          filtered.map((t, idx) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: idx < filtered.length - 1 ? "1px solid #1e3a5f" : "none",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background:
                    t.type === "income" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.type === "income" ? (
                  <ArrowUpRight size={18} color="#10b981" />
                ) : (
                  <ArrowDownRight size={18} color="#ef4444" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#f1f5f9" }}>
                  {t.description}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {categoryLabel(t.category)} • {formatDate(t.date)}
                </div>
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: t.type === "income" ? "#10b981" : "#ef4444",
                  flexShrink: 0,
                }}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(t)}
                  style={{
                    padding: "6px",
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{
                    padding: "6px",
                    background:
                      deleteConfirm === t.id
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(239,68,68,0.1)",
                    border: `1px solid ${deleteConfirm === t.id ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#f87171",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {deleteConfirm === t.id ? <Check size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
                {editingId ? "Editar Lançamento" : "Novo Lançamento"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Type toggle */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => {
                  setForm((f) => ({ ...f, type: "income", category: "salary" }));
                }}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid",
                  borderColor: form.type === "income" ? "#10b981" : "#334155",
                  background: form.type === "income" ? "rgba(16,185,129,0.1)" : "transparent",
                  color: form.type === "income" ? "#10b981" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <ArrowUpRight size={16} />
                Receita
              </button>
              <button
                onClick={() => {
                  setForm((f) => ({ ...f, type: "expense", category: "food" }));
                }}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid",
                  borderColor: form.type === "expense" ? "#ef4444" : "#334155",
                  background: form.type === "expense" ? "rgba(239,68,68,0.1)" : "transparent",
                  color: form.type === "expense" ? "#ef4444" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <ArrowDownRight size={16} />
                Despesa
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", display: "block" }}>
                  Descrição
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Salário, Aluguel..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", display: "block" }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", display: "block" }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "6px", display: "block" }}>
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as TransactionCategory }))
                  }
                  style={inputStyle}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 2,
                  padding: "12px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {editingId ? "Salvar Alterações" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: "14px",
};
