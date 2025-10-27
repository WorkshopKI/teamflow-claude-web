import type { Metadata } from 'next';
import './globals.css';
import { DatabaseProvider } from '@/providers/DatabaseProvider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'TeamFlow AI - Local-First Collaborative Platform',
  description:
    'Empower teams with a local-first, open-source collaborative platform where humans and AI agents work side by side.',
  keywords: [
    'collaboration',
    'local-first',
    'AI agents',
    'workflow automation',
    'task management',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <DatabaseProvider>
          <div id="app-root" className="min-h-screen bg-background">
            <Navigation />
            {children}
          </div>
        </DatabaseProvider>
      </body>
    </html>
  );
}
