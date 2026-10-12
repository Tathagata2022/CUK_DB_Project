import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [departments, templates, users, activeYear, submissions, recentLogs] = await Promise.all([
    prisma.department.findMany({
      include: {
        submissions: {
          include: { template: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.template.findMany({
      include: { fields: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany(),
    prisma.academicYear.findFirst({ where: { isActive: true } }),
    prisma.submission.findMany({
      include: {
        department: true,
        template: true,
        academicYear: true,
      },
    }),
    prisma.auditLog.findMany({
      include: {
        user: { include: { department: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const totalPossible = departments.length * templates.length;
  const completedCount = submissions.filter((s) => s.status === "COMPLETED" || s.status === "VERIFIED").length;
  const submittedCount = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW").length;
  const draftCount = submissions.filter((s) => s.status === "DRAFT").length;
  const returnedCount = submissions.filter((s) => s.status === "RETURNED").length;
  const complianceRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      {/* Top Banner */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Admin Intelligence Dashboard</h1>
            <span className="badge badge-verified" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
              Active Cycle: {activeYear?.year || "None"}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            Centralised Data System &mdash; University-wide operational monitoring, consolidation & master data control
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/admin/reports" className="btn btn-primary">
            Open Report Generator &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Departments & Sections</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#818CF8", marginTop: "8px" }}>
            {departments.length}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {departments.filter((d) => d.type === "DEPARTMENT").length} Depts &bull; {departments.filter((d) => d.type === "SECTION").length} Sections
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Data Templates</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#34D399", marginTop: "8px" }}>
            {templates.length}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {templates.reduce((acc, t) => acc + t.fields.length, 0)} Configured Fields
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Compliance Rate</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#F59E0B", marginTop: "8px" }}>
            {complianceRate}%
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {completedCount} Verified of {totalPossible} Expected
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Active Users</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#38BDF8", marginTop: "8px" }}>
            {users.length}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Across 4 Operational Roles
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Management Modules</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "35px",
        }}
      >
        <Link
          href="/admin/templates"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📋</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>Data Templates</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Configure custom forms & fields</div>
        </Link>

        <Link
          href="/admin/departments"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🏛️</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>Departments & Sections</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Manage university units & schools</div>
        </Link>

        <Link
          href="/admin/users"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>👥</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>User Directory</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Manage roles & credentials</div>
        </Link>

        <Link
          href="/admin/years"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📅</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>Academic Cycles</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Reporting periods & active year</div>
        </Link>

        <Link
          href="/admin/reports"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📊</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>Reports & BI</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Consolidate, Excel & PDF export</div>
        </Link>

        <Link
          href="/admin/audit"
          className="glass-panel"
          style={{ padding: "18px", display: "block", textDecoration: "none" }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🔒</div>
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>Audit Trail</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Complete activity log</div>
        </Link>
      </div>

      {/* Grid: Compliance Tracker & Recent Audit Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Compliance Table */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Department Submission Compliance</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cycle: {activeYear?.year || "Current"}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <th style={{ padding: "10px 12px", color: "var(--text-muted)" }}>Unit / Department</th>
                  <th style={{ padding: "10px 12px", color: "var(--text-muted)" }}>School</th>
                  <th style={{ padding: "10px 12px", color: "var(--text-muted)" }}>Submissions Status</th>
                  <th style={{ padding: "10px 12px", color: "var(--text-muted)", textAlign: "right" }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const deptSubs = dept.submissions.filter((s) => s.academicYearId === activeYear?.id);
                  const completed = deptSubs.filter((s) => s.status === "COMPLETED" || s.status === "VERIFIED").length;
                  const inProgress = deptSubs.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW").length;
                  const returned = deptSubs.filter((s) => s.status === "RETURNED").length;
                  const totalExpected = templates.length;
                  const pct = totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0;

                  return (
                    <tr key={dept.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>
                        {dept.name} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>[{dept.code}]</span>
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-muted)" }}>{dept.school || "General"}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {completed > 0 && <span className="badge badge-verified">{completed} Verified</span>}
                          {inProgress > 0 && <span className="badge badge-submitted">{inProgress} In Review</span>}
                          {returned > 0 && <span className="badge badge-review">{returned} Returned</span>}
                          {deptSubs.length === 0 && <span className="badge badge-draft">Not Started</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "700" }}>
                        <span style={{ color: pct === 100 ? "var(--secondary)" : pct > 0 ? "var(--warning)" : "var(--danger)" }}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Activity */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "18px" }}>Recent Audit Trail</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {recentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "12px",
                  background: "rgba(15, 23, 42, 0.4)",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{log.user.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{log.action}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {log.record}: {log.newValue || "Action logged"}
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No audit events logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
