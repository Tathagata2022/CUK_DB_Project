"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTemplate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Faculty");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([
    { name: "Field 1", type: "number", required: true },
  ]);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setFields([...fields, { name: "", type: "number", required: true }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    (newFields[index] as any)[key] = value;
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, fields }),
      });

      if (response.ok) {
        router.push("/admin/templates");
      } else {
        const err = await response.json();
        alert(`Failed: ${err.error || "Could not save template"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <div style={{ maxWidth: "840px", margin: "0 auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link href="/admin/templates" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            &larr; Back to Templates
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "6px" }}>Create Dynamic Data-Entry Template</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Define custom university data tables with typed fields (numbers, text, dates, or file uploads).
          </p>
        </div>

        <div className="glass-panel">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              <div>
                <label className="input-label">Template Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sponsored Research Projects 2026-27"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Category</label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Faculty">Faculty &amp; Staff</option>
                  <option value="Students">Student Data</option>
                  <option value="Research">Research &amp; Publications</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Finance">Finance &amp; Accounts</option>
                  <option value="Accreditation">NIRF / NAAC / IQAC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="input-label">Description &amp; Guidance Instructions (Optional)</label>
              <textarea
                className="input-field"
                placeholder="Guidelines or instructions for department users filling this form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: "80px", resize: "vertical" }}
              />
            </div>

            <div style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Data Fields / Columns</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Add the individual columns that departments will enter.
                  </p>
                </div>
                <button type="button" className="btn btn-primary" onClick={addField}>
                  + Add Field
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.5fr auto auto",
                      gap: "12px",
                      alignItems: "end",
                      background: "rgba(15, 23, 42, 0.4)",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div>
                      <label className="input-label">Field Name</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Professor, Sanctioned Amount..."
                        value={field.name}
                        onChange={(e) => updateField(idx, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Data Type</label>
                      <select
                        className="input-field"
                        value={field.type}
                        onChange={(e) => updateField(idx, "type", e.target.value)}
                      >
                        <option value="number">Number (Integer / Decimal)</option>
                        <option value="text">Text (Single-line string)</option>
                        <option value="date">Date (Calendar picker)</option>
                        <option value="file">File Upload (PDF, Excel, JPG)</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", height: "44px", gap: "8px" }}>
                      <input
                        type="checkbox"
                        id={`req-${idx}`}
                        checked={field.required}
                        onChange={(e) => updateField(idx, "required", e.target.checked)}
                      />
                      <label htmlFor={`req-${idx}`} style={{ fontSize: "0.9rem" }}>Required</label>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "var(--danger)",
                          height: "44px",
                          padding: "0 12px",
                        }}
                        onClick={() => removeField(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "20px" }}>
              <button
                type="button"
                className="btn"
                onClick={() => router.push("/admin/templates")}
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Saving Template..." : "Save & Publish Template"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
