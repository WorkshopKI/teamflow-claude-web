'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskCreateButton } from '@/components/tasks/TaskCreateButton';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import type { ProjectStatus } from '@teamflow/types';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { projects, update, remove, getProjectStats } = useProjects();
  const { items: tasks } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/projects"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium inline-block"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.project === project.id);
  const stats = getProjectStats(project.id, tasks);

  const handleStatusChange = (status: ProjectStatus) => {
    update(project.id, { status });
  };

  const handleDelete = () => {
    remove(project.id);
    router.push('/projects');
  };

  const statusColor = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-foreground">{project.name}</span>
          </div>

          {/* Project Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${statusColor[project.status]}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Edit
              </button>
              <TaskCreateButton projectId={project.id} />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-6 gap-4 py-4 border-t border-border">
            <div>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
              <div className="text-sm text-muted-foreground">Todo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
              <div className="text-sm text-muted-foreground">Blocked</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quick Actions:</span>
              <button
                onClick={() => handleStatusChange('active')}
                disabled={project.status === 'active'}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Active
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={project.status === 'completed'}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleStatusChange('archived')}
                disabled={project.status === 'archived'}
                className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Archive
              </button>
            </div>

            <div>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete project?</span>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsDeleting(false)}
                    className="px-3 py-1 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsDeleting(true)}
                  className="px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  Delete Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="container mx-auto px-6 py-6">
        {projectTasks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
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
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first task for this project
            </p>
            <TaskCreateButton projectId={project.id} />
          </div>
        ) : (
          <TaskBoard tasks={projectTasks} />
        )}
      </div>

      {/* Edit Modal */}
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
