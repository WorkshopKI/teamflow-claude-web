'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary';
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              TeamFlow AI
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/tasks"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive('/tasks')}`}
            >
              Tasks
            </Link>
            <Link
              href="/projects"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive('/projects')}`}
            >
              Projects
            </Link>
            <Link
              href="/workflows"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive('/workflows')}`}
            >
              Workflows
            </Link>
            <Link
              href="/team"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive('/team')}`}
            >
              Team
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button className="px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
