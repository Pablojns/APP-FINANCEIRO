"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Transactions from "@/components/Transactions";
import Goals from "@/components/Goals";
import Cards from "@/components/Cards";
import Reports from "@/components/Reports";
import { AppData } from "@/lib/types";
import { loadData } from "@/lib/store";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Lazy initialization - runs only once on mount, avoids useEffect setState
  const [data, setData] = useState<AppData>(() => loadData());

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
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
