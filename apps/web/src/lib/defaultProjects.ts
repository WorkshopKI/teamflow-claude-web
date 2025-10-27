import { createProject } from '@teamflow/core';
import type { Project } from '@teamflow/types';

/**
 * Default project for new users
 */
export const DEFAULT_PROJECT: Project = createProject({
  name: 'General',
  description: 'Default project for tasks',
  status: 'active',
  team: 'default-team',
  createdBy: 'default-user',
});

/**
 * Check if default project should be seeded
 */
export function shouldSeedDefaultProject(existingProjects: Project[]): boolean {
  return existingProjects.length === 0;
}
