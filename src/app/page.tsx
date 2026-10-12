"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const targetEmail = customEmail || email;
    const targetPassword = customEmail ? "password123" : password;

    const result = await signIn("credentials", {
      email: targetEmail,
      password: targetPassword,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        const userRole = sessionData?.user?.role;

        if (userRole === "ADMIN") {
          window.location.href = "/admin";
        } else if (userRole === "HOD") {
          window.location.href = "/hod";
        } else if (userRole === "COMPETENT_AUTHORITY") {
          window.location.href = "/authority";
        } else {
          window.location.href = "/dashboard";
        }
      } catch {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    handleSignIn(undefined as any, userEmail);
  };

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "82vh", padding: "20px" }}>
      <div className="glass-panel animate-fade-in" style={{ width: "100%", maxWidth: "460px", textAlign: "center", padding: "35px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "6px" }}>🏛️</div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: "800", marginBottom: "6px" }}>Central University of Kerala</h1>
          <p style={{ color: "var(--secondary)", fontWeight: "600", fontSize: "0.95rem" }}>Centralised Data System</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
            Predefined tables, hierarchical approvals &amp; consolidation
          </p>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", marginBottom: "15px", padding: "10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div>
            <label className="input-label" htmlFor="email">University Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="name@cukerala.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "6px" }}>
            {loading ? "Authenticating..." : "Sign In to DataHub"}
          </button>
        </form>

        {/* 1-Click Role Login Bar */}
        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid var(--card-border)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            1-Click Prototype Role Login
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@cukerala.ac.in")}
              className="btn"
              style={{ background: "rgba(79, 70, 229, 0.25)", color: "#A5B4FC", fontSize: "0.8rem", padding: "8px" }}
            >
              👑 Admin (System)
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("authority@cukerala.ac.in")}
              className="btn"
              style={{ background: "rgba(245, 158, 11, 0.2)", color: "#FBBF24", fontSize: "0.8rem", padding: "8px" }}
            >
              🔍 Competent Authority
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("hod_cs@cukerala.ac.in")}
              className="btn"
              style={{ background: "rgba(16, 185, 129, 0.2)", color: "#6EE7B7", fontSize: "0.8rem", padding: "8px" }}
            >
              🎓 HoD (Comp Science)
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("user_cs@cukerala.ac.in")}
              className="btn"
              style={{ background: "rgba(148, 163, 184, 0.2)", color: "#E2E8F0", fontSize: "0.8rem", padding: "8px" }}
            >
              ✍️ Dept User (CS)
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "10px" }}>
            All accounts default password: <code style={{ color: "var(--secondary)" }}>password123</code>
          </div>
        </div>
      </div>
    </main>
  );
}
