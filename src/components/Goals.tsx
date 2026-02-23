"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  X,
  Check,
  TrendingUp,
  Calendar,
  PiggyBank,
} from "lucide-react";
import { AppData, Goal } from "@/lib/types";
import { addGoal, updateGoal, deleteGoal } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import { getGoalInsights } from "@/lib/aiInsights";

interface GoalsProps {
  data: AppData;
  onDataChange: (data: AppData) => void;
  onTabChange?: (tab: string) => void;
}

interface FormState {
  name: string;
  targetAmount: string;
  currentAmount: string;
  monthlyTarget: string;
  deadline: string;
  color: string;
}

const emptyForm: FormState = {
  name: "",
  targetAmount: "",
  currentAmount: "0",
  monthlyTarget: "",
  deadline: "",
  color: "#3b82f6",
};

const colorOptions = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

export default function Goals({ data, onDataChange, onTabChange }: GoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [addingFunds, setAddingFunds] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const aiInsights = useMemo(() => getGoalInsights(data), [data]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(g: Goal) {
    setForm({
      name: g.name,
      targetAmount: String(g.targetAmount),
      currentAmount: String(g.currentAmount),
      monthlyTarget: String(g.monthlyTarget),
      deadline: g.deadline,
      color: g.color,
    });
    setEditingId(g.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.targetAmount || !form.deadline) return;
    const targetAmount = parseFloat(form.targetAmount);
    const currentAmount = parseFloat(form.currentAmount) || 0;
    const monthlyTarget = parseFloat(form.monthlyTarget) || 0;
    if (isNaN(targetAmount) || targetAmount <= 0) return;

    if (editingId) {
      const updated = updateGoal(data, {
        id: editingId,
        name: form.name.trim(),
        targetAmount,
        currentAmount,
        monthlyTarget,
        deadline: form.deadline,
        color: form.color,
        icon: "target",
      });
      onDataChange(updated);
    } else {
      const updated = addGoal(data, {
        name: form.name.trim(),
        targetAmount,
        currentAmount,
        monthlyTarget,
        deadline: form.deadline,
        color: form.color,
        icon: "target",
      });
      onDataChange(updated);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      onDataChange(deleteGoal(data, id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  function handleAddFunds(goalId: string) {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;
    const updated = updateGoal(data, {
      ...goal,
      currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
    });
    onDataChange(updated);
    setAddingFunds(null);
    setFundAmount("");
  }

  function getMonthsRemaining(deadline: string): number {
    const now = new Date();
    const end = new Date(deadline);
    const months =
      (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  }

  function getProjectedCompletion(goal: Goal): string {
    if (goal.monthlyTarget <= 0) return "Sem meta mensal";
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return "Meta atingida! 🎉";
    const months = Math.ceil(remaining / goal.monthlyTarget);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return `${date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;
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
            Metas Financeiras
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Defina e acompanhe seus objetivos
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
          Nova Meta
        </button>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel insights={aiInsights} onActionClick={onTabChange} compact />

      {/* Goals grid */}
      {data.goals.length === 0 ? (
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <Target size={48} color="#334155" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#475569", fontSize: "16px" }}>
            Nenhuma meta cadastrada ainda
          </p>
          <p style={{ color: "#334155", fontSize: "14px", marginTop: "8px" }}>
            Crie sua primeira meta financeira!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {data.goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const monthsLeft = getMonthsRemaining(goal.deadline);
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Color accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: goal.color,
                  }}
                />

                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: `${goal.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PiggyBank size={22} color={goal.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#f1f5f9" }}>
                        {goal.name}
                      </div>
                      {isComplete && (
                        <span
                          style={{
                            fontSize: "11px",
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            padding: "2px 8px",
                            borderRadius: "20px",
                          }}
                        >
                          ✓ Concluída
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => openEdit(goal)}
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
                      onClick={() => handleDelete(goal.id)}
                      style={{
                        padding: "6px",
                        background:
                          deleteConfirm === goal.id
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(239,68,68,0.1)",
                        border: `1px solid ${deleteConfirm === goal.id ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "#f87171",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {deleteConfirm === goal.id ? <Check size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#94a3b8" }}>Progresso</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: goal.color }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "10px",
                      background: "#0f172a",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(progress, 100)}%`,
                        background: isComplete
                          ? "#10b981"
                          : `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)`,
                        borderRadius: "5px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "#0f172a",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Meta Mensal
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>
                      {formatCurrency(goal.monthlyTarget)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#0f172a",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Prazo
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>
                      {formatDate(goal.deadline)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#0f172a",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Meses Restantes
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: monthsLeft <= 3 ? "#ef4444" : "#f1f5f9",
                      }}
                    >
                      {monthsLeft} meses
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#0f172a",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                      Falta
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#f1f5f9" }}>
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </div>
                  </div>
                </div>

                {/* Projection */}
                <div
                  style={{
                    background: `${goal.color}10`,
                    border: `1px solid ${goal.color}30`,
                    borderRadius: "10px",
                    padding: "10px 12px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <TrendingUp size={14} color={goal.color} />
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Previsão de conclusão:{" "}
                    <strong style={{ color: goal.color }}>
                      {getProjectedCompletion(goal)}
                    </strong>
                  </span>
                </div>

                {/* Add funds */}
                {!isComplete && (
                  <>
                    {addingFunds === goal.id ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="number"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          placeholder="Valor a adicionar"
                          min="0"
                          step="0.01"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                            fontSize: "13px",
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddFunds(goal.id)}
                          style={{
                            padding: "8px 14px",
                            background: goal.color,
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          OK
                        </button>
                        <button
                          onClick={() => {
                            setAddingFunds(null);
                            setFundAmount("");
                          }}
                          style={{
                            padding: "8px",
                            background: "transparent",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#64748b",
                            cursor: "pointer",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingFunds(goal.id)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: `${goal.color}15`,
                          border: `1px solid ${goal.color}40`,
                          borderRadius: "10px",
                          color: goal.color,
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Plus size={14} />
                        Adicionar Valor
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

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
              maxHeight: "90vh",
              overflowY: "auto",
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
                {editingId ? "Editar Meta" : "Nova Meta"}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nome da Meta</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Reserva de Emergência, Viagem..."
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Valor Total (R$)</label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Já Guardado (R$)</label>
                  <input
                    type="number"
                    value={form.currentAmount}
                    onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Meta Mensal (R$)</label>
                  <input
                    type="number"
                    value={form.monthlyTarget}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyTarget: e.target.value }))}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Prazo</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Cor</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: color,
                        border: form.color === color ? "3px solid white" : "3px solid transparent",
                        cursor: "pointer",
                        outline: form.color === color ? `2px solid ${color}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
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
                {editingId ? "Salvar Alterações" : "Criar Meta"}
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
