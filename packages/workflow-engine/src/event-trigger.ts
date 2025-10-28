/**
 * Event Trigger System
 *
 * Triggers workflows based on events from tasks, projects, and other entities
 */

import type { WorkflowId, Task, Project, PersonaId } from '@teamflow/types';

export type EventType =
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.assigned'
  | 'task.status_changed'
  | 'task.priority_changed'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'project.task_added';

export interface EventTriggerConfig {
  enabled: boolean;
  eventType: EventType;
  filters?: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    project?: string[];
    tags?: string[];
  };
}

export interface WorkflowEvent {
  type: EventType;
  timestamp: Date;
  data: any;
  entity: Task | Project | any;
}

export class EventTriggerManager {
  private triggers: Map<WorkflowId, EventTriggerConfig[]> = new Map();
  private onExecute?: (workflowId: WorkflowId, triggeredBy: PersonaId | 'system', context?: any) => Promise<void>;

  constructor(onExecute?: (workflowId: WorkflowId, triggeredBy: PersonaId | 'system', context?: any) => Promise<void>) {
    this.onExecute = onExecute;
  }

  /**
   * Register event triggers for a workflow
   */
  registerTriggers(workflowId: WorkflowId, triggers: EventTriggerConfig[]): void {
    this.triggers.set(workflowId, triggers.filter(t => t.enabled));
  }

  /**
   * Unregister all triggers for a workflow
   */
  unregisterTriggers(workflowId: WorkflowId): void {
    this.triggers.delete(workflowId);
  }

  /**
   * Handle an event and trigger matching workflows
   */
  async handleEvent(event: WorkflowEvent): Promise<void> {
    // Find workflows that should be triggered by this event
    const matchingWorkflows: Array<{ workflowId: WorkflowId; triggeredBy: PersonaId | 'system' }> = [];

    for (const [workflowId, triggers] of this.triggers.entries()) {
      for (const trigger of triggers) {
        if (this.matchesEvent(event, trigger)) {
          // Determine who triggered the workflow
          const triggeredBy = this.extractTriggeredBy(event);
          matchingWorkflows.push({ workflowId, triggeredBy });
          break; // Only trigger once per workflow
        }
      }
    }

    // Execute matching workflows
    if (this.onExecute) {
      for (const { workflowId, triggeredBy } of matchingWorkflows) {
        await this.onExecute(workflowId, triggeredBy, { event });
      }
    }
  }

  /**
   * Check if an event matches a trigger configuration
   */
  private matchesEvent(event: WorkflowEvent, trigger: EventTriggerConfig): boolean {
    // Check event type
    if (event.type !== trigger.eventType) return false;

    // Check filters if any
    if (!trigger.filters) return true;

    const entity = event.entity;
    const filters = trigger.filters;

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!entity.status || !filters.status.includes(entity.status)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!entity.priority || !filters.priority.includes(entity.priority)) {
        return false;
      }
    }

    // Assignee filter
    if (filters.assignee && filters.assignee.length > 0) {
      if (!entity.assignee || !filters.assignee.includes(entity.assignee)) {
        return false;
      }
    }

    // Project filter
    if (filters.project && filters.project.length > 0) {
      if (!entity.project || !filters.project.includes(entity.project)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!entity.tags || !filters.tags.some(tag => entity.tags.includes(tag))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract who triggered the event
   */
  private extractTriggeredBy(event: WorkflowEvent): PersonaId | 'system' {
    // Try to get from event data
    if (event.data?.triggeredBy) {
      return event.data.triggeredBy;
    }

    // Try to get from entity
    if (event.entity?.createdBy) {
      return event.entity.createdBy;
    }

    return 'system';
  }

  /**
   * Get triggers for a workflow
   */
  getTriggers(workflowId: WorkflowId): EventTriggerConfig[] {
    return this.triggers.get(workflowId) || [];
  }

  /**
   * Get all workflows listening to an event type
   */
  getWorkflowsForEventType(eventType: EventType): WorkflowId[] {
    const workflows: WorkflowId[] = [];

    for (const [workflowId, triggers] of this.triggers.entries()) {
      if (triggers.some(t => t.eventType === eventType)) {
        workflows.push(workflowId);
      }
    }

    return workflows;
  }

  /**
   * Clear all triggers
   */
  clearAll(): void {
    this.triggers.clear();
  }
}

/**
 * Event type display names
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'task.created': 'Task Created',
  'task.updated': 'Task Updated',
  'task.completed': 'Task Completed',
  'task.assigned': 'Task Assigned',
  'task.status_changed': 'Task Status Changed',
  'task.priority_changed': 'Task Priority Changed',
  'project.created': 'Project Created',
  'project.updated': 'Project Updated',
  'project.completed': 'Project Completed',
  'project.task_added': 'Task Added to Project',
};

/**
 * Get available event types by category
 */
export function getEventTypesByCategory(): Record<string, EventType[]> {
  return {
    'Task Events': [
      'task.created',
      'task.updated',
      'task.completed',
      'task.assigned',
      'task.status_changed',
      'task.priority_changed',
    ],
    'Project Events': [
      'project.created',
      'project.updated',
      'project.completed',
      'project.task_added',
    ],
  };
}
