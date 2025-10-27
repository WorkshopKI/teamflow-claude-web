/**
 * TeamFlow AI - Agent Tools
 *
 * Tools that AI agents can use to interact with tasks and the system
 */

import type { Task, TaskStatus, TaskPriority } from '@teamflow/types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required?: boolean;
      enum?: string[];
    };
  };
}

export interface ToolExecutionContext {
  task: Task;
  agentId: string;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  createComment: (taskId: string, content: string, authorId: string) => Promise<void>;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Available tools for AI agents
 */
export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'add_comment',
    description: 'Add a comment to the task to communicate progress, ask questions, or provide updates',
    parameters: {
      content: {
        type: 'string',
        description: 'The comment content to add',
        required: true,
      },
    },
  },
  {
    name: 'update_status',
    description: 'Update the task status',
    parameters: {
      status: {
        type: 'string',
        description: 'The new status for the task',
        required: true,
        enum: ['todo', 'in_progress', 'done', 'blocked', 'cancelled'],
      },
      reason: {
        type: 'string',
        description: 'Brief explanation for the status change',
        required: false,
      },
    },
  },
  {
    name: 'update_priority',
    description: 'Update the task priority',
    parameters: {
      priority: {
        type: 'string',
        description: 'The new priority for the task',
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
      },
      reason: {
        type: 'string',
        description: 'Brief explanation for the priority change',
        required: false,
      },
    },
  },
  {
    name: 'update_description',
    description: 'Update or enhance the task description with additional details, clarifications, or findings',
    parameters: {
      description: {
        type: 'string',
        description: 'The updated description content',
        required: true,
      },
    },
  },
  {
    name: 'add_tags',
    description: 'Add tags to categorize or label the task',
    parameters: {
      tags: {
        type: 'string',
        description: 'Comma-separated list of tags to add',
        required: true,
      },
    },
  },
  {
    name: 'complete_task',
    description: 'Mark the task as completed with a summary comment',
    parameters: {
      summary: {
        type: 'string',
        description: 'Summary of what was accomplished',
        required: true,
      },
    },
  },
  {
    name: 'request_clarification',
    description: 'Request clarification or additional information needed to complete the task',
    parameters: {
      question: {
        type: 'string',
        description: 'The question or clarification needed',
        required: true,
      },
    },
  },
];

/**
 * Execute a tool with the given parameters
 */
export async function executeTool(
  toolName: string,
  parameters: Record<string, any>,
  context: ToolExecutionContext
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case 'add_comment':
        return await executeAddComment(parameters as { content: string }, context);
      case 'update_status':
        return await executeUpdateStatus(parameters as { status: TaskStatus; reason?: string }, context);
      case 'update_priority':
        return await executeUpdatePriority(parameters as { priority: TaskPriority; reason?: string }, context);
      case 'update_description':
        return await executeUpdateDescription(parameters as { description: string }, context);
      case 'add_tags':
        return await executeAddTags(parameters as { tags: string }, context);
      case 'complete_task':
        return await executeCompleteTask(parameters as { summary: string }, context);
      case 'request_clarification':
        return await executeRequestClarification(parameters as { question: string }, context);
      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function executeAddComment(
  params: { content: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.createComment(context.task.id, params.content, context.agentId);
  return {
    success: true,
    message: 'Comment added successfully',
  };
}

async function executeUpdateStatus(
  params: { status: TaskStatus; reason?: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.updateTask(context.task.id, { status: params.status });
  if (params.reason) {
    await context.createComment(
      context.task.id,
      `Status changed to "${params.status}": ${params.reason}`,
      context.agentId
    );
  }
  return {
    success: true,
    message: `Status updated to ${params.status}`,
    data: { status: params.status },
  };
}

async function executeUpdatePriority(
  params: { priority: TaskPriority; reason?: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.updateTask(context.task.id, { priority: params.priority });
  if (params.reason) {
    await context.createComment(
      context.task.id,
      `Priority changed to "${params.priority}": ${params.reason}`,
      context.agentId
    );
  }
  return {
    success: true,
    message: `Priority updated to ${params.priority}`,
    data: { priority: params.priority },
  };
}

async function executeUpdateDescription(
  params: { description: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.updateTask(context.task.id, { description: params.description });
  return {
    success: true,
    message: 'Description updated successfully',
  };
}

async function executeAddTags(
  params: { tags: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  const newTags = params.tags.split(',').map((t) => t.trim()).filter(Boolean);
  const existingTags = context.task.tags || [];
  const uniqueTags = Array.from(new Set([...existingTags, ...newTags]));

  await context.updateTask(context.task.id, { tags: uniqueTags });
  return {
    success: true,
    message: `Added tags: ${newTags.join(', ')}`,
    data: { tags: uniqueTags },
  };
}

async function executeCompleteTask(
  params: { summary: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.updateTask(context.task.id, { status: 'done' });
  await context.createComment(
    context.task.id,
    `✅ Task completed!\n\n${params.summary}`,
    context.agentId
  );
  return {
    success: true,
    message: 'Task marked as completed',
    data: { status: 'done' },
  };
}

async function executeRequestClarification(
  params: { question: string },
  context: ToolExecutionContext
): Promise<ToolResult> {
  await context.updateTask(context.task.id, { status: 'blocked' });
  await context.createComment(
    context.task.id,
    `❓ Need clarification:\n\n${params.question}`,
    context.agentId
  );
  return {
    success: true,
    message: 'Clarification requested',
    data: { status: 'blocked' },
  };
}

/**
 * Get tool definitions formatted for LLM prompt
 */
export function getToolsPrompt(): string {
  return `You have access to the following tools:

${AGENT_TOOLS.map((tool) => {
  const params = Object.entries(tool.parameters)
    .map(([name, config]) => {
      const required = config.required ? ' (required)' : ' (optional)';
      const enumValues = config.enum ? ` [${config.enum.join('|')}]` : '';
      return `  - ${name}${required}${enumValues}: ${config.description}`;
    })
    .join('\n');
  return `${tool.name}: ${tool.description}\nParameters:\n${params}`;
}).join('\n\n')}

To use a tool, respond with a JSON object in this format:
{
  "tool": "tool_name",
  "parameters": {
    "param_name": "value"
  },
  "reasoning": "Brief explanation of why you're using this tool"
}

You can use multiple tools by providing an array of tool calls.`;
}
