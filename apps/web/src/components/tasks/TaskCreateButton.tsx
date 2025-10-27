'use client';

import { useState, forwardRef } from 'react';
import { createTask } from '@teamflow/core';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { usePersonas } from '@/hooks/usePersonas';
import type { TaskPriority } from '@teamflow/types';

interface TaskCreateButtonProps {
  projectId?: string;
}

export const TaskCreateButton = forwardRef<HTMLButtonElement, TaskCreateButtonProps>(
  function TaskCreateButton({ projectId }, ref) {
    const { create } = useTasks();
    const { projects } = useProjects();
    const { personas } = usePersonas();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    // Get default project (General project)
    const defaultProject = projects.find((p) => p.name === 'General') || projects[0];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) return;

      // Get current user
      const currentUser = personas.find((p) => p.type === 'human') || personas[0];
      const currentUserId = currentUser?.id || 'default-user';

      // Determine which project to use: prop > selected > default
      const finalProjectId = projectId || selectedProjectId || defaultProject?.id || 'default';

      const newTask = createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        project: finalProjectId,
        createdBy: currentUserId,
      });

      create(newTask);

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSelectedProjectId('');
      setIsOpen(false);
    };

  if (!isOpen) {
      return (
        <button
          ref={ref}
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          + New Task
        </button>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Task</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter task title..."
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                placeholder="Enter task description..."
              />
            </div>

            {/* Project Selector (only if not provided as prop) */}
            {!projectId && projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <select
                  value={selectedProjectId || defaultProject?.id || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);
