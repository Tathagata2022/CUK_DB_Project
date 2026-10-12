import { prisma } from "@/lib/prisma";

export default async function AuditTrail() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        include: { department: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit to recent 100 for prototype
  });

  return (
    <main className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Audit Trail</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Track all actions and modifications across the system for complete accountability.
      </p>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Date & Time</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>User</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Role/Dept</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Action</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Record</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{log.user.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {log.user.role} {log.user.department ? `(${log.user.department.code})` : ''}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${log.action.includes('SUBMITTED') || log.action.includes('MARKED') ? 'badge-verified' : 'badge-draft'}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>{log.record}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.newValue ? log.newValue : 'N/A'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
