/**
 * Workflow Scheduler
 *
 * Manages scheduled workflow execution using cron-like patterns
 */

import type { Workflow, WorkflowId, PersonaId } from '@teamflow/types';

export interface ScheduleConfig {
  enabled: boolean;
  pattern: string; // Cron pattern or simple interval
  timezone?: string;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ScheduledWorkflow {
  workflow: Workflow;
  schedule: ScheduleConfig;
}

export class WorkflowScheduler {
  private schedules: Map<WorkflowId, ScheduleConfig> = new Map();
  private intervals: Map<WorkflowId, NodeJS.Timeout> = new Map();
  private onExecute?: (workflowId: WorkflowId, triggeredBy: PersonaId | 'system') => Promise<void>;

  constructor(onExecute?: (workflowId: WorkflowId, triggeredBy: PersonaId | 'system') => Promise<void>) {
    this.onExecute = onExecute;
  }

  /**
   * Schedule a workflow
   */
  schedule(workflowId: WorkflowId, config: ScheduleConfig): void {
    // Remove existing schedule if any
    this.unschedule(workflowId);

    if (!config.enabled) return;

    // Store schedule config
    this.schedules.set(workflowId, config);

    // Parse pattern and create interval
    const intervalMs = this.parsePattern(config.pattern);

    if (intervalMs > 0) {
      const interval = setInterval(() => {
        this.executeScheduled(workflowId);
      }, intervalMs);

      this.intervals.set(workflowId, interval);

      // Calculate next run
      config.nextRun = new Date(Date.now() + intervalMs);
    }
  }

  /**
   * Unschedule a workflow
   */
  unschedule(workflowId: WorkflowId): void {
    const interval = this.intervals.get(workflowId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(workflowId);
    }
    this.schedules.delete(workflowId);
  }

  /**
   * Execute a scheduled workflow
   */
  private async executeScheduled(workflowId: WorkflowId): Promise<void> {
    const config = this.schedules.get(workflowId);
    if (!config || !config.enabled) return;

    // Update last run
    config.lastRun = new Date();

    // Calculate next run
    const intervalMs = this.parsePattern(config.pattern);
    config.nextRun = new Date(Date.now() + intervalMs);

    // Execute workflow
    if (this.onExecute) {
      await this.onExecute(workflowId, 'system');
    }
  }

  /**
   * Parse schedule pattern
   * Supports simple intervals like "1m", "5m", "1h", "1d"
   * Future: Support full cron syntax
   */
  private parsePattern(pattern: string): number {
    const match = pattern.match(/^(\d+)(m|h|d)$/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60 * 1000; // minutes
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      default: return 0;
    }
  }

  /**
   * Get schedule for a workflow
   */
  getSchedule(workflowId: WorkflowId): ScheduleConfig | undefined {
    return this.schedules.get(workflowId);
  }

  /**
   * Get all scheduled workflows
   */
  getAllSchedules(): Map<WorkflowId, ScheduleConfig> {
    return new Map(this.schedules);
  }

  /**
   * Stop all schedules
   */
  stopAll(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.schedules.clear();
  }
}

/**
 * Format next run time for display
 */
export function formatNextRun(nextRun: Date | undefined): string {
  if (!nextRun) return 'Not scheduled';

  const now = Date.now();
  const diff = nextRun.getTime() - now;

  if (diff < 0) return 'Overdue';

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'in less than a minute';
}

/**
 * Validate schedule pattern
 */
export function isValidPattern(pattern: string): boolean {
  return /^(\d+)(m|h|d)$/.test(pattern);
}
