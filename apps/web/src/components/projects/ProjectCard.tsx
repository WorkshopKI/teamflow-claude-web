'use client';

import type { Project, Task } from '@teamflow/types';
import { useProjects } from '@/hooks/useProjects';
import { formatRelativeTime } from '@teamflow/core';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
}

export function ProjectCard({ project, tasks }: ProjectCardProps) {
  const { getProjectStats } = useProjects();
  const stats = getProjectStats(project.id, tasks);

  const statusColor = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
            statusColor[project.status]
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{stats.completionRate}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-muted-foreground">Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          <div className="text-xs text-muted-foreground">Todo</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <span>Updated {formatRelativeTime(project.updatedAt)}</span>
        {stats.blocked > 0 && (
          <span className="text-destructive font-medium">{stats.blocked} blocked</span>
        )}
      </div>
    </div>
  );
}
