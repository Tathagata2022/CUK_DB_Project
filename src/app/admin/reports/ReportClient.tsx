"use client";

import { useState } from "react";
import { useToast, ToastContainer } from "@/components/Toast";

export default function ReportClient({
  initialSubmissions,
  templates,
  departments,
  academicYears,
}: {
  initialSubmissions: any[];
  templates: any[];
  departments: any[];
  academicYears: any[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const { toasts, showToast, dismissToast } = useToast();

  const [filterYear, setFilterYear] = useState(academicYears.find((y) => y.isActive)?.year || "");
  const [filterSchool, setFilterSchool] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterTemplateId, setFilterTemplateId] = useState(templates[0]?.id || "");
  const [filterStatus, setFilterStatus] = useState("");

  const schools = Array.from(new Set(departments.map((d) => d.school).filter(Boolean)));

  const selectedTemplate = templates.find((t) => t.id === filterTemplateId);

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterYear && sub.academicYear?.year !== filterYear) return false;
    if (filterSchool && sub.department?.school !== filterSchool) return false;
    if (filterDept && sub.department?.id !== filterDept) return false;
    if (filterTemplateId && sub.templateId !== filterTemplateId) return false;
    if (filterStatus && sub.status !== filterStatus) return false;
    return true;
  });

  const parseData = (dataStr: string) => {
    try {
      return JSON.parse(dataStr);
    } catch {
      return {};
    }
  };

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", remarks: "Finalized by Administrator" }),
    });

    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "COMPLETED" } : s))
      );
    } else {
      showToast("Failed to mark completed", "error");
    }
  };

  // CSV Export with actual parsed field headers
  const downloadCSV = () => {
    if (filteredSubmissions.length === 0) {
      showToast("No data available to export", "warning");
      return;
    }

    let headers: string[] = ["Department", "Code", "School", "Academic Year", "Status"];
    const fieldCols = selectedTemplate ? selectedTemplate.fields : [];

    fieldCols.forEach((f: any) => {
      headers.push(f.name);
    });

    const rows = filteredSubmissions.map((sub) => {
      const dataObj = parseData(sub.data);
      const row = [
        `"${sub.department?.name || ""}"`,
        `"${sub.department?.code || ""}"`,
        `"${sub.department?.school || ""}"`,
        `"${sub.academicYear?.year || ""}"`,
        `"${sub.status}"`,
      ];

      fieldCols.forEach((f: any) => {
        const val = dataObj[f.id];
        if (val && typeof val === "object" && val.name) {
          row.push(`"${val.name}"`);
        } else if (val !== undefined) {
          row.push(`"${String(val).replace(/"/g, '""')}"`);
        } else {
          row.push('""');
        }
      });

      return row.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `CUK_${(selectedTemplate?.name || "Report").replace(/\s+/g, "_")}_${filterYear || "All"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel (.xls) Native Spreadsheet Export
  const downloadExcel = () => {
    if (filteredSubmissions.length === 0) {
      showToast("No data available to export", "warning");
      return;
    }

    const fieldCols = selectedTemplate ? selectedTemplate.fields : [];
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/><title>CUK Consolidated Report</title></head>
      <body>
        <h2>Central University of Kerala — Consolidated Institutional Report</h2>
        <p><strong>Module:</strong> ${selectedTemplate?.name || "Consolidated Data"} | <strong>Academic Cycle:</strong> ${filterYear || "All"} | <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <table border="1" style="border-collapse:collapse;">
          <thead>
            <tr style="background-color:#1E3A8A; color:#FFFFFF;">
              <th>Department</th>
              <th>Code</th>
              <th>School</th>
              <th>Academic Year</th>
              ${fieldCols.map((f: any) => `<th>${f.name}</th>`).join("")}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSubmissions.map((sub) => {
              const dataObj = parseData(sub.data);
              return `<tr>
                <td>${sub.department?.name || ""}</td>
                <td>${sub.department?.code || ""}</td>
                <td>${sub.department?.school || ""}</td>
                <td>${sub.academicYear?.year || ""}</td>
                ${fieldCols.map((f: any) => {
                  const val = dataObj[f.id];
                  return `<td>${val !== undefined && val !== "" ? (typeof val === "object" ? val.name || "" : val) : ""}</td>`;
                }).join("")}
                <td>${sub.status}</td>
              </tr>`;
            }).join("")}
          </tbody>
          <tfoot>
            <tr style="background-color:#F1F5F9; font-weight:bold;">
              <td colspan="4">TOTAL (Consolidated)</td>
              ${fieldCols.map((f: any) => {
                if (f.type === "number") {
                  const total = filteredSubmissions.reduce((acc, sub) => {
                    const dataObj = parseData(sub.data);
                    const n = parseFloat(dataObj[f.id]);
                    return acc + (isNaN(n) ? 0 : n);
                  }, 0);
                  return `<td>${total}</td>`;
                }
                return `<td>-</td>`;
              }).join("")}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `CUK_${(selectedTemplate?.name || "Report").replace(/\s+/g, "_")}_${filterYear || "All"}.xls`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Column Totals for numeric fields
  const columnTotals: Record<string, number> = {};
  if (selectedTemplate) {
    selectedTemplate.fields.forEach((f: any) => {
      if (f.type === "number") {
        columnTotals[f.id] = filteredSubmissions.reduce((acc, sub) => {
          const dataObj = parseData(sub.data);
          const n = parseFloat(dataObj[f.id]);
          return acc + (isNaN(n) ? 0 : n);
        }, 0);
      }
    });
  }

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      {/* Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
          padding: "20px",
        }}
      >
        <div>
          <label className="input-label">Academic Year</label>
          <select
            className="input-field"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.year}>
                {y.year} {y.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">School / Division</label>
          <select
            className="input-field"
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
          >
            <option value="">All Schools</option>
            {schools.map((s: any) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Department</label>
          <select
            className="input-field"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Data Module / Template</label>
          <select
            className="input-field"
            value={filterTemplateId}
            onChange={(e) => setFilterTemplateId(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Status</label>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="RETURNED">Returned</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Report Header & Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>
            {selectedTemplate ? selectedTemplate.name : "Consolidated Submissions"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Showing {filteredSubmissions.length} records matching current criteria
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => window.print()} className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>
            🖨️ Print / PDF Report
          </button>
          <button onClick={downloadCSV} className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>
            📄 Download CSV
          </button>
          <button onClick={downloadExcel} className="btn btn-primary">
            📥 Download Excel
          </button>
        </div>
      </div>

      {/* Consolidated Data Table */}
      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th style={{ padding: "12px 14px", color: "var(--text-muted)" }}>Department</th>
              <th style={{ padding: "12px 14px", color: "var(--text-muted)" }}>School</th>
              <th style={{ padding: "12px 14px", color: "var(--text-muted)" }}>Year</th>

              {/* Dynamic Column Headers from the Selected Template */}
              {selectedTemplate?.fields.map((f: any) => (
                <th key={f.id} style={{ padding: "12px 14px", color: "var(--primary)" }}>
                  {f.name}
                </th>
              ))}

              <th style={{ padding: "12px 14px", color: "var(--text-muted)" }}>Status</th>
              <th style={{ padding: "12px 14px", color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => {
              const dataObj = parseData(sub.data);

              return (
                <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: "600" }}>
                    {sub.department?.name} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>[{sub.department?.code}]</span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                    {sub.department?.school || "General"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>{sub.academicYear?.year}</td>

                  {/* Dynamic Cell Values */}
                  {selectedTemplate?.fields.map((f: any) => {
                    const val = dataObj[f.id];
                    return (
                      <td key={f.id} style={{ padding: "12px 14px" }}>
                        {f.type === "file" ? (
                          val && typeof val === "object" && val.name ? (
                            <span style={{ color: "var(--secondary)", fontSize: "0.8rem" }}>
                              📎 {val.name}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>&mdash;</span>
                          )
                        ) : val !== undefined && val !== "" ? (
                          String(val)
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>&mdash;</span>
                        )}
                      </td>
                    );
                  })}

                  <td style={{ padding: "12px 14px" }}>
                    <span
                      className={`badge ${
                        sub.status === "COMPLETED" || sub.status === "VERIFIED"
                          ? "badge-verified"
                          : sub.status === "RETURNED"
                          ? "badge-review"
                          : "badge-submitted"
                      }`}
                    >
                      {sub.status.replace("_", " ")}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    {sub.status === "VERIFIED" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleComplete(sub.id)}
                        style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                      >
                        Finalize &amp; Complete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <tr>
                <td
                  colSpan={6 + (selectedTemplate?.fields.length || 0)}
                  style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)" }}
                >
                  No submission records found matching the chosen filters.
                </td>
              </tr>
            )}
          </tbody>
          {filteredSubmissions.length > 0 && selectedTemplate && (
            <tfoot style={{ borderTop: "2px solid var(--primary)", fontWeight: "700" }}>
              <tr style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                <td colSpan={3} style={{ padding: "14px", color: "var(--primary)", fontSize: "0.95rem" }}>
                  TOTAL (Consolidated Sum)
                </td>
                {selectedTemplate.fields.map((f: any) => (
                  <td
                    key={f.id}
                    style={{
                      padding: "14px",
                      color: f.type === "number" ? "#34D399" : "var(--text-muted)",
                      fontWeight: "800",
                    }}
                  >
                    {f.type === "number" ? columnTotals[f.id] ?? 0 : "—"}
                  </td>
                ))}
                <td colSpan={2} style={{ padding: "14px" }}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
