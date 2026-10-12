"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DynamicForm({
  templateId,
  fields,
  existingSubmission,
  departmentName,
}: {
  templateId: string;
  fields: any[];
  existingSubmission: any;
  departmentName: string;
}) {
  const router = useRouter();

  let initialData: Record<string, any> = {};
  if (existingSubmission?.data) {
    try {
      initialData = JSON.parse(existingSubmission.data);
    } catch (e) {
      initialData = {};
    }
  }

  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loading, setLoading] = useState(false);
  const status = existingSubmission?.status || "NOT_STARTED";
  const isReadOnly = status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "VERIFIED" || status === "COMPLETED";

  const handleChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleSubmit = async (e: React.FormEvent, targetStatus: string = "SUBMITTED") => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, data: formData, status: targetStatus }),
      });

      if (response.ok) {
        alert(targetStatus === "SUBMITTED" ? "Submitted to HoD for verification!" : "Draft saved successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        const err = await response.json();
        alert(`Failed to save: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETED":
      case "VERIFIED":
        return <span className="badge badge-verified">{status}</span>;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return <span className="badge badge-submitted">{status.replace("_", " ")}</span>;
      case "RETURNED":
        return <span className="badge badge-review">RETURNED FOR REVISION</span>;
      default:
        return <span className="badge badge-draft">DRAFT / NOT SUBMITTED</span>;
    }
  };

  return (
    <div>
      {/* Status & Review Remarks Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--card-border)" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Current Status: </span>
          {getStatusBadge()}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Department: <strong style={{ color: "var(--text-main)" }}>{departmentName}</strong>
        </div>
      </div>

      {status === "RETURNED" && existingSubmission?.remarks && (
        <div style={{
          background: "rgba(245, 158, 11, 0.15)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px"
        }}>
          <div style={{ fontWeight: "700", color: "#FBBF24", marginBottom: "4px" }}>⚠️ Returned by Reviewer</div>
          <div style={{ fontSize: "0.95rem" }}>{existingSubmission.remarks}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
            Please correct the fields below and click &quot;Resubmit to HoD&quot;.
          </div>
        </div>
      )}

      {isReadOnly && (
        <div style={{
          background: "rgba(79, 70, 229, 0.12)",
          border: "1px solid rgba(79, 70, 229, 0.25)",
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "24px",
          fontSize: "0.9rem"
        }}>
          🔒 This module is currently <strong>{status.replace("_", " ")}</strong> and is locked for edits. Review submitted details below.
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={(e) => handleSubmit(e, "SUBMITTED")} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {fields.map((field) => {
          const val = formData[field.id];

          return (
            <div key={field.id}>
              <label className="input-label" style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "8px" }}>
                {field.name} {field.required && !isReadOnly && <span style={{ color: "var(--danger)" }}>*</span>}
              </label>

              {/* Read Only Display */}
              {isReadOnly ? (
                <div style={{
                  padding: "12px 16px",
                  background: "rgba(15, 23, 42, 0.4)",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  fontSize: "1rem"
                }}>
                  {field.type === "file" ? (
                    val && typeof val === "object" && val.name ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span>📎 {val.name}</span>
                        {val.base64 && (
                          <a
                            href={val.base64}
                            download={val.name}
                            className="btn"
                            style={{ background: "var(--primary)", padding: "4px 10px", fontSize: "0.8rem" }}
                          >
                            Download / View File
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>No file uploaded</span>
                    )
                  ) : (
                    <span>{val !== undefined && val !== "" ? String(val) : <em style={{ color: "var(--text-muted)" }}>Empty</em>}</span>
                  )}
                </div>
              ) : (
                /* Editable Form Controls */
                <>
                  {field.type === "text" && (
                    <input
                      type="text"
                      className="input-field"
                      required={field.required}
                      value={val || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      className="input-field"
                      required={field.required}
                      value={val !== undefined ? val : ""}
                      onChange={(e) => handleChange(field.id, e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                    />
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      className="input-field"
                      required={field.required}
                      value={val || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === "file" && (
                    <div>
                      {val && typeof val === "object" && val.name && (
                        <div style={{ marginBottom: "8px", fontSize: "0.85rem", color: "var(--secondary)" }}>
                          Current attachment: 📎 {val.name}
                        </div>
                      )}
                      <input
                        type="file"
                        className="input-field"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleChange(field.id, { name: file.name, base64: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                        Accepts PDF, Excel, Word, or JPG evidence (Max 5MB)
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Action Buttons */}
        {!isReadOnly && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid var(--card-border)" }}>
            <button
              type="button"
              disabled={loading}
              className="btn"
              style={{ background: "rgba(255,255,255,0.1)" }}
              onClick={(e) => handleSubmit(e, "DRAFT")}
            >
              {loading ? "..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Submitting..." : status === "RETURNED" ? "Resubmit to HoD" : "Submit to HoD"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
