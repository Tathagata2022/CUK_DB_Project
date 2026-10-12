"use client";

import { signOut, useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderAuth() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleQuickSwitch = async (email: string) => {
    const res = await signIn("credentials", {
      email,
      password: "password123",
      redirect: false,
    });
    if (res?.ok) {
      if (email.includes("admin")) window.location.href = "/admin";
      else if (email.includes("hod")) window.location.href = "/hod";
      else if (email.includes("authority")) window.location.href = "/authority";
      else window.location.href = "/dashboard";
    }
  };

  if (status === "loading") {
    return <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Authenticating...</div>;
  }

  if (session && session.user) {
    const role = (session.user as any).role;
    const name = session.user.name || "User";
    const dept = (session.user as any).departmentName;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Role Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", fontSize: "0.9rem" }}>
          {role === "ADMIN" && (
            <>
              <Link
                href="/admin"
                style={{
                  color: pathname === "/admin" ? "var(--secondary)" : "var(--text-main)",
                  fontWeight: pathname === "/admin" ? "700" : "500",
                }}
              >
                BI Dashboard
              </Link>
              <Link
                href="/admin/templates"
                style={{
                  color: pathname.startsWith("/admin/templates") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Templates
              </Link>
              <Link
                href="/admin/departments"
                style={{
                  color: pathname.startsWith("/admin/departments") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Departments
              </Link>
              <Link
                href="/admin/users"
                style={{
                  color: pathname.startsWith("/admin/users") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Users
              </Link>
              <Link
                href="/admin/years"
                style={{
                  color: pathname.startsWith("/admin/years") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Cycles
              </Link>
              <Link
                href="/admin/reports"
                style={{
                  color: pathname.startsWith("/admin/reports") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Reports
              </Link>
              <Link
                href="/admin/audit"
                style={{
                  color: pathname.startsWith("/admin/audit") ? "var(--secondary)" : "var(--text-muted)",
                }}
              >
                Audit
              </Link>
            </>
          )}

          {role === "HOD" && (
            <Link
              href="/hod"
              style={{
                color: pathname === "/hod" ? "var(--secondary)" : "var(--text-main)",
                fontWeight: "600",
              }}
            >
              HoD Verification Portal
            </Link>
          )}

          {role === "COMPETENT_AUTHORITY" && (
            <Link
              href="/authority"
              style={{
                color: pathname === "/authority" ? "var(--secondary)" : "var(--text-main)",
                fontWeight: "600",
              }}
            >
              Authority Review &amp; Compliance
            </Link>
          )}

          {role === "DEPARTMENT_USER" && (
            <Link
              href="/dashboard"
              style={{
                color: pathname === "/dashboard" ? "var(--secondary)" : "var(--text-main)",
                fontWeight: "600",
              }}
            >
              My Data Modules
            </Link>
          )}
        </div>

        {/* User Identity Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(15, 23, 42, 0.6)",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid var(--card-border)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{name}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{dept || "Central University"}</div>
          </div>
          <span
            className={`badge ${
              role === "ADMIN"
                ? "badge-verified"
                : role === "COMPETENT_AUTHORITY"
                ? "badge-review"
                : role === "HOD"
                ? "badge-submitted"
                : "badge-draft"
            }`}
          >
            {role.replace("_", " ")}
          </span>
        </div>

        {/* Quick Role Switcher for seamless prototype testing */}
        <div style={{ display: "flex", gap: "6px" }}>
          <select
            className="input-field"
            style={{ padding: "4px 8px", fontSize: "0.75rem", width: "auto" }}
            value=""
            onChange={(e) => {
              if (e.target.value) handleQuickSwitch(e.target.value);
            }}
          >
            <option value="">Switch Role...</option>
            <option value="admin@cukerala.ac.in">Admin</option>
            <option value="authority@cukerala.ac.in">Competent Authority</option>
            <option value="hod_cs@cukerala.ac.in">HoD (CS)</option>
            <option value="user_cs@cukerala.ac.in">Dept User (CS)</option>
            <option value="hod_econ@cukerala.ac.in">HoD (Econ)</option>
            <option value="user_econ@cukerala.ac.in">Dept User (Econ)</option>
          </select>
        </div>

        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/";
          }}
          className="btn"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "var(--danger)",
            padding: "6px 14px",
            fontSize: "0.85rem",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <Link href="/" className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.9rem" }}>
        Login Portal
      </Link>
    </div>
  );
}
