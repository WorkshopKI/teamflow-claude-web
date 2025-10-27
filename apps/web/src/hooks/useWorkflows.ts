/**
 * useWorkflows Hook
 *
 * React hook for managing workflows with CRDT-based state
 */

'use client';

import { useCollection } from './useCollection';
import { createWorkflow } from '@teamflow/core';
import type { Workflow, WorkflowId, WorkflowNode, WorkflowEdge, PersonaId } from '@teamflow/types';

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  createdBy: PersonaId;
}

export function useWorkflows() {
  const collection = useCollection<Workflow>('workflows');

  /**
   * Create a new workflow
   */
  const createNew = (input: CreateWorkflowInput) => {
    const workflow = createWorkflow({
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
    });
    collection.create(workflow);
    return workflow;
  };

  /**
   * Get workflows by status
   */
  const getWorkflowsByStatus = (status: 'draft' | 'active' | 'paused' | 'archived') => {
    return collection.items.filter((workflow) => workflow.status === status);
  };

  /**
   * Get active workflows
   */
  const getActiveWorkflows = () => {
    return collection.items.filter((workflow) => workflow.status === 'active');
  };

  /**
   * Get draft workflows
   */
  const getDraftWorkflows = () => {
    return collection.items.filter((workflow) => workflow.status === 'draft');
  };

  /**
   * Add a node to a workflow
   */
  const addNode = (workflowId: WorkflowId, node: WorkflowNode) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    collection.update(workflowId, {
      nodes: [...workflow.nodes, node],
      updatedAt: new Date(),
    });
  };

  /**
   * Update a node in a workflow
   */
  const updateNode = (workflowId: WorkflowId, nodeId: string, updates: Partial<WorkflowNode>) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    const nodeIndex = workflow.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) return;

    const updatedNodes = [...workflow.nodes];
    updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], ...updates };

    collection.update(workflowId, {
      nodes: updatedNodes,
      updatedAt: new Date(),
    });
  };

  /**
   * Remove a node from a workflow
   */
  const removeNode = (workflowId: WorkflowId, nodeId: string) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    // Remove node and any edges connected to it
    collection.update(workflowId, {
      nodes: workflow.nodes.filter((n) => n.id !== nodeId),
      edges: workflow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      updatedAt: new Date(),
    });
  };

  /**
   * Add an edge to a workflow
   */
  const addEdge = (workflowId: WorkflowId, edge: WorkflowEdge) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    collection.update(workflowId, {
      edges: [...workflow.edges, edge],
      updatedAt: new Date(),
    });
  };

  /**
   * Remove an edge from a workflow
   */
  const removeEdge = (workflowId: WorkflowId, edgeId: string) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    collection.update(workflowId, {
      edges: workflow.edges.filter((e) => e.id !== edgeId),
      updatedAt: new Date(),
    });
  };

  /**
   * Update workflow status
   */
  const updateStatus = (workflowId: WorkflowId, status: 'draft' | 'active' | 'paused' | 'archived') => {
    collection.update(workflowId, {
      status,
      updatedAt: new Date(),
    });
  };

  /**
   * Increment execution count
   */
  const incrementExecutionCount = (workflowId: WorkflowId) => {
    const workflow = collection.items.find((w) => w.id === workflowId);
    if (!workflow) return;

    collection.update(workflowId, {
      executionCount: workflow.executionCount + 1,
      lastExecutedAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return {
    // Collection methods
    workflows: collection.items,
    isLoading: collection.isLoading,
    create: createNew,
    update: collection.update,
    remove: collection.remove,
    getById: collection.get,

    // Workflow-specific methods
    getWorkflowsByStatus,
    getActiveWorkflows,
    getDraftWorkflows,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    updateStatus,
    incrementExecutionCount,
  };
}
