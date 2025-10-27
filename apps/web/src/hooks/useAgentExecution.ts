'use client';

import { useState } from 'react';
import { executeAgent, type AgentExecutionResult } from '@teamflow/ai-agents';
import type { Task, AIPersona, Comment } from '@teamflow/types';
import { useTasks } from './useTasks';
import { useActivities } from './useActivities';
import { getAPIKey } from '@/lib/settings-storage';
import { nanoid } from 'nanoid';

export function useAgentExecution() {
  const { update: updateTask } = useTasks();
  const { createActivity } = useActivities();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const execute = async (
    task: Task,
    agent: AIPersona,
    additionalInstructions?: string
  ): Promise<AgentExecutionResult | null> => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Get API key for the agent's LLM provider
      const apiKey = getAPIKey(agent.llmConfig.provider);

      if (!apiKey && agent.llmConfig.provider !== 'ollama') {
        throw new Error(
          `API key not configured for ${agent.llmConfig.provider}. Please add it in Settings.`
        );
      }

      // Create execution context
      const context = {
        task,
        agentId: agent.id,
        updateTask: async (taskId: string, updates: Partial<Task>) => {
          const updated = updateTask(taskId, updates);
          return updated;
        },
        createComment: async (taskId: string, content: string, authorId: string) => {
          // Add comment to task
          const comment: Comment = {
            id: nanoid(),
            content,
            author: authorId,
            createdAt: new Date(),
            updatedAt: new Date(),
            mentions: [],
          };

          const currentComments = task.comments || [];
          updateTask(taskId, { comments: [...currentComments, comment] });

          // Log activity
          createActivity('comment_added', taskId, authorId, undefined, {
            commentId: comment.id,
            preview: content.substring(0, 50),
          });
        },
      };

      // Execute agent
      // Note: We create a modified agent with API key set since it's stored separately
      const agentWithKey = {
        ...agent,
        llmConfig: {
          ...agent.llmConfig,
          apiKey,
        },
      };

      const result = await executeAgent({
        task,
        agent: agentWithKey,
        context,
        additionalInstructions,
      });

      // Log agent execution in activity
      if (result.success) {
        createActivity('task_updated', task.id, agent.id, undefined, {
          agentExecution: true,
          toolsUsed: result.toolsUsed.length,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setExecutionError(errorMessage);
      return {
        success: false,
        message: 'Execution failed',
        toolsUsed: [],
        error: errorMessage,
      };
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    execute,
    isExecuting,
    executionError,
  };
}
