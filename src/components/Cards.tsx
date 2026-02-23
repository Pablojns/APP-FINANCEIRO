"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  X,
  Check,
  ArrowDownRight,
} from "lucide-react";
import { AppData, Card, CardExpense, TransactionCategory } from "@/lib/types";
import {
  addCard,
  updateCard,
  deleteCard,
  addCardExpense,
  updateCardExpense,
  deleteCardExpense,
} from "@/lib/store";
import { formatCurrency, formatDate, categoryLabel } from "@/lib/utils";

interface CardsProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

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

const cardColors = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

interface CardFormState {
  name: string;
  lastFourDigits: string;
  limit: string;
  closingDay: string;
  dueDay: string;
  color: string;
}

interface ExpenseFormState {
  cardId: string;
  description: string;
  amount: string;
  date: string;
  category: TransactionCategory;
  installments: string;
}

const emptyCardForm: CardFormState = {
  name: "",
  lastFourDigits: "",
  limit: "",
  closingDay: "15",
  dueDay: "22",
  color: "#8b5cf6",
};

const emptyExpenseForm: ExpenseFormState = {
  cardId: "",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  category: "food",
  installments: "1",
};

export default function Cards({ data, onDataChange }: CardsProps) {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<CardFormState>(emptyCardForm);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(emptyExpenseForm);

  const [selectedCard, setSelectedCard] = useState<string | null>(
    data.cards.length > 0 ? data.cards[0].id : null
  );
  const [deleteCardConfirm, setDeleteCardConfirm] = useState<string | null>(null);
  const [deleteExpenseConfirm, setDeleteExpenseConfirm] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const activeCard = useMemo(
    () => data.cards.find((c) => c.id === selectedCard) || data.cards[0] || null,
    [data.cards, selectedCard]
  );

  const cardExpenses = useMemo(() => {
    if (!activeCard) return [];
    return data.cardExpenses
      .filter((e) => {
        const matchCard = e.cardId === activeCard.id;
        const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
        return matchCard && matchMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.cardExpenses, activeCard, filterMonth]);

  const cardStats = useMemo(() => {
    if (!activeCard) return { total: 0, usage: 0, available: 0 };
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const total = data.cardExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.cardId === activeCard.id && d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((s, e) => s + e.amount, 0);
    const usage = activeCard.limit > 0 ? (total / activeCard.limit) * 100 : 0;
    const available = Math.max(0, activeCard.limit - total);
    return { total, usage, available };
  }, [data.cardExpenses, activeCard]);

  // Card CRUD
  function openAddCard() {
    setCardForm(emptyCardForm);
    setEditingCardId(null);
    setShowCardForm(true);
  }

  function openEditCard(card: Card) {
    setCardForm({
      name: card.name,
      lastFourDigits: card.lastFourDigits,
      limit: String(card.limit),
      closingDay: String(card.closingDay),
      dueDay: String(card.dueDay),
      color: card.color,
    });
    setEditingCardId(card.id);
    setShowCardForm(true);
  }

  function handleCardSubmit() {
    if (!cardForm.name.trim() || !cardForm.limit) return;
    const limit = parseFloat(cardForm.limit);
    if (isNaN(limit) || limit <= 0) return;

    if (editingCardId) {
      const updated = updateCard(data, {
        id: editingCardId,
        name: cardForm.name.trim(),
        lastFourDigits: cardForm.lastFourDigits,
        limit,
        closingDay: parseInt(cardForm.closingDay) || 15,
        dueDay: parseInt(cardForm.dueDay) || 22,
        color: cardForm.color,
      });
      onDataChange(updated);
    } else {
      const updated = addCard(data, {
        name: cardForm.name.trim(),
        lastFourDigits: cardForm.lastFourDigits,
        limit,
        closingDay: parseInt(cardForm.closingDay) || 15,
        dueDay: parseInt(cardForm.dueDay) || 22,
        color: cardForm.color,
      });
      onDataChange(updated);
      if (updated.cards.length === 1) {
        setSelectedCard(updated.cards[0].id);
      }
    }
    setShowCardForm(false);
    setEditingCardId(null);
  }

  function handleDeleteCard(id: string) {
    if (deleteCardConfirm === id) {
      const updated = deleteCard(data, id);
      onDataChange(updated);
      setDeleteCardConfirm(null);
      if (selectedCard === id) {
        setSelectedCard(updated.cards[0]?.id || null);
      }
    } else {
      setDeleteCardConfirm(id);
      setTimeout(() => setDeleteCardConfirm(null), 3000);
    }
  }

  // Expense CRUD
  function openAddExpense() {
    setExpenseForm({
      ...emptyExpenseForm,
      cardId: activeCard?.id || "",
    });
    setEditingExpenseId(null);
    setShowExpenseForm(true);
  }

  function openEditExpense(expense: CardExpense) {
    setExpenseForm({
      cardId: expense.cardId,
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date,
      category: expense.category,
      installments: String(expense.installments || 1),
    });
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
  }

  function handleExpenseSubmit() {
    if (!expenseForm.description.trim() || !expenseForm.amount || !expenseForm.date) return;
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) return;
    const installments = parseInt(expenseForm.installments) || 1;

    if (editingExpenseId) {
      const updated = updateCardExpense(data, {
        id: editingExpenseId,
        cardId: expenseForm.cardId,
        description: expenseForm.description.trim(),
        amount,
        date: expenseForm.date,
        category: expenseForm.category,
        installments: installments > 1 ? installments : undefined,
        currentInstallment: installments > 1 ? 1 : undefined,
      });
      onDataChange(updated);
    } else {
      const updated = addCardExpense(data, {
        cardId: expenseForm.cardId,
        description: expenseForm.description.trim(),
        amount,
        date: expenseForm.date,
        category: expenseForm.category,
        installments: installments > 1 ? installments : undefined,
        currentInstallment: installments > 1 ? 1 : undefined,
      });
      onDataChange(updated);
    }
    setShowExpenseForm(false);
    setEditingExpenseId(null);
  }

  function handleDeleteExpense(id: string) {
    if (deleteExpenseConfirm === id) {
      onDataChange(deleteCardExpense(data, id));
      setDeleteExpenseConfirm(null);
    } else {
      setDeleteExpenseConfirm(id);
      setTimeout(() => setDeleteExpenseConfirm(null), 3000);
    }
  }

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
            Cartões
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Gerencie seus cartões e faturas
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={openAddCard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "10px",
              color: "#94a3b8",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Novo Cartão
          </button>
          {activeCard && (
            <button
              onClick={openAddExpense}
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
              Lançar Despesa
            </button>
          )}
        </div>
      </div>

      {data.cards.length === 0 ? (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <CreditCard size={48} color="#334155" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#475569", fontSize: "16px" }}>Nenhum cartão cadastrado</p>
          <p style={{ color: "#334155", fontSize: "14px", marginTop: "8px" }}>
            Adicione seu primeiro cartão!
          </p>
        </div>
      ) : (
        <>
          {/* Card selector */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "24px",
              overflowX: "auto",
              paddingBottom: "8px",
            }}
          >
            {data.cards.map((card) => {
              const isSelected = selectedCard === card.id;
              const now = new Date();
              const spent = data.cardExpenses
                .filter((e) => {
                  const d = new Date(e.date);
                  return (
                    e.cardId === card.id &&
                    d.getMonth() + 1 === now.getMonth() + 1 &&
                    d.getFullYear() === now.getFullYear()
                  );
                })
                .reduce((s, e) => s + e.amount, 0);
              const usage = card.limit > 0 ? (spent / card.limit) * 100 : 0;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card.id)}
                  style={{
                    minWidth: "280px",
                    background: isSelected
                      ? `linear-gradient(135deg, ${card.color}, ${card.color}99)`
                      : "#1e293b",
                    border: `2px solid ${isSelected ? card.color : "#334155"}`,
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: isSelected ? "white" : "#f1f5f9",
                        }}
                      >
                        {card.name}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: isSelected ? "rgba(255,255,255,0.7)" : "#64748b",
                        }}
                      >
                        •••• {card.lastFourDigits}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCard(card);
                        }}
                        style={{
                          padding: "5px",
                          background: isSelected ? "rgba(255,255,255,0.2)" : "rgba(59,130,246,0.1)",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: isSelected ? "white" : "#60a5fa",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        style={{
                          padding: "5px",
                          background:
                            deleteCardConfirm === card.id
                              ? "rgba(239,68,68,0.4)"
                              : isSelected
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(239,68,68,0.1)",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: isSelected ? "white" : "#f87171",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {deleteCardConfirm === card.id ? <Check size={13} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: isSelected ? "rgba(255,255,255,0.7)" : "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      Fatura atual
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: isSelected ? "white" : "#f1f5f9",
                        marginBottom: "8px",
                      }}
                    >
                      {formatCurrency(spent)}
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: isSelected ? "rgba(255,255,255,0.3)" : "#0f172a",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(usage, 100)}%`,
                          background: isSelected
                            ? "white"
                            : usage > 80
                            ? "#ef4444"
                            : card.color,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "4px",
                        fontSize: "11px",
                        color: isSelected ? "rgba(255,255,255,0.6)" : "#64748b",
                      }}
                    >
                      <span>{usage.toFixed(0)}% usado</span>
                      <span>Limite: {formatCurrency(card.limit)}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "12px",
                      fontSize: "11px",
                      color: isSelected ? "rgba(255,255,255,0.6)" : "#64748b",
                    }}
                  >
                    <span>Fecha dia {card.closingDay}</span>
                    <span>Vence dia {card.dueDay}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active card stats */}
          {activeCard && (
            <>
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
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    Fatura do Mês
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444" }}>
                    {formatCurrency(cardStats.total)}
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
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    Disponível
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>
                    {formatCurrency(cardStats.available)}
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
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                    Utilização
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color:
                        cardStats.usage > 80
                          ? "#ef4444"
                          : cardStats.usage > 60
                          ? "#f59e0b"
                          : "#3b82f6",
                    }}
                  >
                    {cardStats.usage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Expenses filter */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
                  Lançamentos — {activeCard.name}
                </h2>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#f1f5f9",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Expenses list */}
              <div
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {cardExpenses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
                    Nenhum lançamento neste período
                  </div>
                ) : (
                  cardExpenses.map((expense, idx) => (
                    <div
                      key={expense.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderBottom:
                          idx < cardExpenses.length - 1 ? "1px solid #1e3a5f" : "none",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "rgba(239,68,68,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ArrowDownRight size={18} color="#ef4444" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#f1f5f9" }}>
                          {expense.description}
                          {expense.installments && expense.installments > 1 && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "11px",
                                background: "rgba(139,92,246,0.15)",
                                color: "#a78bfa",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {expense.currentInstallment}/{expense.installments}x
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {categoryLabel(expense.category)} • {formatDate(expense.date)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#ef4444",
                          flexShrink: 0,
                        }}
                      >
                        -{formatCurrency(expense.amount)}
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <button
                          onClick={() => openEditExpense(expense)}
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
                          onClick={() => handleDeleteExpense(expense.id)}
                          style={{
                            padding: "6px",
                            background:
                              deleteExpenseConfirm === expense.id
                                ? "rgba(239,68,68,0.2)"
                                : "rgba(239,68,68,0.1)",
                            border: `1px solid ${deleteExpenseConfirm === expense.id ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                            borderRadius: "8px",
                            cursor: "pointer",
                            color: "#f87171",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {deleteExpenseConfirm === expense.id ? (
                            <Check size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Card Form Modal */}
      {showCardForm && (
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
          onClick={(e) => e.target === e.currentTarget && setShowCardForm(false)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "460px",
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
                {editingCardId ? "Editar Cartão" : "Novo Cartão"}
              </h2>
              <button
                onClick={() => setShowCardForm(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nome do Cartão</label>
                <input
                  type="text"
                  value={cardForm.name}
                  onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Nubank, Itaú Visa..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Últimos 4 dígitos</label>
                  <input
                    type="text"
                    value={cardForm.lastFourDigits}
                    onChange={(e) =>
                      setCardForm((f) => ({
                        ...f,
                        lastFourDigits: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    placeholder="1234"
                    maxLength={4}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Limite (R$)</label>
                  <input
                    type="number"
                    value={cardForm.limit}
                    onChange={(e) => setCardForm((f) => ({ ...f, limit: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Dia de Fechamento</label>
                  <input
                    type="number"
                    value={cardForm.closingDay}
                    onChange={(e) => setCardForm((f) => ({ ...f, closingDay: e.target.value }))}
                    min="1"
                    max="31"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Dia de Vencimento</label>
                  <input
                    type="number"
                    value={cardForm.dueDay}
                    onChange={(e) => setCardForm((f) => ({ ...f, dueDay: e.target.value }))}
                    min="1"
                    max="31"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Cor</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {cardColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCardForm((f) => ({ ...f, color }))}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: color,
                        border: cardForm.color === color ? "3px solid white" : "3px solid transparent",
                        cursor: "pointer",
                        outline: cardForm.color === color ? `2px solid ${color}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setShowCardForm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCardSubmit}
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
                {editingCardId ? "Salvar" : "Adicionar Cartão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
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
          onClick={(e) => e.target === e.currentTarget && setShowExpenseForm(false)}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "460px",
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
                {editingExpenseId ? "Editar Despesa" : "Nova Despesa no Cartão"}
              </h2>
              <button
                onClick={() => setShowExpenseForm(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Cartão</label>
                <select
                  value={expenseForm.cardId}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, cardId: e.target.value }))}
                  style={inputStyle}
                >
                  {data.cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} •••• {card.lastFourDigits}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Netflix, Restaurante..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Valor (R$)</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Data</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        category: e.target.value as TransactionCategory,
                      }))
                    }
                    style={inputStyle}
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Parcelas</label>
                  <input
                    type="number"
                    value={expenseForm.installments}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, installments: e.target.value }))}
                    min="1"
                    max="48"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setShowExpenseForm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExpenseSubmit}
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
                {editingExpenseId ? "Salvar" : "Lançar Despesa"}
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

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#94a3b8",
  marginBottom: "6px",
  display: "block",
};
