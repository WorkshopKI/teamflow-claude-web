'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskCreateButton } from '@/components/tasks/TaskCreateButton';
import { TaskFilters, type TaskFilterOptions } from '@/components/tasks/TaskFilters';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import type { Task } from '@teamflow/types';

export default function TasksPage() {
  const router = useRouter();
  const { items: tasks, isLoading } = useTasks();
  const [filters, setFilters] = useState<TaskFilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    tags: [],
  });
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      handler: () => setShowShortcutsModal(!showShortcutsModal),
    },
    {
      key: 'Escape',
      description: 'Close modals',
      handler: () => setShowShortcutsModal(false),
    },
    {
      key: 'c',
      description: 'Create new task',
      handler: () => createButtonRef.current?.click(),
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search',
      handler: () => {
        const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: '/',
      description: 'Focus search',
      handler: () => {
        const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: 'r',
      description: 'Clear filters',
      handler: () => {
        setFilters({
          search: '',
          status: 'all',
          priority: 'all',
          assignee: 'all',
          tags: [],
        });
      },
    },
    {
      key: 't',
      description: 'Go to Tasks',
      handler: () => router.push('/tasks'),
    },
    {
      key: 'p',
      description: 'Go to Projects',
      handler: () => router.push('/projects'),
    },
    {
      key: 'w',
      description: 'Go to Workflows',
      handler: () => router.push('/workflows'),
    },
    {
      key: 'm',
      description: 'Go to Team',
      handler: () => router.push('/team'),
    },
    {
      key: 'h',
      description: 'Go to Home',
      handler: () => router.push('/'),
    },
  ];

  useKeyboardShortcuts(shortcuts, !showShortcutsModal);

  // Apply filters and search to tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      // Search filter (searches in title and description)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Assignee filter
      if (filters.assignee !== 'all') {
        if (filters.assignee === 'unassigned' && task.assignee !== null) {
          return false;
        }
        if (filters.assignee !== 'unassigned' && task.assignee !== filters.assignee) {
          return false;
        }
      }

      // Tags filter (if we add it in the future)
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every((filterTag) => task.tags.includes(filterTag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tasks</h1>
              <p className="text-muted-foreground mt-1">
                {filteredTasks.length} of {tasks.length} tasks
                {filteredTasks.length !== tasks.length && ' (filtered)'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
                title="Keyboard shortcuts (?)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span className="text-sm">?</span>
              </button>
              <TaskCreateButton ref={createButtonRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        {/* Task Board */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {tasks.length === 0
                ? 'Create your first task to get started'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <TaskBoard tasks={filteredTasks} />
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        shortcuts={shortcuts}
      />
    </div>
  );
}
