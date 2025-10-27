'use client';

import type { Task, TaskStatus } from '@teamflow/types';
import { useCollection } from './useCollection';

/**
 * Hook for managing tasks
 */
export function useTasks() {
  const collection = useCollection<Task>('tasks');

  const getByStatus = (status: TaskStatus) => {
    return collection.items.filter((task) => task.status === status);
  };

  const getByProject = (projectId: string) => {
    return collection.items.filter((task) => task.project === projectId);
  };

  const getByAssignee = (assigneeId: string) => {
    return collection.items.filter((task) => task.assignee === assigneeId);
  };

  const getOverdue = () => {
    const now = new Date();
    return collection.items.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'done' &&
        task.status !== 'cancelled'
    );
  };

  return {
    ...collection,
    getByStatus,
    getByProject,
    getByAssignee,
    getOverdue,
  };
}
