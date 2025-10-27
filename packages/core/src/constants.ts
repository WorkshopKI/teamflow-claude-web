/**
 * Constants used throughout TeamFlow AI
 */

import type { TaskStatus, TaskPriority } from '@teamflow/types';

/**
 * Task status options
 */
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked', 'cancelled'];

/**
 * Task priority options
 */
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

/**
 * Default LLM configuration
 */
export const DEFAULT_LLM_CONFIG = {
  provider: 'openai' as const,
  model: 'gpt-4-turbo-preview',
  systemPrompt: 'You are a helpful AI assistant working as part of a team.',
  temperature: 0.7,
  maxTokens: 2000,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CURRENT_USER: 'teamflow:current_user',
  CURRENT_TEAM: 'teamflow:current_team',
  CRYPTO_IDENTITY: 'teamflow:crypto_identity',
  PREFERENCES: 'teamflow:preferences',
  THEME: 'teamflow:theme',
} as const;

/**
 * API endpoints (for optional cloud sync)
 */
export const API_ENDPOINTS = {
  SIGNALING_SERVER: process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'ws://localhost:3001',
  TURN_SERVER: process.env.NEXT_PUBLIC_TURN_SERVER,
} as const;

/**
 * Limits and quotas
 */
export const LIMITS = {
  MAX_TEAM_MEMBERS: 50,
  MAX_PROJECTS_PER_TEAM: 100,
  MAX_TASKS_PER_PROJECT: 1000,
  MAX_WORKFLOW_NODES: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_COMMENT_LENGTH: 5000,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_TASK_DESCRIPTION_LENGTH: 10000,
} as const;

/**
 * Timeouts and intervals
 */
export const TIMEOUTS = {
  SYNC_INTERVAL: 5000, // 5 seconds
  PEER_TIMEOUT: 30000, // 30 seconds
  WORKFLOW_EXECUTION_TIMEOUT: 300000, // 5 minutes
  DEBOUNCE_DELAY: 300, // 300ms
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  P2P_SYNC: true,
  AI_AGENTS: true,
  WORKFLOW_ENGINE: true,
  BROWSER_EXTENSION: false, // Coming soon
  MOBILE_APP: false, // Coming soon
  VOICE_INPUT: false, // Coming soon
} as const;
