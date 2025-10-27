/**
 * Factory functions for creating TeamFlow entities with sensible defaults
 */

import { nanoid } from 'nanoid';
import type {
  Task,
  Project,
  HumanPersona,
  AIPersona,
  Team,
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  TaskStatus,
  TaskPriority,
} from '@teamflow/types';

/**
 * Creates a new task with default values
 */
export function createTask(
  partial: Partial<Task> & Pick<Task, 'title' | 'project' | 'createdBy'>
): Task {
  const now = new Date();
  return {
    id: nanoid(),
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: null,
    tags: [],
    dueDate: null,
    createdAt: now,
    updatedAt: now,
    metadata: {},
    dependencies: [],
    subtasks: [],
    attachments: [],
    comments: [],
    ...partial,
  };
}

/**
 * Creates a new project with default values
 */
export function createProject(
  partial: Partial<Project> & Pick<Project, 'name' | 'team' | 'createdBy'>
): Project {
  const now = new Date();
  return {
    id: nanoid(),
    description: '',
    status: 'active',
    tasks: [],
    workflows: [],
    startDate: null,
    endDate: null,
    createdAt: now,
    updatedAt: now,
    metadata: {},
    ...partial,
  };
}

/**
 * Creates a new human persona
 */
export function createHumanPersona(
  partial: Partial<HumanPersona> & Pick<HumanPersona, 'name' | 'email' | 'publicKey'>
): HumanPersona {
  return {
    id: nanoid(),
    type: 'human',
    role: 'Team Member',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partial.name}`,
    skills: [],
    createdAt: new Date(),
    metadata: {},
    deviceIds: [],
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        inApp: true,
        frequency: 'realtime',
      },
      uiDensity: 'comfortable',
    },
    ...partial,
  };
}

/**
 * Creates a new AI persona
 */
export function createAIPersona(
  partial: Partial<AIPersona> & Pick<AIPersona, 'name' | 'role' | 'llmConfig'>
): AIPersona {
  return {
    id: nanoid(),
    type: 'ai',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${partial.name}`,
    skills: [],
    goals: [],
    tools: [],
    constraints: [],
    memory: {
      enabled: true,
      type: 'conversation',
    },
    createdAt: new Date(),
    metadata: {},
    ...partial,
  };
}

/**
 * Creates a new team with default values
 */
export function createTeam(partial: Partial<Team> & Pick<Team, 'name'>): Team {
  return {
    id: nanoid(),
    description: '',
    template: 'default',
    members: [],
    projects: [],
    workflows: [],
    settings: {
      privacy: 'private',
      allowInvites: true,
      requireApproval: false,
      defaultProjectVisibility: 'team',
      workflowPermissions: {
        create: ['owner', 'admin', 'member'],
        edit: ['owner', 'admin', 'member'],
        execute: ['owner', 'admin', 'member'],
        delete: ['owner', 'admin'],
      },
    },
    createdAt: new Date(),
    inviteCode: nanoid(10),
    syncState: {
      status: 'offline',
      lastSyncedAt: null,
      connectedPeers: [],
      pendingChanges: 0,
    },
    ...partial,
  };
}

/**
 * Creates a new workflow with default values
 */
export function createWorkflow(
  partial: Partial<Workflow> & Pick<Workflow, 'name' | 'createdBy'>
): Workflow {
  const now = new Date();
  return {
    id: nanoid(),
    description: '',
    version: '1.0.0',
    status: 'draft',
    nodes: [],
    edges: [],
    variables: {},
    triggers: [],
    createdAt: now,
    updatedAt: now,
    tags: [],
    executionCount: 0,
    lastExecutedAt: null,
    ...partial,
  };
}

/**
 * Creates a new workflow node
 */
export function createWorkflowNode(
  partial: Partial<WorkflowNode> & Pick<WorkflowNode, 'type'> & { position: { x: number; y: number } }
): WorkflowNode {
  const nodeConfig = getNodeTypeConfig(partial.type as any);

  return {
    id: nanoid(),
    type: partial.type,
    position: partial.position || { x: 0, y: 0 },
    data: {
      label: partial.data?.label || nodeConfig.defaultLabel,
      ...nodeConfig.defaultData,
      ...partial.data,
    },
    inputs: nodeConfig.inputs,
    outputs: nodeConfig.outputs,
  };
}

interface NodeTypeConfig {
  defaultLabel: string;
  defaultData: Record<string, any>;
  inputs: Array<{ id: string; name: string; type: string }>;
  outputs: Array<{ id: string; name: string; type: string }>;
}

function getNodeTypeConfig(type: string): NodeTypeConfig {
  const configs: Record<string, NodeTypeConfig> = {
    trigger: {
      defaultLabel: 'Trigger',
      defaultData: {
        triggerType: 'manual',
        description: 'Start workflow manually',
      },
      inputs: [],
      outputs: [{ id: 'output', name: 'Flow', type: 'flow' }],
    },
    action: {
      defaultLabel: 'Action',
      defaultData: {
        actionType: 'custom',
        description: 'Perform an action',
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [{ id: 'output', name: 'Flow', type: 'flow' }],
    },
    condition: {
      defaultLabel: 'Condition',
      defaultData: {
        operator: 'equals',
        leftValue: '',
        rightValue: '',
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [
        { id: 'true', name: 'True', type: 'flow' },
        { id: 'false', name: 'False', type: 'flow' },
      ],
    },
    'ai-agent': {
      defaultLabel: 'AI Agent',
      defaultData: {
        agentId: '',
        instruction: 'Execute task with AI agent',
        outputVariable: 'agentResult',
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [
        { id: 'success', name: 'Success', type: 'flow' },
        { id: 'error', name: 'Error', type: 'flow' },
      ],
    },
    task: {
      defaultLabel: 'Create Task',
      defaultData: {
        taskTitle: '',
        taskDescription: '',
        priority: 'medium',
        assigneeId: '',
        projectId: '',
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [{ id: 'output', name: 'Flow', type: 'flow' }],
    },
    delay: {
      defaultLabel: 'Delay',
      defaultData: {
        duration: 1000,
        unit: 'seconds',
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [{ id: 'output', name: 'Flow', type: 'flow' }],
    },
    webhook: {
      defaultLabel: 'Webhook',
      defaultData: {
        url: '',
        method: 'POST',
        headers: {},
        body: {},
      },
      inputs: [{ id: 'input', name: 'Flow', type: 'flow' }],
      outputs: [
        { id: 'success', name: 'Success', type: 'flow' },
        { id: 'error', name: 'Error', type: 'flow' },
      ],
    },
  };

  return configs[type] || configs.action;
}

/**
 * Creates a new workflow edge
 */
export function createWorkflowEdge(
  partial: Partial<WorkflowEdge> & Pick<WorkflowEdge, 'source' | 'target'>
): WorkflowEdge {
  return {
    id: nanoid(),
    ...partial,
  };
}

// ============================================================================
// Workflow Node Types & Utilities
// ============================================================================

export type NodeType = 'trigger' | 'action' | 'condition' | 'ai-agent' | 'task' | 'delay' | 'webhook';

export function getNodeTypes(): Array<{ type: NodeType; label: string; icon: string; category: string }> {
  return [
    { type: 'trigger', label: 'Trigger', icon: '⚡', category: 'Flow' },
    { type: 'action', label: 'Action', icon: '⚙️', category: 'Flow' },
    { type: 'condition', label: 'Condition', icon: '❓', category: 'Flow' },
    { type: 'ai-agent', label: 'AI Agent', icon: '🤖', category: 'AI' },
    { type: 'task', label: 'Create Task', icon: '📋', category: 'Tasks' },
    { type: 'delay', label: 'Delay', icon: '⏱️', category: 'Utility' },
    { type: 'webhook', label: 'Webhook', icon: '🔗', category: 'Integration' },
  ];
}

export function getNodeTypeByType(type: NodeType): { type: NodeType; label: string; icon: string; category: string } | undefined {
  return getNodeTypes().find(nt => nt.type === type);
}

// ============================================================================
// Workflow Execution
// ============================================================================

import type { WorkflowExecution, PersonaId, WorkflowId } from '@teamflow/types';

export interface CreateExecutionInput {
  workflowId: WorkflowId;
  triggeredBy: PersonaId | 'system';
  context?: {
    variables?: Record<string, any>;
    nodeResults?: Record<string, any>;
    currentNodeId?: string | null;
  };
}

export function createWorkflowExecution(input: CreateExecutionInput): WorkflowExecution {
  const now = new Date();

  return {
    id: nanoid(),
    workflowId: input.workflowId,
    status: 'pending',
    triggeredBy: input.triggeredBy,
    startedAt: now,
    completedAt: null,
    duration: null,
    context: {
      variables: input.context?.variables || {},
      nodeResults: input.context?.nodeResults || {},
      currentNodeId: input.context?.currentNodeId || null,
    },
    logs: [],
  };
}
