/**
 * TeamFlow AI - Agent Executor
 *
 * Core system for executing AI agents on tasks
 */

import type { Task, AIPersona } from '@teamflow/types';
import { LLMClient, type LLMMessage, type LLMClientConfig } from './llm-client';
import { executeTool, getToolsPrompt, type ToolExecutionContext, type ToolResult } from './agent-tools';

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  reasoning?: string;
  toolsUsed: Array<{
    tool: string;
    parameters: Record<string, any>;
    result: ToolResult;
  }>;
  error?: string;
}

export interface AgentExecutionOptions {
  task: Task;
  agent: AIPersona;
  context: ToolExecutionContext;
  additionalInstructions?: string;
}

/**
 * Execute an AI agent on a task
 */
export async function executeAgent(
  options: AgentExecutionOptions
): Promise<AgentExecutionResult> {
  const { task, agent, context, additionalInstructions } = options;

  try {
    // Create LLM client
    const clientConfig: LLMClientConfig = {
      provider: agent.llmConfig.provider,
      model: agent.llmConfig.model,
      apiKey: agent.llmConfig.apiKey,
      baseURL: agent.llmConfig.apiEndpoint,
      temperature: agent.llmConfig.temperature,
      maxTokens: agent.llmConfig.maxTokens,
    };

    const client = new LLMClient(clientConfig);

    // Build context for the agent
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: buildSystemPrompt(agent, task, additionalInstructions),
      },
      {
        role: 'user',
        content: buildTaskPrompt(task),
      },
    ];

    // Call LLM
    const response = await client.chat(messages);

    // Parse response for tool calls
    const toolCalls = parseToolCalls(response.content);

    if (toolCalls.length === 0) {
      // Agent provided analysis/comment without tool use
      await context.createComment(task.id, response.content, agent.id);
      return {
        success: true,
        message: 'Agent provided analysis',
        toolsUsed: [],
      };
    }

    // Execute tools
    const toolResults: AgentExecutionResult['toolsUsed'] = [];
    for (const toolCall of toolCalls) {
      const result = await executeTool(toolCall.tool, toolCall.parameters, context);
      toolResults.push({
        tool: toolCall.tool,
        parameters: toolCall.parameters,
        result,
      });
    }

    // Check if all tools succeeded
    const allSucceeded = toolResults.every((r) => r.result.success);

    return {
      success: allSucceeded,
      message: allSucceeded ? 'Agent executed successfully' : 'Some tools failed',
      reasoning: toolCalls[0]?.reasoning,
      toolsUsed: toolResults,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Agent execution failed',
      toolsUsed: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildSystemPrompt(agent: AIPersona, _task: Task, additionalInstructions?: string): string {
  let prompt = agent.llmConfig.systemPrompt || `You are ${agent.name}, a ${agent.role}.`;

  prompt += `\n\nYour goals:\n${agent.goals.map((g) => `- ${g}`).join('\n')}`;

  if (agent.skills.length > 0) {
    prompt += `\n\nYour skills:\n${agent.skills.map((s) => `- ${s}`).join('\n')}`;
  }

  prompt += '\n\n' + getToolsPrompt();

  prompt += `\n\nIMPORTANT:
- Analyze the task carefully before taking action
- Use tools to make progress on the task
- Provide clear reasoning for your actions
- If you need more information, use request_clarification
- When the task is complete, use complete_task with a summary`;

  if (additionalInstructions) {
    prompt += `\n\nAdditional instructions: ${additionalInstructions}`;
  }

  return prompt;
}

function buildTaskPrompt(task: Task): string {
  let prompt = `Please work on this task:

**Title:** ${task.title}

**Description:** ${task.description || 'No description provided'}

**Current Status:** ${task.status}
**Priority:** ${task.priority}`;

  if (task.tags.length > 0) {
    prompt += `\n**Tags:** ${task.tags.join(', ')}`;
  }

  if (task.comments && task.comments.length > 0) {
    prompt += `\n\n**Recent Comments:**\n${task.comments
      .slice(-3)
      .map((c) => `- ${c.content}`)
      .join('\n')}`;
  }

  prompt += `\n\nPlease analyze this task and take appropriate action using the available tools.`;

  return prompt;
}

interface ParsedToolCall {
  tool: string;
  parameters: Record<string, any>;
  reasoning?: string;
}

function parseToolCalls(content: string): ParsedToolCall[] {
  const toolCalls: ParsedToolCall[] = [];

  try {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Handle single tool call
    if (parsed.tool && parsed.parameters) {
      toolCalls.push({
        tool: parsed.tool,
        parameters: parsed.parameters,
        reasoning: parsed.reasoning,
      });
    }

    // Handle array of tool calls
    if (Array.isArray(parsed)) {
      for (const call of parsed) {
        if (call.tool && call.parameters) {
          toolCalls.push({
            tool: call.tool,
            parameters: call.parameters,
            reasoning: call.reasoning,
          });
        }
      }
    }
  } catch (error) {
    // If parsing fails, return empty array
    console.error('Failed to parse tool calls:', error);
  }

  return toolCalls;
}
