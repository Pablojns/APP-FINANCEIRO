"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["", "Fraca", "Razoável", "Boa", "Forte"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][strength];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (strength < 2) {
      setError("Escolha uma senha mais forte.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/";
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

        <h1 style={styles.title}>Criar conta grátis</h1>
        <p style={styles.subtitle}>Comece a controlar suas finanças hoje</p>

        {/* Social Sign Up */}
        <div style={styles.socialGrid}>
          <button style={styles.socialBtn} type="button">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button style={styles.socialBtn} type="button">
            <AppleIcon />
            <span>Apple</span>
          </button>
        </div>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>ou cadastre com email</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={styles.form}>
          {/* Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nome completo</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
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

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div style={styles.strengthWrap}>
                <div style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        ...styles.strengthSegment,
                        background: i <= strength ? strengthColor : "#334155",
                      }}
                    />
                  ))}
                </div>
                <span style={{ ...styles.strengthLabel, color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirmar senha</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  ...styles.input,
                  borderColor:
                    confirmPassword.length > 0
                      ? confirmPassword === password
                        ? "#10b981"
                        : "#ef4444"
                      : "#334155",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={styles.eyeBtn}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p style={styles.errorMsg}>⚠️ {error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p style={styles.terms}>
            Ao criar uma conta, você concorda com os{" "}
            <a href="#" style={styles.termsLink}>Termos de Uso</a> e{" "}
            <a href="#" style={styles.termsLink}>Política de Privacidade</a>.
          </p>
        </form>

        <p style={styles.loginText}>
          Já tem uma conta?{" "}
          <Link href="/login" style={styles.loginLink}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
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
    top: "-100px",
    right: "-100px",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-120px",
    left: "-120px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    justifyContent: "center",
  },
  logoIcon: { fontSize: "28px" },
  logoText: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: "24px",
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },
  socialBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  dividerLine: { flex: 1, height: "1px", background: "#334155" },
  dividerText: { fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
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
    padding: "11px 40px 11px 38px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "14px",
    transition: "border-color 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0",
    lineHeight: 1,
  },
  strengthWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
  },
  strengthBar: {
    display: "flex",
    gap: "4px",
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    transition: "background 0.3s",
  },
  strengthLabel: {
    fontSize: "11px",
    fontWeight: 600,
    minWidth: "50px",
    textAlign: "right",
  },
  errorMsg: {
    fontSize: "13px",
    color: "#ef4444",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  submitBtn: {
    marginTop: "4px",
    padding: "13px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
  },
  terms: {
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 1.6,
  },
  termsLink: { color: "#3b82f6", textDecoration: "none" },
  loginText: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#94a3b8",
  },
  loginLink: { color: "#3b82f6", fontWeight: 600, textDecoration: "none" },
};
