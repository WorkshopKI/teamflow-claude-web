'use client';

import { useEffect, useState } from 'react';
import { useDatabase } from '@/providers/DatabaseProvider';
import type { DatabaseCollection } from '@teamflow/database';

/**
 * Hook to subscribe to a database collection
 */
export function useCollection<T extends { id: string }>(
  collectionName: 'tasks' | 'projects' | 'personas' | 'teams' | 'workflows' | 'activities'
) {
  const { db, isLoading: dbLoading } = useDatabase();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    const collection = db[collectionName] as unknown as DatabaseCollection<T>;

    // Subscribe to changes
    const unsubscribe = collection.subscribe((updatedItems) => {
      setItems(updatedItems);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [db, collectionName, dbLoading]);

  const create = (item: T) => {
    if (!db) throw new Error('Database not initialized');
    return (db[collectionName] as unknown as DatabaseCollection<T>).create(item);
  };

  const update = (id: string, updates: Partial<T>) => {
    if (!db) throw new Error('Database not initialized');
    return (db[collectionName] as unknown as DatabaseCollection<T>).update(id, updates);
  };

  const remove = (id: string) => {
    if (!db) throw new Error('Database not initialized');
    return (db[collectionName] as unknown as DatabaseCollection<T>).delete(id);
  };

  const get = (id: string) => {
    if (!db) throw new Error('Database not initialized');
    return (db[collectionName] as unknown as DatabaseCollection<T>).get(id);
  };

  const query = (filter: (item: T) => boolean) => {
    if (!db) throw new Error('Database not initialized');
    return (db[collectionName] as unknown as DatabaseCollection<T>).query(filter);
  };

  return {
    items,
    isLoading,
    create,
    update,
    remove,
    get,
    query,
  };
}
