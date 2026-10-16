"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/Toast";

export default function UserClient({ initialUsers, departments }: { initialUsers: any[], departments: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const router = useRouter();
  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "DEPARTMENT_USER",
    departmentId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          departmentId: (formData.role === 'HOD' || formData.role === 'DEPARTMENT_USER') ? formData.departmentId : null
        })
      });

      if (res.ok) {
        const createdUser = await res.json();
        // Immediately update state
        setUsers(prev => [createdUser, ...prev]);
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "DEPARTMENT_USER", departmentId: "" });
        router.refresh();
        showToast("User added successfully!", "success");
      } else {
        const error = await res.json();
        showToast(`Failed to add user: ${error.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      showToast("Error connecting to server to add user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        router.refresh();
        showToast(`User "${name}" removed.`, "success");
      } else {
        const err = await res.json();
        showToast(`Delete failed: ${err.error}`, "error");
      }
    } catch {
      showToast("Error deleting user", "error");
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>&larr; Admin Dashboard</Link>
          <h1 style={{ fontSize: '2rem', fontWeight: "800", marginTop: "4px" }}>Manage Users &amp; Roles</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Provision and control access for Department Users, HoDs, Competent Authority and Administrators.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search by name or university email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: "340px" }}
        />
        <select
          className="input-field"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ maxWidth: "220px" }}
        >
          <option value="ALL">All Roles</option>
          <option value="DEPARTMENT_USER">Department Users</option>
          <option value="HOD">Heads of Department</option>
          <option value="COMPETENT_AUTHORITY">Competent Authority</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>
      
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Department / Unit</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: "600" }}>{user.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-verified' : 
                    user.role === 'COMPETENT_AUTHORITY' ? 'badge-review' :
                    user.role === 'HOD' ? 'badge-submitted' : 'badge-draft'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{user.department?.name || 'Central University'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    className="btn"
                    onClick={() => handleDelete(user.id, user.name)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--danger)',
                      padding: '4px 10px',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '420px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New User</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="input-label">Full Name</label>
                <input required type="text" className="input-field" placeholder="e.g. Dr. A. Sharma" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="input-label">University Email</label>
                <input required type="email" className="input-field" placeholder="e.g. asharma@cukerala.ac.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Temporary Password</label>
                <input required type="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Access Role</label>
                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="DEPARTMENT_USER">Department / Section User</option>
                  <option value="HOD">Head of Department (HoD)</option>
                  <option value="COMPETENT_AUTHORITY">Competent Authority (IQAC / VC)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
              
              {(formData.role === 'DEPARTMENT_USER' || formData.role === 'HOD') && (
                <div>
                  <label className="input-label">Assigned Department</label>
                  <select required className="input-field" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}>
                    <option value="">Select Department / Section...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>{loading ? "Saving..." : "Add User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
