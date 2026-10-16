"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "@/components/Toast";

export default function YearClient({ initialYears }: { initialYears: any[] }) {
  const [years, setYears] = useState(initialYears);
  const [newYear, setNewYear] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear) return;
    setLoading(true);

    const res = await fetch("/api/years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: newYear })
    });

    if (res.ok) {
      const added = await res.json();
      setYears([added, ...years]);
      setNewYear("");
      router.refresh();
      showToast(`Academic Year "${added.year}" created!`, "success");
    } else {
      showToast("Failed to create Academic Year", "error");
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setLoading(true);
    const res = await fetch("/api/years", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentActive })
    });

    if (res.ok) {
      router.refresh();
      setYears(years.map(y => {
        if (y.id === id) return { ...y, isActive: !currentActive };
        if (!currentActive) return { ...y, isActive: false };
        return y;
      }));
      showToast("Active year updated!", "success");
    } else {
      showToast("Failed to update active status", "error");
    }
    setLoading(false);
  };

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          value={newYear} 
          onChange={(e) => setNewYear(e.target.value)} 
          placeholder="e.g., 2027-28" 
          className="input-field" 
          style={{ maxWidth: '300px' }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">Add Year</button>
      </form>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Academic Year</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.map(y => (
              <tr key={y.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{y.year}</td>
                <td style={{ padding: '12px 16px' }}>
                  {y.isActive ? <span className="badge badge-verified">Active</span> : <span className="badge badge-draft">Inactive</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button 
                    className="btn" 
                    onClick={() => handleToggle(y.id, y.isActive)}
                    disabled={loading || y.isActive}
                    style={{ 
                      background: y.isActive ? 'rgba(255,255,255,0.1)' : 'var(--primary)', 
                      color: 'white', 
                      padding: '6px 12px', 
                      fontSize: '0.85rem' 
                    }}
                  >
                    {y.isActive ? 'Current' : 'Set Active'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
