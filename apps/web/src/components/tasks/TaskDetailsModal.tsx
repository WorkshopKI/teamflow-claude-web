'use client';

import { useState } from 'react';
import type { Task, TaskPriority, TaskStatus, AIPersona } from '@teamflow/types';
import { useTasks } from '@/hooks/useTasks';
import { usePersonas } from '@/hooks/usePersonas';
import { useProjects } from '@/hooks/useProjects';
import { useActivities } from '@/hooks/useActivities';
import { useAgentExecution } from '@/hooks/useAgentExecution';
import { formatRelativeTime } from '@teamflow/core';
import { TaskComments } from './TaskComments';
import { ActivityFeed } from './ActivityFeed';

interface TaskDetailsModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked', 'cancelled'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

type TabType = 'details' | 'comments' | 'activity';

export function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
  const { update, remove } = useTasks();
  const { personas } = usePersonas();
  const { projects } = useProjects();
  const { createActivity } = useActivities();
  const { execute: executeAgent, isExecuting, executionError } = useAgentExecution();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExecutionResult, setShowExecutionResult] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignee: task.assignee || '',
    project: task.project,
    tags: task.tags.join(', '),
  });

  if (!isOpen) return null;

  // Get the current user (first persona, or default "You" persona)
  const currentUser = personas.find((p) => p.type === 'human') || personas[0];
  const currentUserId = currentUser?.id || 'default-user';

  const handleSave = () => {
    const oldTask = { ...task };
    const updates: Partial<Task> = {
      title: editedTask.title.trim(),
      description: editedTask.description.trim(),
      priority: editedTask.priority,
      status: editedTask.status,
      assignee: editedTask.assignee || null,
      project: editedTask.project,
      tags: editedTask.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    update(task.id, updates);

    // Log activities for changes
    if (oldTask.status !== updates.status && updates.status) {
      createActivity('status_changed', task.id, currentUserId, {
        field: 'status',
        oldValue: oldTask.status,
        newValue: updates.status,
      });
    }

    if (oldTask.priority !== updates.priority && updates.priority) {
      createActivity('priority_changed', task.id, currentUserId, {
        field: 'priority',
        oldValue: oldTask.priority,
        newValue: updates.priority,
      });
    }

    if (oldTask.assignee !== updates.assignee) {
      createActivity('assignee_changed', task.id, currentUserId, {
        field: 'assignee',
        oldValue: oldTask.assignee,
        newValue: updates.assignee,
      });
    }

    if (oldTask.project !== updates.project) {
      createActivity('task_updated', task.id, currentUserId, {
        field: 'project',
        oldValue: oldTask.project,
        newValue: updates.project,
      });
    }

    setIsEditing(false);
  };

  const handleDelete = () => {
    createActivity('task_deleted', task.id, currentUserId);
    remove(task.id);
    onClose();
  };

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee || '',
      project: task.project,
      tags: task.tags.join(', '),
    });
    setIsEditing(false);
  };

  const handleExecuteAgent = async () => {
    if (!assignedPersona || assignedPersona.type !== 'ai') return;

    setShowExecutionResult(false);
    const result = await executeAgent(task, assignedPersona as AIPersona);

    if (result) {
      const message = result.success
        ? `✅ Agent executed successfully!\n\n${result.toolsUsed.length} tool(s) used.`
        : `❌ Execution failed: ${result.error || result.message}`;
      setExecutionResult(message);
      setShowExecutionResult(true);

      // Switch to activity/comments tab to see results
      if (result.success && result.toolsUsed.length > 0) {
        setActiveTab('activity');
      }
    }
  };

  const assignedPersona = personas.find((p) => p.id === task.assignee);

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: 'Comments', badge: task.comments?.length || 0 },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border shrink-0">
          <div className="flex gap-1 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={editedTask.description}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  {isEditing ? (
                    <select
                      value={editedTask.status}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, status: e.target.value as TaskStatus })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-secondary rounded-lg capitalize">
                      {task.status.replace('_', ' ')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  {isEditing ? (
                    <select
                      value={editedTask.priority}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          priority: e.target.value as TaskPriority,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-secondary rounded-lg capitalize">
                      {task.priority}
                    </div>
                  )}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium mb-2">Assignee</label>
                {isEditing ? (
                  <select
                    value={editedTask.assignee}
                    onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Unassigned</option>
                    {personas.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.type === 'ai' ? '🤖 ' : '👤 '}
                        {persona.name} - {persona.role}
                      </option>
                    ))}
                  </select>
                ) : assignedPersona ? (
                  <div className="px-3 py-2 bg-secondary rounded-lg flex items-center gap-2">
                    <span>{assignedPersona.type === 'ai' ? '🤖' : '👤'}</span>
                    <span>
                      {assignedPersona.name} ({assignedPersona.role})
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-secondary rounded-lg text-muted-foreground">
                    Unassigned
                  </div>
                )}
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium mb-2">Project</label>
                {isEditing ? (
                  <select
                    value={editedTask.project}
                    onChange={(e) => setEditedTask({ ...editedTask, project: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-secondary rounded-lg">
                    {projects.find((p) => p.id === task.project)?.name || 'Unknown Project'}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.tags}
                    onChange={(e) => setEditedTask({ ...editedTask, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="tag1, tag2, tag3"
                  />
                ) : task.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No tags</p>
                )}
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-border text-sm text-muted-foreground space-y-2">
                <p>Created {formatRelativeTime(task.createdAt)}</p>
                <p>Last updated {formatRelativeTime(task.updatedAt)}</p>
                <p>ID: {task.id}</p>
              </div>
            </div>
          )}

          {activeTab === 'comments' && <TaskComments task={task} currentUserId={currentUserId} />}

          {activeTab === 'activity' && <ActivityFeed taskId={task.id} />}
        </div>

        {/* Execution Result */}
        {showExecutionResult && executionResult && (
          <div className="border-t border-border p-4 bg-secondary/20">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm whitespace-pre-wrap">{executionResult}</p>
              </div>
              <button
                onClick={() => setShowExecutionResult(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Execution Error */}
        {executionError && (
          <div className="border-t border-border p-4 bg-destructive/10">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-destructive">{executionError}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-border p-6 flex items-center justify-between shrink-0">
          <div>
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this task?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsDeleting(true)}
                className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
              >
                Delete Task
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Close
                </button>
                {assignedPersona && assignedPersona.type === 'ai' && (
                  <button
                    onClick={handleExecuteAgent}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Execute task with AI agent"
                  >
                    {isExecuting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Executing...
                      </>
                    ) : (
                      <>
                        🤖 Execute with AI
                      </>
                    )}
                  </button>
                )}
                {activeTab === 'details' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Edit Task
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
