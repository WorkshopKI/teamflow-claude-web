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
  partial: Partial<WorkflowNode> & Pick<WorkflowNode, 'type'>
): WorkflowNode {
  return {
    id: nanoid(),
    position: { x: 0, y: 0 },
    data: {},
    ...partial,
  };
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
