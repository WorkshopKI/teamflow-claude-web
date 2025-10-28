'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { usePersonas } from '@/hooks/usePersonas';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { NodePalette } from '@/components/workflow/NodePalette';
import { NodePropertiesPanel } from '@/components/workflow/NodePropertiesPanel';
import { ScheduleConfigPanel } from '@/components/workflow/ScheduleConfigPanel';
import { EventTriggerConfigPanel } from '@/components/workflow/EventTriggerConfigPanel';
import { TemplateBrowser } from '@/components/workflow/TemplateBrowser';
import { downloadWorkflow, importWorkflowFromJSON } from '@teamflow/workflow-engine/src/import-export';
import type { WorkflowNode, Workflow } from '@teamflow/types';
import type { EventTriggerConfig } from '@teamflow/workflow-engine/src/event-trigger';
import type { WorkflowTemplate } from '@teamflow/workflow-engine/src/templates';

interface ScheduleConfig {
  enabled: boolean;
  pattern: string;
  nextRun?: Date;
}

type RightPanelView = 'properties' | 'logs' | 'schedule' | 'events' | 'settings';

export default function WorkflowBuilderPage({ params }: { params: { id: string } }) {
  const { workflows, addNode, updateNode, removeNode, update, remove, incrementExecutionCount, create } = useWorkflows();
  const { execute, isExecuting, currentExecution, executionError, clearExecution } = useWorkflowExecution();
  const { personas } = usePersonas();
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showExecutionLogs, setShowExecutionLogs] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('properties');
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Workflow configuration state
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [eventTriggers, setEventTriggers] = useState<EventTriggerConfig[]>([]);

  const workflow = workflows.find((w) => w.id === params.id);

  if (!workflow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workflow not found</h2>
          <p className="text-muted-foreground mb-4">
            The workflow you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/workflows"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium inline-block"
          >
            ← Back to Workflows
          </Link>
        </div>
      </div>
    );
  }

  // Get current user
  const currentUser = personas.find((p) => p.type === 'human') || personas[0];

  /**
   * Handle workflow execution
   */
  const handleExecute = async () => {
    if (isExecuting) return;

    try {
      await execute(workflow, currentUser?.id || 'system');
      incrementExecutionCount(workflow.id);
      setShowExecutionLogs(true);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }
  };

  /**
   * Handle workflow delete
   */
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      remove(workflow.id);
      window.location.href = '/workflows';
    }
  };

  /**
   * Handle status change
   */
  const handleStatusChange = (status: 'draft' | 'active' | 'paused' | 'archived') => {
    update(workflow.id, { status, updatedAt: new Date() });
  };

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

  /**
   * Handle template selection
   */
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    // Create nodes from template
    const newNodes: WorkflowNode[] = template.nodes.map((nodeTemplate) => ({
      id: `node_${Date.now()}_${Math.random()}`,
      type: nodeTemplate.type,
      position: nodeTemplate.position,
      data: nodeTemplate.data,
      inputs: nodeTemplate.inputs || [],
      outputs: nodeTemplate.outputs || [],
    }));

    // Create edges from template connections
    const newEdges = template.edgeConnections.map((conn, index) => ({
      id: `edge_${Date.now()}_${index}`,
      source: newNodes[conn.sourceIndex].id,
      target: newNodes[conn.targetIndex].id,
      sourcePort: conn.sourcePort || 'output',
      targetPort: conn.targetPort || 'input',
    }));

    // Update workflow with template nodes and edges
    update(workflow.id, {
      nodes: newNodes,
      edges: newEdges,
      updatedAt: new Date(),
    });

    setShowTemplateBrowser(false);
  };

  /**
   * Handle export workflow
   */
  const handleExport = () => {
    downloadWorkflow(workflow);
    setShowMenu(false);
  };

  /**
   * Handle import workflow
   */
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedWorkflow = importWorkflowFromJSON(text, currentUser?.id || 'system', {
          regenerateIds: true,
          validate: true,
        });

        // Create new workflow from imported data
        create({
          name: `${importedWorkflow.name} (Imported)`,
          description: importedWorkflow.description,
          status: 'draft',
          nodes: importedWorkflow.nodes,
          edges: importedWorkflow.edges,
          variables: importedWorkflow.variables,
          settings: importedWorkflow.settings,
          createdBy: currentUser?.id || 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          executionCount: 0,
        });

        alert('Workflow imported successfully! Check your workflows list.');
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    input.click();
    setShowMenu(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="p-2 hover:bg-secondary rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">{workflow.description || 'No description'}</p>
          </div>
          <span className={`px-3 py-1 ${getStatusColor(workflow.status)} text-white text-xs rounded-full capitalize`}>
            {workflow.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              title="More actions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowTemplateBrowser(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>📋</span>
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      setRightPanelView('schedule');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>⏰</span>
                    Configure Schedule
                  </button>
                  <button
                    onClick={() => {
                      setRightPanelView('events');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>⚡</span>
                    Event Triggers
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Export Workflow
                  </button>
                  <button
                    onClick={handleImport}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>📤</span>
                    Import Workflow
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Actions */}
          <select
            value={workflow.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={isExecuting || workflow.nodes.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                ▶ Run Workflow
              </>
            )}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto shrink-0">
          <NodePalette
            onAddNode={(node) => addNode(workflow.id, node)}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas
            workflow={workflow}
            onNodesChange={(nodes) => update(workflow.id, { nodes, updatedAt: new Date() })}
            onEdgesChange={(edges) => update(workflow.id, { edges, updatedAt: new Date() })}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Right Sidebar - Dynamic Panel */}
        <div className="w-80 border-l border-border bg-card overflow-y-auto shrink-0">
          {showExecutionLogs && currentExecution ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Execution Logs</h3>
                <button
                  onClick={() => {
                    setShowExecutionLogs(false);
                    clearExecution();
                    setRightPanelView('properties');
                  }}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Execution Status */}
              <div className={`p-4 rounded-lg ${
                currentExecution.status === 'success'
                  ? 'bg-green-500/10 border border-green-500'
                  : currentExecution.status === 'failed'
                  ? 'bg-red-500/10 border border-red-500'
                  : 'bg-yellow-500/10 border border-yellow-500'
              }`}>
                <div className="font-semibold capitalize mb-2">
                  {currentExecution.status}
                </div>
                {currentExecution.duration !== null && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {(currentExecution.duration / 1000).toFixed(2)}s
                  </div>
                )}
              </div>

              {/* Error Message */}
              {executionError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <div className="font-semibold text-destructive mb-2">Error</div>
                  <div className="text-sm">{executionError}</div>
                </div>
              )}

              {/* Logs */}
              <div className="space-y-2">
                <h4 className="font-medium">Logs</h4>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {currentExecution.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        log.level === 'error'
                          ? 'bg-destructive/10 text-destructive'
                          : log.level === 'warn'
                          ? 'bg-yellow-500/10 text-yellow-700'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="font-mono">
                        [{log.level.toUpperCase()}] {log.message}
                      </div>
                      {log.data && (
                        <div className="mt-1 text-muted-foreground">
                          {JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : rightPanelView === 'schedule' ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Schedule Configuration</h3>
                <button
                  onClick={() => setRightPanelView('properties')}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ScheduleConfigPanel
                workflow={workflow}
                schedule={scheduleConfig || undefined}
                onScheduleChange={setScheduleConfig}
              />
            </div>
          ) : rightPanelView === 'events' ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Event Triggers</h3>
                <button
                  onClick={() => setRightPanelView('properties')}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EventTriggerConfigPanel
                workflow={workflow}
                triggers={eventTriggers}
                onTriggersChange={setEventTriggers}
              />
            </div>
          ) : selectedNode ? (
            <NodePropertiesPanel
              node={selectedNode}
              onUpdate={(nodeId, data) => {
                updateNode(workflow.id, nodeId, { data });
                // Update local selected node
                setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
              }}
              onDelete={(nodeId) => {
                removeNode(workflow.id, nodeId);
                setSelectedNode(null);
              }}
              onClose={() => setSelectedNode(null)}
            />
          ) : (
            <div className="p-4 flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <p>Select a node to edit its properties</p>
                <p className="text-sm mt-2">or use the menu to configure workflow settings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{workflow.nodes.length} nodes</span>
          <span>{workflow.edges.length} connections</span>
          <span>{workflow.executionCount} total runs</span>
          {scheduleConfig?.enabled && (
            <span className="text-blue-600 dark:text-blue-400">
              ⏰ Scheduled
            </span>
          )}
          {eventTriggers.length > 0 && (
            <span className="text-purple-600 dark:text-purple-400">
              ⚡ {eventTriggers.length} trigger{eventTriggers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(workflow.updatedAt).toLocaleString()}
        </div>
      </div>

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <TemplateBrowser
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateBrowser(false)}
        />
      )}
    </div>
  );
}
