import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const role = (session.user as any)?.role;
  const name = session.user?.name || "User";
  const departmentName = (session.user as any)?.departmentName || "Department";
  const departmentId = (session.user as any)?.departmentId;

  if (role === 'ADMIN') redirect("/admin");
  if (role === 'HOD') redirect("/hod");
  if (role === 'COMPETENT_AUTHORITY') redirect("/authority");

  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });

  const templates = await prisma.template.findMany({
    include: {
      submissions: {
        where: {
          departmentId: departmentId || 'none',
          academicYearId: activeYear?.id || 'none'
        }
      },
      fields: true
    },
    orderBy: { createdAt: 'desc' }
  });

  let pending = 0;
  let approved = 0;
  let returned = 0;

  const tasks = templates.map(t => {
    const sub = t.submissions[0];
    const status = sub?.status || 'NOT_STARTED';
    
    if (status === 'NOT_STARTED' || status === 'DRAFT') pending++;
    if (status === 'COMPLETED' || status === 'VERIFIED') approved++;
    if (status === 'RETURNED') returned++;

    let badge = 'badge-draft';
    if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') badge = 'badge-submitted';
    if (status === 'VERIFIED' || status === 'COMPLETED') badge = 'badge-verified';
    if (status === 'RETURNED') badge = 'badge-review';

    return {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      fieldCount: t.fields.length,
      status: status.replace('_', ' '),
      rawStatus: status,
      remarks: sub?.remarks,
      badge
    };
  });

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      {/* Welcome & Dept Banner */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{departmentName}</h1>
            <span className="badge badge-submitted" style={{ padding: '6px 14px' }}>Department Portal</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Logged in as {name} &bull; Central University of Kerala Centralised Data System
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-verified" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Academic Cycle: {activeYear?.year || "2026-27"}
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending / In Draft</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#818CF8', marginTop: '6px' }}>{pending}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Require data entry</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Approved &amp; Verified</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#34D399', marginTop: '6px' }}>{approved}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>HoD &amp; Authority cleared</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Returned for Revision</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#F59E0B', marginTop: '6px' }}>{returned}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Feedback awaiting action</div>
        </div>
      </div>

      {/* Modules List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700' }}>Assigned Data Collection Modules</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No data collection templates configured yet.</p>
          ) : tasks.map((task) => (
            <div key={task.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '18px 20px',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '10px',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>{task.name}</h3>
                  <span className={`badge ${task.badge}`}>{task.status}</span>
                  {task.category && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{task.category}</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {task.description || `${task.fieldCount} fields configured.`}
                </p>
                {task.remarks && (
                  <div style={{ fontSize: '0.85rem', color: '#FBBF24', marginTop: '6px' }}>
                    <strong>Reviewer Remark:</strong> {task.remarks}
                  </div>
                )}
              </div>
              <div>
                <Link href={`/dashboard/templates/${task.id}`} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  {task.rawStatus === 'NOT_STARTED' ? 'Start Data Entry' : 
                   task.rawStatus === 'DRAFT' ? 'Resume Draft' :
                   task.rawStatus === 'RETURNED' ? 'Edit & Resubmit' : 'View Submitted'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
