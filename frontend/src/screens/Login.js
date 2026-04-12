import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { theme } from "../styles/theme";

const fieldStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: `1px solid ${theme.colors.border}`,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "none",
  backgroundColor: theme.colors.primary,
  color: "white",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "linear-gradient(160deg, #f7efe5 0%, #f2f2f7 45%, #e5f4ea 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: theme.colors.card,
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 18px 40px rgba(39, 52, 67, 0.12)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "6px 12px",
              borderRadius: 999,
              backgroundColor: "#eef6ff",
              color: theme.colors.primary,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Nutricion & entrenamiento
          </div>
          <h1 style={{ margin: 0, color: theme.colors.text, fontSize: 30 }}>
            {title}
          </h1>
          <p style={{ color: theme.colors.subtext, marginTop: 10, marginBottom: 0 }}>
            {subtitle}
          </p>
        </div>
        {children}
        <div style={{ marginTop: 18, color: theme.colors.subtext, fontSize: 14 }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function Login({ onShowRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Entra a tu plan"
      subtitle="Accede a tu seguimiento diario y deja preparada la conexion con backend."
      footer={
        <>
          No tienes cuenta?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            style={{
              border: "none",
              background: "transparent",
              color: theme.colors.primary,
              padding: 0,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Crear cuenta
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={fieldStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={fieldStyle}
          />
          {error ? (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                backgroundColor: "#fff3f1",
                color: theme.colors.danger,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          ) : null}
          <button type="submit" disabled={isSubmitting} style={buttonStyle}>
            {isSubmitting ? "Entrando..." : "Iniciar sesion"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
