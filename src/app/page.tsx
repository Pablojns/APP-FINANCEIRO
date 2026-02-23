"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Transactions from "@/components/Transactions";
import Goals from "@/components/Goals";
import Cards from "@/components/Cards";
import Reports from "@/components/Reports";
import { AppData } from "@/lib/types";
import { loadData } from "@/lib/store";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Lazy initialization - runs only once on mount, avoids useEffect setState
  const [data, setData] = useState<AppData>(() => loadData());

  // Show auth landing if not logged in
  if (!isLoggedIn) {
    return (
      <div style={landingStyles.container}>
        <div style={landingStyles.blob1} />
        <div style={landingStyles.blob2} />

        <div style={landingStyles.content}>
          {/* Logo */}
          <div style={landingStyles.logoWrap}>
            <span style={landingStyles.logoIcon}>💰</span>
            <span style={landingStyles.logoText}>FinanceApp</span>
          </div>

          <h1 style={landingStyles.headline}>
            Controle suas finanças<br />
            <span style={landingStyles.highlight}>com inteligência</span>
          </h1>
          <p style={landingStyles.desc}>
            Dashboard completo, metas, cartões e relatórios — tudo em um só lugar.
          </p>

          <div style={landingStyles.btnGroup}>
            <Link href="/register" style={landingStyles.btnPrimary}>
              Criar conta grátis
            </Link>
            <Link href="/login" style={landingStyles.btnSecondary}>
              Já tenho conta
            </Link>
          </div>

          {/* Quick demo access */}
          <button
            onClick={() => setIsLoggedIn(true)}
            style={landingStyles.demoBtn}
          >
            👀 Ver demo sem cadastro
          </button>

          {/* Features */}
          <div style={landingStyles.features}>
            {[
              { icon: "📊", label: "Dashboard" },
              { icon: "💳", label: "Cartões" },
              { icon: "🎯", label: "Metas" },
              { icon: "📈", label: "Relatórios" },
            ].map((f) => (
              <div key={f.label} style={landingStyles.featureItem}>
                <span style={landingStyles.featureIcon}>{f.icon}</span>
                <span style={landingStyles.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarOpen ? "240px" : "0px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          paddingTop: "60px",
        }}
      >
        {activeTab === "dashboard" && <Dashboard data={data} />}
        {activeTab === "transactions" && (
          <Transactions data={data} onDataChange={setData} />
        )}
        {activeTab === "goals" && <Goals data={data} onDataChange={setData} />}
        {activeTab === "cards" && <Cards data={data} onDataChange={setData} />}
        {activeTab === "reports" && <Reports data={data} />}
      </main>
    </div>
  );
}

const landingStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: "520px",
    width: "100%",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "40px",
  },
  logoIcon: { fontSize: "36px" },
  logoText: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  headline: {
    fontSize: "42px",
    fontWeight: 800,
    color: "#f1f5f9",
    lineHeight: 1.2,
    marginBottom: "16px",
    letterSpacing: "-1px",
  },
  highlight: {
    background: "linear-gradient(135deg, #3b82f6, #10b981)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  desc: {
    fontSize: "16px",
    color: "#94a3b8",
    lineHeight: 1.7,
    marginBottom: "36px",
  },
  btnGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    textDecoration: "none",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
  },
  btnSecondary: {
    padding: "14px 32px",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
  },
  demoBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: "48px",
    padding: "4px 8px",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  featureItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "16px 20px",
    minWidth: "90px",
  },
  featureIcon: { fontSize: "24px" },
  featureLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: 500 },
};
