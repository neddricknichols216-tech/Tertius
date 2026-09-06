import React from 'react';
import { SupabaseProvider } from '@/app/providers/SupabaseProvider';
import './globals.css';

export const metadata = {
  title: 'Tertius',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <div style={{ padding: 12 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Tertius</h1>
              <div id="auth-controls"></div>
            </header>
            <main style={{ marginTop: 16 }}>{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
