"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthorityClient({ submissions: initialSubmissions }: { submissions: any[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [inspectSub, setInspectSub] = useState<any | null>(null);
  const [returnModalSub, setReturnModalSub] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const router = useRouter();

  const handleAction = async (id: string, action: "VERIFIED" | "RETURNED", actionRemarks?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, remarks: actionRemarks || null }),
      });

      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: action, remarks: actionRemarks || s.remarks } : s))
        );
        setReturnModalSub(null);
        setRemarks("");
        setInspectSub(null);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Failed to update status: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating status");
    } finally {
      setLoading(false);
    }
  };

  const parseData = (dataStr: string) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return {};
    }
  };

  const departments = Array.from(new Set(submissions.map((s) => s.department?.name).filter(Boolean)));
  const filtered = filterDept === "ALL" ? submissions : submissions.filter((s) => s.department?.name === filterDept);

  return (
    <div>
      {/* Department Filter */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <select
          className="input-field"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          style={{ maxWidth: "300px" }}
        >
          <option value="ALL">All Departments &amp; Units</option>
          {departments.map((d: any) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Department</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Template / Module</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Academic Year</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Workflow Status</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub: any) => (
              <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>{sub.department?.name}</td>
                <td style={{ padding: "12px 16px" }}>{sub.template?.name}</td>
                <td style={{ padding: "12px 16px" }}>{sub.academicYear?.year}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    className={`badge ${
                      sub.status === "VERIFIED" || sub.status === "COMPLETED"
                        ? "badge-verified"
                        : sub.status === "UNDER_REVIEW" || sub.status === "SUBMITTED"
                        ? "badge-submitted"
                        : "badge-review"
                    }`}
                  >
                    {sub.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      className="btn"
                      onClick={() => setInspectSub(sub)}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                      }}
                    >
                      Inspect Data
                    </button>

                    {sub.status === "UNDER_REVIEW" && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAction(sub.id, "VERIFIED", "Endorsed by Competent Authority")}
                          disabled={loading}
                          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        >
                          Verify &amp; Endorse
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            setReturnModalSub(sub);
                            setRemarks("");
                          }}
                          disabled={loading}
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "var(--danger)",
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                          }}
                        >
                          Return
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                  No submissions available for review in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Data Modal */}
      {inspectSub && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="glass-panel" style={{ width: "560px", maxHeight: "85vh", overflowY: "auto", padding: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.3rem" }}>{inspectSub.template?.name}</h2>
              <span className="badge badge-verified">{inspectSub.status}</span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
              Department: <strong>{inspectSub.department?.name}</strong> &bull; Cycle: {inspectSub.academicYear?.year}
            </p>

            {inspectSub.remarks && (
              <div style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "18px",
                fontSize: "0.85rem",
                color: "#FBBF24"
              }}>
                <strong>Previous Note:</strong> {inspectSub.remarks}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
              {inspectSub.template?.fields?.map((f: any) => {
                const dataObj = parseData(inspectSub.data);
                const val = dataObj[f.id];

                return (
                  <div
                    key={f.id}
                    style={{
                      padding: "12px",
                      background: "rgba(15, 23, 42, 0.5)",
                      borderRadius: "8px",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>{f.name}</div>
                    {f.type === "file" ? (
                      val && typeof val === "object" && val.name ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>📎 {val.name}</span>
                          {val.base64 && (
                            <a
                              href={val.base64}
                              download={val.name}
                              className="btn btn-primary"
                              style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                            >
                              Download Evidence
                            </a>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>None attached</span>
                      )
                    ) : (
                      <div style={{ fontSize: "1rem", fontWeight: "600" }}>{val !== undefined ? String(val) : "N/A"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn" onClick={() => setInspectSub(null)} style={{ background: "rgba(255,255,255,0.1)" }}>
                Close
              </button>
              {inspectSub.status === "UNDER_REVIEW" && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleAction(inspectSub.id, "VERIFIED", "Endorsed by Competent Authority")}
                  disabled={loading}
                >
                  Verify &amp; Endorse
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalSub && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="glass-panel" style={{ width: "450px", padding: "28px" }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--warning)", marginBottom: "10px" }}>
              Return to Department
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
              Explain the required revisions or document verifications:
            </p>
            <textarea
              className="input-field"
              placeholder="Provide comments for the department..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ minHeight: "100px", marginBottom: "20px" }}
              required
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                className="btn"
                onClick={() => setReturnModalSub(null)}
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => handleAction(returnModalSub.id, "RETURNED", remarks)}
                disabled={loading || !remarks.trim()}
                style={{ background: "var(--danger)", color: "white" }}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
