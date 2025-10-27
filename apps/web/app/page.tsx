'use client';

import Link from 'next/link';
import { useDatabase } from '@/providers/DatabaseProvider';

export default function Home() {
  const { isLoading } = useDatabase();

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Initializing TeamFlow AI</h2>
          <p className="text-muted-foreground">Setting up your local-first workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TeamFlow AI
          </h1>
          <p className="text-2xl text-muted-foreground text-center max-w-2xl">
            Local-first collaborative platform where humans and AI agents work together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-2">🔒 Local-First</h3>
            <p className="text-muted-foreground">
              All data stored locally with peer-to-peer synchronization. Work offline, own your
              data.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-2">🤖 AI-Native</h3>
            <p className="text-muted-foreground">
              AI agents as first-class team members. Automate workflows with intelligent
              collaboration.
            </p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors">
            <h3 className="text-xl font-semibold mb-2">⚡ Zero-Config</h3>
            <p className="text-muted-foreground">
              Productive in under 5 minutes. No servers, no setup, just start working.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/tasks"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <a
            href="https://github.com/WorkshopKI/teamflow-claude-web"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors"
          >
            View on GitHub
          </a>
        </div>

        <div className="mt-16 p-6 border border-green-500/50 bg-green-500/10 rounded-lg">
          <p className="text-sm text-center">
            <strong>✅ Status:</strong> Database initialized! Your local-first workspace is ready.
            Click &quot;Get Started&quot; to begin managing tasks.
          </p>
        </div>
      </div>
    </main>
  );
}
