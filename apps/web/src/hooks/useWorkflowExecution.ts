/**
 * useWorkflowExecution Hook
 *
 * React hook for executing workflows
 */

'use client';

import { useState, useCallback } from 'react';
import { executeWorkflow, type WorkflowExecutionOptions } from '@teamflow/workflow-engine';
import { createWorkflowExecution, createTask } from '@teamflow/core';
import { useTasks } from './useTasks';
import { usePersonas } from './usePersonas';
import type { Workflow, WorkflowExecution, PersonaId } from '@teamflow/types';

export function useWorkflowExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const { items: tasks, create: createTaskInDB } = useTasks();
  const { personas } = usePersonas();

  /**
   * Execute a workflow
   */
  const execute = useCallback(
    async (workflow: Workflow, triggeredBy: PersonaId | 'system' = 'system', context?: Record<string, any>) => {
      try {
        setIsExecuting(true);
        setExecutionError(null);

        // Create execution record
        const execution = createWorkflowExecution({
          workflowId: workflow.id,
          triggeredBy,
          context: {
            variables: context || {},
            nodeResults: {},
            currentNodeId: null,
          },
        });

        setCurrentExecution(execution);

        // Execute workflow
        const options: WorkflowExecutionOptions = {
          workflow,
          execution,
          context: {
            createTask: (taskData: any) => {
              const task = createTask({
                ...taskData,
                title: taskData.title,
                project: taskData.project || 'default',
                createdBy: triggeredBy as string,
              });
              createTaskInDB(task);
              return task;
            },
            executeAgent: async (agentData: any) => {
              // Find agent
              const agent = personas.find((p) => p.id === agentData.agentId && p.type === 'ai');
              if (!agent) {
                return { success: false, error: 'Agent not found' };
              }

              // For now, return a placeholder - full agent execution would require API keys
              return {
                success: true,
                agentId: agent.id,
                agentName: agent.name,
                instruction: agentData.instruction,
                message: 'Agent execution placeholder - configure API keys for full execution',
              };
            },
          },
        };

        const result = await executeWorkflow(options);

        setCurrentExecution(result);
        setIsExecuting(false);

        return result;
      } catch (error: any) {
        setExecutionError(error.message);
        setIsExecuting(false);
        throw error;
      }
    },
    [tasks, personas, createTaskInDB]
  );

  /**
   * Clear execution state
   */
  const clearExecution = useCallback(() => {
    setCurrentExecution(null);
    setExecutionError(null);
  }, []);

  return {
    execute,
    isExecuting,
    currentExecution,
    executionError,
    clearExecution,
  };
}
