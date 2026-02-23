"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("sent");
    }, 1200);
  };

  return (
    <div style={styles.container}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>💰</div>
          <span style={styles.logoText}>FinanceApp</span>
        </div>

        {step === "email" ? (
          <>
            {/* Lock icon */}
            <div style={styles.iconCircle}>🔑</div>

            <h1 style={styles.title}>Esqueceu a senha?</h1>
            <p style={styles.subtitle}>
              Sem problemas! Digite seu email e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email cadastrado</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>

            <div style={styles.backWrap}>
              <Link href="/login" style={styles.backLink}>
                ← Voltar para o login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div style={styles.successCircle}>✅</div>

            <h1 style={styles.title}>Email enviado!</h1>
            <p style={styles.subtitle}>
              Enviamos um link de redefinição para{" "}
              <strong style={{ color: "#f1f5f9" }}>{email}</strong>.
              <br />
              Verifique sua caixa de entrada (e o spam, por via das dúvidas).
            </p>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                📬 O link expira em <strong>30 minutos</strong>. Se não receber, aguarde alguns instantes e tente novamente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setStep("email"); setEmail(""); }}
              style={styles.resendBtn}
            >
              Reenviar email
            </button>

            <div style={styles.backWrap}>
              <Link href="/login" style={styles.backLink}>
                ← Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    top: "-80px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "500px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-100px",
    left: "-100px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
    textAlign: "center",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "28px",
    justifyContent: "center",
  },
  logoIcon: { fontSize: "28px" },
  logoText: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  iconCircle: {
    fontSize: "48px",
    marginBottom: "16px",
    display: "block",
  },
  successCircle: {
    fontSize: "56px",
    marginBottom: "16px",
    display: "block",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: 1.7,
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 500, color: "#cbd5e1" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "15px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 16px 11px 38px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "13px",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
  },
  infoBox: {
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "20px",
    textAlign: "left",
  },
  infoText: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  resendBtn: {
    width: "100%",
    padding: "13px",
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: "20px",
  },
  backWrap: {
    marginTop: "24px",
  },
  backLink: {
    fontSize: "13px",
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 500,
  },
};
