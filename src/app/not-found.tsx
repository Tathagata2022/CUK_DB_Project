import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "75vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{ maxWidth: "480px", width: "100%", padding: "48px 40px" }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🏛️</div>
        <div
          style={{
            fontSize: "5rem",
            fontWeight: "900",
            background: "linear-gradient(135deg, #4F46E5, #10B981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "10px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "32px", lineHeight: 1.6 }}>
          The page you are looking for does not exist or you do not have permission to access it.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            ← Go to Login
          </Link>
          <Link href="/dashboard" className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>
            My Dashboard
          </Link>
        </div>
        <div
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid var(--card-border)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          Central University of Kerala — Centralised Data System
        </div>
      </div>
    </main>
  );
}
