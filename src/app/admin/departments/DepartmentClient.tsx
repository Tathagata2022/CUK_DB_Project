"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DepartmentClient({ initialDepartments }: { initialDepartments: any[] }) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    school: "School of Physical Sciences",
    type: "DEPARTMENT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const created = await res.json();
        setDepartments((prev) => [...prev, { ...created, _count: { users: 0, submissions: 0 } }]);
        setShowModal(false);
        setFormData({
          name: "",
          code: "",
          school: "School of Physical Sciences",
          type: "DEPARTMENT",
        });
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "Failed to create department"}`);
      }
    } catch (err) {
      alert("Network error creating department");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Cannot delete: ${err.error}`);
      }
    } catch {
      alert("Failed to delete department");
    }
  };

  const filtered = departments.filter((d) => {
    if (filterType !== "ALL" && d.type !== filterType) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>&larr; Admin Dashboard</Link>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "4px" }}>Departments &amp; Sections</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Configure university academic departments and administrative sections for data reporting.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Department / Section
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "320px" }}
        />
        <select
          className="input-field"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="ALL">All Units</option>
          <option value="DEPARTMENT">Academic Departments</option>
          <option value="SECTION">Administrative Sections</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Code</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Unit Name</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Type</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>School / Division</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Users</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Submissions</th>
              <th style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept) => (
              <tr key={dept.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "12px 16px", fontWeight: "700", color: "var(--primary)" }}>{dept.code}</td>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>{dept.name}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={`badge ${dept.type === "DEPARTMENT" ? "badge-verified" : "badge-submitted"}`}>
                    {dept.type}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{dept.school || "N/A"}</td>
                <td style={{ padding: "12px 16px" }}>{dept._count?.users ?? 0}</td>
                <td style={{ padding: "12px 16px" }}>{dept._count?.submissions ?? 0}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button
                    className="btn"
                    onClick={() => handleDelete(dept.id, dept.name)}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "var(--danger)",
                      padding: "4px 10px",
                      fontSize: "0.8rem",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                  No departments or sections match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="glass-panel" style={{ width: "450px", padding: "30px" }}>
            <h2 style={{ marginBottom: "20px" }}>Add Department or Section</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label className="input-label">Unit Type</label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="DEPARTMENT">Academic Department</option>
                  <option value="SECTION">Administrative Section</option>
                </select>
              </div>

              <div>
                <label className="input-label">Name</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mathematics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Code</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  placeholder="e.g. MATH"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="input-label">School / Faculty / Division</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. School of Physical Sciences"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? "Saving..." : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
