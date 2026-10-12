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
      </head>
      <body>
        <Providers>
          <header>
            <div className="logo">CUK DataHub</div>
            <nav style={{ display: 'flex', alignItems: 'center' }}>
              <a href="#" style={{ marginRight: '20px', color: 'var(--text-muted)' }}>Help</a>
              <HeaderAuth />
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
