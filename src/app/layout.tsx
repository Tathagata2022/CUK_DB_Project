import './globals.css';
import type { Metadata } from 'next';
import HeaderAuth from "@/components/HeaderAuth";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: 'Centralised Data System - CUK',
  description: 'University Data Management System for Central University of Kerala',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
                const _measure = window.performance.measure.bind(window.performance);
                window.performance.measure = function(name, startOrOpts, end) {
                  try {
                    return _measure(name, startOrOpts, end);
                  } catch (e) {
                    // Prevent React 19 / Next.js negative timestamp measure crash
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <header>
            <div className="logo">CUK DataHub</div>
            <nav style={{ display: 'flex', alignItems: 'center' }}>
              <HeaderAuth />
            </nav>
          </header>
          {children}
          <footer style={{
            marginTop: 'auto',
            padding: '28px 40px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Left: University branding */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} Central University of Kerala — Centralised Data System. All rights reserved.
            </div>

            {/* Right: Developer credit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Developed by</span>
              <a
                href="https://www.linkedin.com/in/tathagata-mandal-453863225/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#60A5FA',
                  fontWeight: 600,
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(96,165,250,0.3)',
                  background: 'rgba(96,165,250,0.08)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(96,165,250,0.18)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(96,165,250,0.6)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(96,165,250,0.08)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(96,165,250,0.3)';
                }}
              >
                {/* LinkedIn Icon SVG */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Tathagata Mandal
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
