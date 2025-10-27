'use client';

import type { Activity, TaskId } from '@teamflow/types';
import { useActivities } from '@/hooks/useActivities';
import { usePersonas } from '@/hooks/usePersonas';
import { formatRelativeTime } from '@teamflow/core';

interface ActivityFeedProps {
  taskId: TaskId;
}

export function ActivityFeed({ taskId }: ActivityFeedProps) {
  const { getByTask } = useActivities();
  const { personas } = usePersonas();

  const activities = getByTask(taskId);

  const getPersonaName = (personaId: string) => {
    const persona = personas.find((p) => p.id === personaId);
    return persona ? persona.name : 'Unknown';
  };

  const getActivityIcon = (type: Activity['type']): string => {
    switch (type) {
      case 'task_created':
        return '✨';
      case 'status_changed':
        return '🔄';
      case 'priority_changed':
        return '⚡';
      case 'assignee_changed':
        return '👤';
      case 'comment_added':
        return '💬';
      case 'attachment_added':
        return '📎';
      case 'tags_changed':
        return '🏷️';
      case 'due_date_changed':
        return '📅';
      case 'task_updated':
        return '✏️';
      case 'task_deleted':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getActivityDescription = (activity: Activity): string => {
    const actor = getPersonaName(activity.actor);

    switch (activity.type) {
      case 'task_created':
        return `${actor} created this task`;
      case 'status_changed':
        return `${actor} changed status from "${activity.changes?.oldValue}" to "${activity.changes?.newValue}"`;
      case 'priority_changed':
        return `${actor} changed priority from "${activity.changes?.oldValue}" to "${activity.changes?.newValue}"`;
      case 'assignee_changed':
        const oldAssignee = activity.changes?.oldValue
          ? getPersonaName(activity.changes.oldValue)
          : 'Unassigned';
        const newAssignee = activity.changes?.newValue
          ? getPersonaName(activity.changes.newValue)
          : 'Unassigned';
        return `${actor} changed assignee from ${oldAssignee} to ${newAssignee}`;
      case 'comment_added':
        const preview = activity.metadata?.preview || '';
        return `${actor} commented: "${preview}${preview.length >= 50 ? '...' : ''}"`;
      case 'attachment_added':
        const fileName = activity.metadata?.fileName || 'a file';
        return `${actor} attached ${fileName}`;
      case 'tags_changed':
        return `${actor} updated tags`;
      case 'due_date_changed':
        return `${actor} changed due date`;
      case 'task_updated':
        return `${actor} updated the task`;
      case 'task_deleted':
        return `${actor} deleted this task`;
      default:
        return `${actor} performed an action`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity</h3>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No activity yet</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 items-start py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span className="text-xl shrink-0">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{getActivityDescription(activity)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(new Date(activity.timestamp))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
