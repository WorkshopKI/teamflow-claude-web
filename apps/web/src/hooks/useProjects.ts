'use client';

import { useCollection } from './useCollection';
import type { Project, ProjectId, ProjectStatus } from '@teamflow/types';

export function useProjects() {
  const collection = useCollection<Project>('projects');

  const getByStatus = (status: ProjectStatus) => {
    return collection.items.filter((project) => project.status === status);
  };

  const getActiveProjects = () => {
    return collection.items.filter((project) => project.status === 'active');
  };

  const getArchivedProjects = () => {
    return collection.items.filter((project) => project.status === 'archived');
  };

  const getCompletedProjects = () => {
    return collection.items.filter((project) => project.status === 'completed');
  };

  const getProjectStats = (projectId: ProjectId, tasks: any[]) => {
    const projectTasks = tasks.filter((t) => t.project === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
    const todo = projectTasks.filter((t) => t.status === 'todo').length;
    const blocked = projectTasks.filter((t) => t.status === 'blocked').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      blocked,
      completionRate,
    };
  };

  return {
    ...collection,
    projects: collection.items,
    getByStatus,
    getActiveProjects,
    getArchivedProjects,
    getCompletedProjects,
    getProjectStats,
  };
}
