'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/useWorkflows';
import { usePersonas } from '@/hooks/usePersonas';

export default function WorkflowsPage() {
  const { workflows, create, remove, updateStatus } = useWorkflows();
  const { personas } = usePersonas();
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'paused' | 'archived'>('all');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  // Get current user
  const currentUser = personas.find((p) => p.type === 'human') || personas[0];

  /**
   * Handle workflow creation
   */
  const handleCreate = () => {
    if (!newWorkflowName.trim()) return;

    const workflow = create({
      name: newWorkflowName.trim(),
      description: newWorkflowDescription.trim(),
      createdBy: currentUser?.id || 'default-user',
    });

    setNewWorkflowName('');
    setNewWorkflowDescription('');
    setIsCreating(false);

    // Navigate to builder
    window.location.href = `/workflows/${workflow.id}`;
  };

  /**
   * Handle workflow deletion
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      remove(id);
    }
  };

  /**
   * Filter workflows
   */
  const filteredWorkflows = workflows.filter((workflow) => {
    if (statusFilter === 'all') return true;
    return workflow.status === statusFilter;
  });

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workflows</h1>
          <p className="text-muted-foreground">
            Automate tasks with visual workflow builder
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          + New Workflow
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {[
          { id: 'all', label: 'All', count: workflows.length },
          { id: 'draft', label: 'Draft', count: workflows.filter((w) => w.status === 'draft').length },
          { id: 'active', label: 'Active', count: workflows.filter((w) => w.status === 'active').length },
          { id: 'paused', label: 'Paused', count: workflows.filter((w) => w.status === 'paused').length },
          { id: 'archived', label: 'Archived', count: workflows.filter((w) => w.status === 'archived').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`pb-3 px-2 font-medium transition-colors relative ${
              statusFilter === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Link
              key={workflow.id}
              href={`/workflows/${workflow.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-xl font-semibold">{workflow.name}</h3>
                </div>
                <span className={`px-2 py-1 ${getStatusColor(workflow.status)} text-white text-xs rounded-full capitalize`}>
                  {workflow.status}
                </span>
              </div>

              {workflow.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {workflow.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{workflow.nodes.length} nodes</span>
                  <span>{workflow.edges.length} connections</span>
                </div>
                <span>{workflow.executionCount} runs</span>
              </div>

              {workflow.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {workflow.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {workflow.tags.length > 3 && (
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                      +{workflow.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateStatus(workflow.id, workflow.status === 'active' ? 'paused' : 'active');
                  }}
                  className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded transition-colors text-sm"
                >
                  {workflow.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(workflow.id);
                  }}
                  className="px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-semibold mb-2">No workflows yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first workflow to automate tasks
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Create Workflow
          </button>
        </div>
      )}

      {/* Create Workflow Modal */}
      {isCreating && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsCreating(false)}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create Workflow</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter workflow name..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Enter workflow description..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Create & Edit
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
