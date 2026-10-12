export default function Unauthorized() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--danger)', marginBottom: '10px' }}>403 - Unauthorized</h1>
        <p style={{ color: 'var(--text-muted)' }}>You do not have permission to access this page.</p>
        <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Return to Dashboard
        </a>
      </div>
    </main>
  );
}
