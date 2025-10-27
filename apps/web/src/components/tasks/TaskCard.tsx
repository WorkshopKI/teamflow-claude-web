'use client';

import type { Task, TaskStatus, TaskPriority } from '@teamflow/types';
import { formatRelativeTime } from '@teamflow/core';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: TaskStatus) => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
};

export function TaskCard({ task }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Priority Badge */}
      {task.priority !== 'medium' && (
        <div className="mb-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
              PRIORITY_COLORS[task.priority]
            }`}
          >
            {task.priority.toUpperCase()}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        {/* Due Date */}
        {task.dueDate ? (
          <span className={isOverdue ? 'text-destructive font-medium' : ''}>
            {isOverdue ? '⚠ ' : ''}
            {formatRelativeTime(task.dueDate)}
          </span>
        ) : (
          <span>No due date</span>
        )}

        {/* Updated */}
        <span>{formatRelativeTime(task.updatedAt)}</span>
      </div>
    </div>
  );
}
