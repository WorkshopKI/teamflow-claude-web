/**
 * TeamFlow AI - Core Type Definitions
 *
 * This package contains all shared TypeScript types used across the TeamFlow platform.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export type EntityId = string;
export type PersonaId = EntityId;
export type TaskId = EntityId;
export type ProjectId = EntityId;
export type WorkflowId = EntityId;
export type TeamId = EntityId;
export type NodeId = EntityId;

export type Timestamp = Date | string | number;

// ============================================================================
// Task Management
// ============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: PersonaId | null;
  project: ProjectId;
  tags: string[];
  dueDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: PersonaId;
  metadata: Record<string, any>;
  dependencies: TaskId[];
  subtasks: TaskId[];
  attachments: Attachment[];
  comments: Comment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Timestamp;
  uploadedBy: PersonaId;
}

export interface Comment {
  id: string;
  content: string;
  author: PersonaId;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  mentions: PersonaId[];
}

// ============================================================================
// Project Management
// ============================================================================

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Project {
  id: ProjectId;
  name: string;
  description: string;
  status: ProjectStatus;
  team: TeamId;
  tasks: TaskId[];
  workflows: WorkflowId[];
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: PersonaId;
  metadata: Record<string, any>;
}

// ============================================================================
// Persona System (Human & AI)
// ============================================================================

export type PersonaType = 'human' | 'ai';

export interface BasePersona {
  id: PersonaId;
  type: PersonaType;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  createdAt: Timestamp;
  metadata: Record<string, any>;
}

export interface HumanPersona extends BasePersona {
  type: 'human';
  email: string;
  publicKey: string;
  deviceIds: string[];
  preferences: UserPreferences;
}

export interface AIPersona extends BasePersona {
  type: 'ai';
  goals: string[];
  tools: string[];
  llmConfig: LLMConfiguration;
  constraints: string[];
  memory: {
    enabled: boolean;
    type: 'conversation' | 'vector' | 'hybrid';
    maxTokens?: number;
  };
}

export type Persona = HumanPersona | AIPersona;

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  uiDensity: 'comfortable' | 'compact';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'realtime' | 'digest' | 'off';
}

// ============================================================================
// LLM Configuration
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface LLMConfiguration {
  provider: LLMProvider;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  apiKey?: string;
  apiEndpoint?: string;
}

// ============================================================================
// Workflow System
// ============================================================================

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';
export type WorkflowTriggerType = 'manual' | 'schedule' | 'event' | 'webhook';

export interface Workflow {
  id: WorkflowId;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  triggers: WorkflowTrigger[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: PersonaId;
  tags: string[];
  executionCount: number;
  lastExecutedAt: Timestamp | null;
}

export interface WorkflowNode {
  id: NodeId;
  type: string;
  position: Position;
  data: Record<string, any>;
  inputs?: WorkflowNodePort[];
  outputs?: WorkflowNodePort[];
}

export interface WorkflowNodePort {
  id: string;
  name: string;
  type: string;
}

export interface WorkflowEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  sourcePort?: string;
  targetPort?: string;
  condition?: string;
  label?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: WorkflowTriggerType;
  config: Record<string, any>;
  enabled: boolean;
}

export interface Position {
  x: number;
  y: number;
}

// ============================================================================
// Workflow Execution
// ============================================================================

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflowId: WorkflowId;
  status: ExecutionStatus;
  triggeredBy: PersonaId | 'system';
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  duration: number | null;
  context: ExecutionContext;
  logs: ExecutionLog[];
  error?: ExecutionError;
}

export interface ExecutionContext {
  variables: Record<string, any>;
  nodeResults: Record<NodeId, any>;
  currentNodeId: NodeId | null;
}

export interface ExecutionLog {
  timestamp: Timestamp;
  level: 'debug' | 'info' | 'warn' | 'error';
  nodeId: NodeId | null;
  message: string;
  data?: any;
}

export interface ExecutionError {
  nodeId: NodeId;
  message: string;
  stack?: string;
  recoverable: boolean;
}

// ============================================================================
// Team & Collaboration
// ============================================================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Team {
  id: TeamId;
  name: string;
  description: string;
  template: string;
  members: TeamMember[];
  projects: ProjectId[];
  workflows: WorkflowId[];
  settings: TeamSettings;
  createdAt: Timestamp;
  inviteCode?: string;
  syncState: SyncState;
}

export interface TeamMember {
  personaId: PersonaId;
  role: TeamRole;
  joinedAt: Timestamp;
  invitedBy: PersonaId | null;
}

export interface TeamSettings {
  privacy: 'private' | 'public';
  allowInvites: boolean;
  requireApproval: boolean;
  defaultProjectVisibility: 'team' | 'project';
  workflowPermissions: WorkflowPermissions;
}

export interface WorkflowPermissions {
  create: TeamRole[];
  edit: TeamRole[];
  execute: TeamRole[];
  delete: TeamRole[];
}

// ============================================================================
// P2P & Synchronization
// ============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: Timestamp | null;
  connectedPeers: PeerInfo[];
  pendingChanges: number;
}

export interface PeerInfo {
  peerId: string;
  personaId: PersonaId;
  status: ConnectionStatus;
  latency: number | null;
  lastSeenAt: Timestamp;
}

export interface CryptoIdentity {
  publicKey: string;
  privateKey: string;
  deviceId: string;
  createdAt: Timestamp;
}

// ============================================================================
// Template System
// ============================================================================

export interface TeamTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  workflows: Workflow[];
  personas: AIPersona[];
  projects: Partial<Project>[];
  uiLayout: UIConfiguration;
  onboarding: OnboardingFlow;
}

export interface UIConfiguration {
  layout: 'kanban' | 'list' | 'calendar' | 'dashboard';
  sidebar: SidebarConfig;
  widgets: Widget[];
  theme: ThemeConfig;
}

export interface SidebarConfig {
  items: SidebarItem[];
  collapsed: boolean;
  position: 'left' | 'right';
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  font: string;
}

export interface OnboardingFlow {
  steps: OnboardingStep[];
  autoStart: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: OnboardingAction;
  completed: boolean;
}

export interface OnboardingAction {
  type: 'create_task' | 'invite_member' | 'assign_agent' | 'run_workflow' | 'custom';
  target?: string;
  config?: Record<string, any>;
}

// ============================================================================
// Agent Tools & Actions
// ============================================================================

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
  permissions: ToolPermissions;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
  schema?: any;
}

export interface ToolPermissions {
  roles: TeamRole[];
  scopes: string[];
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

// ============================================================================
// Events & Notifications
// ============================================================================

export type EventType =
  | 'task.created'
  | 'task.updated'
  | 'task.assigned'
  | 'task.completed'
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'team.member_joined'
  | 'team.member_left'
  | 'comment.created'
  | 'mention.created';

export interface Event {
  id: string;
  type: EventType;
  timestamp: Timestamp;
  actorId: PersonaId;
  resourceId: EntityId;
  resourceType: 'task' | 'project' | 'workflow' | 'team';
  data: Record<string, any>;
  recipients: PersonaId[];
}

export interface Notification {
  id: string;
  type: EventType;
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

// ============================================================================
// Plugin System
// ============================================================================

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  nodes?: CustomNodeDefinition[];
  tools?: Tool[];
  hooks?: PluginHooks;
  settings?: PluginSettings;
}

export interface CustomNodeDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  inputs: WorkflowNodePort[];
  outputs: WorkflowNodePort[];
  configuration: PluginSettings;
  execute: (context: NodeExecutionContext) => Promise<any>;
}

export interface NodeExecutionContext {
  nodeId: NodeId;
  inputs: Record<string, any>;
  config: Record<string, any>;
  variables: Record<string, any>;
}

export interface PluginHooks {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onTaskCreated?: (task: Task) => Promise<void>;
  onWorkflowExecute?: (workflow: Workflow) => Promise<void>;
}

export interface PluginSettings {
  fields: SettingsField[];
  values: Record<string, any>;
}

export interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  description?: string;
  required: boolean;
  default?: any;
  options?: { label: string; value: any }[];
}

// ============================================================================
// API & External Integration
// ============================================================================

export interface APIConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
  auth?: {
    type: 'basic' | 'bearer' | 'apikey';
    credentials: Record<string, string>;
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'SYNC_CONFLICT'
  | 'EXECUTION_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

export interface TeamFlowError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Timestamp;
  recoverable: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
