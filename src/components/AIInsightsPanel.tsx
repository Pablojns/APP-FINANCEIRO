"use client";

import { useState } from "react";
import { Bot, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { AIInsight } from "@/lib/aiInsights";

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onActionClick?: (tab: string) => void;
  compact?: boolean;
}

const typeStyles: Record<
  AIInsight["type"],
  { border: string; bg: string; dot: string }
> = {
  warning: {
    border: "rgba(239,68,68,0.4)",
    bg: "rgba(239,68,68,0.08)",
    dot: "#ef4444",
  },
  tip: {
    border: "rgba(245,158,11,0.4)",
    bg: "rgba(245,158,11,0.08)",
    dot: "#f59e0b",
  },
  success: {
    border: "rgba(16,185,129,0.4)",
    bg: "rgba(16,185,129,0.08)",
    dot: "#10b981",
  },
  info: {
    border: "rgba(59,130,246,0.4)",
    bg: "rgba(59,130,246,0.08)",
    dot: "#3b82f6",
  },
};

export default function AIInsightsPanel({
  insights,
  onActionClick,
  compact = false,
}: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(!compact);

  if (insights.length === 0) return null;

  const warningCount = insights.filter((i) => i.type === "warning").length;
  const badgeColor = warningCount > 0 ? "#ef4444" : "#10b981";

  return (
    <div
      style={{
        background: "rgba(139,92,246,0.06)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bot size={16} color="white" />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#c4b5fd" }}
            >
              IA Financeira
            </span>
            <span
              style={{
                background: badgeColor,
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "20px",
                padding: "1px 8px",
              }}
            >
              {insights.length} insight{insights.length > 1 ? "s" : ""}
            </span>
          </div>
          {!expanded && (
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                margin: 0,
                marginTop: "2px",
              }}
            >
              {insights[0].title} — clique para ver todos
            </p>
          )}
        </div>

        <Sparkles size={14} color="#8b5cf6" style={{ flexShrink: 0 }} />
        {expanded ? (
          <ChevronUp size={16} color="#64748b" />
        ) : (
          <ChevronDown size={16} color="#64748b" />
        )}
      </button>

      {/* Insights list */}
      {expanded && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {insights.map((insight) => {
            const s = typeStyles[insight.type];
            return (
              <div
                key={insight.id}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  borderRadius: "12px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: s.dot,
                    flexShrink: 0,
                    marginTop: "5px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#f1f5f9",
                      marginBottom: "3px",
                    }}
                  >
                    {insight.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                    {insight.message}
                  </div>
                  {insight.action && insight.actionTab && onActionClick && (
                    <button
                      onClick={() => onActionClick(insight.actionTab!)}
                      style={{
                        marginTop: "8px",
                        background: "transparent",
                        border: `1px solid ${s.border}`,
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        color: s.dot,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
