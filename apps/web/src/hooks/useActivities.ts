'use client';

import { useCollection } from './useCollection';
import type { Activity, ActivityType, PersonaId, TaskId } from '@teamflow/types';
import { nanoid } from 'nanoid';

export function useActivities() {
  const collection = useCollection<Activity>('activities');

  const getByTask = (taskId: TaskId) => {
    return collection.items
      .filter((activity) => activity.taskId === taskId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getByActor = (actorId: PersonaId) => {
    return collection.items
      .filter((activity) => activity.actor === actorId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const createActivity = (
    type: ActivityType,
    taskId: TaskId,
    actor: PersonaId,
    changes?: { field: string; oldValue: any; newValue: any },
    metadata?: Record<string, any>
  ) => {
    const activity: Activity = {
      id: nanoid(),
      type,
      taskId,
      actor,
      timestamp: new Date(),
      changes,
      metadata,
    };
    return collection.create(activity);
  };

  const getRecent = (limit: number = 50) => {
    return collection.items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  return {
    ...collection,
    activities: collection.items,
    getByTask,
    getByActor,
    createActivity,
    getRecent,
  };
}
