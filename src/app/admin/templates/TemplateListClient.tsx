"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/Toast";

export default function TemplateListClient({ initialTemplates }: { initialTemplates: any[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;

    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
        showToast(`Template "${name}" deleted.`, "success");
      } else {
        const err = await res.json();
        showToast(`Cannot delete: ${err.error}`, "error");
      }
    } catch {
      showToast("Network error deleting template", "error");
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>&larr; Admin Dashboard</Link>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "4px" }}>Data-Entry Table Templates</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Configurable data collection forms assigned dynamically to departments without code modification.
          </p>
        </div>
        <Link href="/admin/templates/new" className="btn btn-primary">
          + Create New Template
        </Link>
      </div>

      <div className="glass-panel">
        {templates.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No templates found. Click above to create one.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  padding: "20px",
                  background: "rgba(15, 23, 42, 0.4)",
                  borderRadius: "12px",
                  border: "1px solid var(--card-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>{tpl.name}</h3>
                      {tpl.category && <span className="badge badge-submitted">{tpl.category}</span>}
                    </div>
                    <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                      {tpl.description || "No description provided."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className="badge badge-verified">{tpl._count?.submissions ?? 0} Submissions</span>
                    {tpl._count?.submissions === 0 && (
                      <button
                        className="btn"
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "var(--danger)",
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Field Tags */}
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                    Configured Data Fields ({tpl.fields.length}):
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {tpl.fields.map((f: any) => (
                      <span
                        key={f.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontWeight: "600" }}>{f.name}</span>
                        <span style={{ color: "var(--secondary)", fontSize: "0.75rem" }}>({f.type})</span>
                        {f.required && <span style={{ color: "var(--danger)", fontSize: "0.75rem" }}>*</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
