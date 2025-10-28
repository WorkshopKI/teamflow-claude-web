/**
 * Workflow Templates
 *
 * Pre-built workflow templates for common automation scenarios
 */

import type { Workflow, WorkflowNode, WorkflowEdge } from '@teamflow/types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  nodes: Omit<WorkflowNode, 'id'>[];
  edges: Omit<WorkflowEdge, 'id' | 'source' | 'target'>[];
  // Node references by index for edges
  edgeConnections: Array<{
    sourceIndex: number;
    targetIndex: number;
    sourcePort?: string;
    targetPort?: string;
    label?: string;
  }>;
}

/**
 * Default workflow templates
 */
export const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'daily-standup',
    name: 'Daily Standup Reminder',
    description: 'Automatically create a daily standup task every morning',
    category: 'Team Collaboration',
    tags: ['agile', 'standup', 'daily'],
    icon: '📅',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Every Morning',
          triggerType: 'schedule',
          schedule: '9h', // Every 9am
          description: 'Trigger at 9 AM daily',
        },
      },
      {
        type: 'task',
        position: { x: 400, y: 100 },
        data: {
          label: 'Create Standup Task',
          taskTitle: 'Daily Standup - ${date}',
          taskDescription: 'Share updates:\n- What did you do yesterday?\n- What will you do today?\n- Any blockers?',
          priority: 'high',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
    ],
  },
  {
    id: 'bug-triage',
    name: 'Bug Triage Workflow',
    description: 'Automatically categorize and assign bugs based on priority',
    category: 'Software Development',
    tags: ['bug', 'triage', 'automation'],
    icon: '🐛',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Bug Created',
          triggerType: 'event',
          eventType: 'task.created',
          filters: { tags: ['bug'] },
        },
      },
      {
        type: 'condition',
        position: { x: 400, y: 100 },
        data: {
          label: 'Is Critical?',
          operator: 'equals',
          leftValue: '${task.priority}',
          rightValue: 'urgent',
        },
      },
      {
        type: 'ai-agent',
        position: { x: 700, y: 50 },
        data: {
          label: 'AI Triage (Critical)',
          instruction: 'Analyze this critical bug and add a comment with severity assessment and recommended assignee',
          outputVariable: 'triageResult',
        },
      },
      {
        type: 'task',
        position: { x: 700, y: 150 },
        data: {
          label: 'Add to Backlog',
          taskTitle: 'Review Bug: ${task.title}',
          taskDescription: 'Non-critical bug to review',
          priority: 'low',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2, sourcePort: 'true', label: 'Critical' },
      { sourceIndex: 1, targetIndex: 3, sourcePort: 'false', label: 'Normal' },
    ],
  },
  {
    id: 'content-review',
    name: 'Content Review Pipeline',
    description: 'Multi-stage content review with AI assistance',
    category: 'Content & Marketing',
    tags: ['content', 'review', 'marketing'],
    icon: '📝',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Content Ready',
          triggerType: 'event',
          eventType: 'task.status_changed',
          filters: { status: ['done'], tags: ['content'] },
        },
      },
      {
        type: 'ai-agent',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI Review',
          instruction: 'Review content for grammar, tone, and brand alignment. Provide constructive feedback.',
          outputVariable: 'aiReview',
        },
      },
      {
        type: 'condition',
        position: { x: 700, y: 150 },
        data: {
          label: 'Needs Revision?',
          operator: 'contains',
          leftValue: '${aiReview}',
          rightValue: 'revision',
        },
      },
      {
        type: 'task',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Request Revision',
          taskTitle: 'Revise: ${task.title}',
          taskDescription: 'AI feedback: ${aiReview}',
          priority: 'high',
        },
      },
      {
        type: 'task',
        position: { x: 1000, y: 200 },
        data: {
          label: 'Approve & Publish',
          taskTitle: 'Publish: ${task.title}',
          taskDescription: 'Content approved, ready to publish',
          priority: 'medium',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
      { sourceIndex: 2, targetIndex: 3, sourcePort: 'true', label: 'Needs Work' },
      { sourceIndex: 2, targetIndex: 4, sourcePort: 'false', label: 'Approved' },
    ],
  },
  {
    id: 'lead-nurture',
    name: 'Lead Nurturing Sequence',
    description: 'Automated follow-up sequence for new leads',
    category: 'Sales & Marketing',
    tags: ['sales', 'leads', 'automation'],
    icon: '🎯',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'New Lead',
          triggerType: 'event',
          eventType: 'task.created',
          filters: { tags: ['lead'] },
        },
      },
      {
        type: 'task',
        position: { x: 400, y: 150 },
        data: {
          label: 'Day 1: Welcome',
          taskTitle: 'Send welcome email to ${task.title}',
          taskDescription: 'Send personalized welcome email',
          priority: 'high',
        },
      },
      {
        type: 'delay',
        position: { x: 700, y: 150 },
        data: {
          label: 'Wait 3 Days',
          duration: 3,
          unit: 'd',
        },
      },
      {
        type: 'task',
        position: { x: 1000, y: 150 },
        data: {
          label: 'Day 3: Follow Up',
          taskTitle: 'Follow up with ${task.title}',
          taskDescription: 'Check if they have questions',
          priority: 'medium',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
      { sourceIndex: 2, targetIndex: 3 },
    ],
  },
  {
    id: 'code-review',
    name: 'Automated Code Review',
    description: 'AI-assisted code review workflow',
    category: 'Software Development',
    tags: ['code', 'review', 'development'],
    icon: '💻',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'PR Created',
          triggerType: 'webhook',
          description: 'Triggered by GitHub PR webhook',
        },
      },
      {
        type: 'ai-agent',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI Code Review',
          instruction: 'Review code changes for bugs, security issues, and best practices. Provide specific feedback.',
          outputVariable: 'reviewComments',
        },
      },
      {
        type: 'task',
        position: { x: 700, y: 150 },
        data: {
          label: 'Human Review',
          taskTitle: 'Review PR: ${prTitle}',
          taskDescription: 'AI review complete. Please review:\n${reviewComments}',
          priority: 'high',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
    ],
  },
  {
    id: 'weekly-report',
    name: 'Weekly Progress Report',
    description: 'Generate weekly progress report every Friday',
    category: 'Team Collaboration',
    tags: ['report', 'weekly', 'progress'],
    icon: '📊',
    nodes: [
      {
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: {
          label: 'Every Friday',
          triggerType: 'schedule',
          schedule: '1d', // Daily check, would filter for Friday in real implementation
          description: 'Trigger every Friday at 5 PM',
        },
      },
      {
        type: 'ai-agent',
        position: { x: 400, y: 150 },
        data: {
          label: 'Generate Report',
          instruction: 'Analyze completed tasks this week and create a summary report with key achievements and metrics',
          outputVariable: 'weeklyReport',
        },
      },
      {
        type: 'task',
        position: { x: 700, y: 150 },
        data: {
          label: 'Review & Share',
          taskTitle: 'Weekly Report - Week ${weekNumber}',
          taskDescription: '${weeklyReport}\n\nPlease review and share with the team',
          priority: 'medium',
        },
      },
    ],
    edgeConnections: [
      { sourceIndex: 0, targetIndex: 1 },
      { sourceIndex: 1, targetIndex: 2 },
    ],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(): Record<string, WorkflowTemplate[]> {
  const categorized: Record<string, WorkflowTemplate[]> = {};

  for (const template of DEFAULT_TEMPLATES) {
    if (!categorized[template.category]) {
      categorized[template.category] = [];
    }
    categorized[template.category].push(template);
  }

  return categorized;
}

/**
 * Search templates by tag or name
 */
export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase();

  return DEFAULT_TEMPLATES.filter(
    template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return DEFAULT_TEMPLATES.find(template => template.id === id);
}
