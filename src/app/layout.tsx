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
        </Providers>
      </body>
    </html>
  );
}
