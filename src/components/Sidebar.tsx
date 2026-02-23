"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  CreditCard,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Lançamentos", icon: ArrowLeftRight },
  { id: "cards", label: "Cartões", icon: CreditCard },
  { id: "goals", label: "Metas", icon: Target },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
];

export default function Sidebar({ activeTab, onTabChange, isOpen, onToggle, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: isOpen ? "240px" : "0px",
          background: "#1e293b",
          borderRight: "1px solid #334155",
          zIndex: 30,
          transition: "width 0.3s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "240px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "#f1f5f9", whiteSpace: "nowrap" }}>
              FinanceApp
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>
              Controle Financeiro
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "16px 12px", flex: 1, minWidth: "240px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "4px",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))"
                    : "transparent",
                  color: isActive ? "#60a5fa" : "#94a3b8",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                  }
                }}
              >
                <Icon size={20} />
                <span style={{ fontWeight: isActive ? 600 : 400, fontSize: "14px" }}>
                  {item.label}
                </span>
                {isActive && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#3b82f6",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "12px 12px 16px",
            borderTop: "1px solid #334155",
            minWidth: "240px",
          }}
        >
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: "#ef4444",
              marginBottom: "10px",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <LogOut size={20} />
            <span style={{ fontWeight: 500, fontSize: "14px" }}>Sair</span>
          </button>
          <div style={{ fontSize: "11px", color: "#475569", textAlign: "center" }}>
            v1.0.0 • FinanceApp
          </div>
        </div>
      </aside>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          position: "fixed",
          top: "16px",
          left: isOpen ? "252px" : "16px",
          zIndex: 40,
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "8px",
          padding: "8px",
          cursor: "pointer",
          color: "#94a3b8",
          transition: "left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
    </>
  );
}
