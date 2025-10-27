/**
 * TeamFlow AI - Database Package
 *
 * Local-first database layer with CRDT support using Yjs and IndexedDB.
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Task, Project, Persona, Team, Workflow } from '@teamflow/types';

/**
 * Database event listener
 */
export type DatabaseEventListener<T> = (items: T[]) => void;

/**
 * Database collection interface
 */
export interface DatabaseCollection<T extends { id: string }> {
  get(id: string): T | undefined;
  getAll(): T[];
  create(item: T): T;
  update(id: string, updates: Partial<T>): T;
  delete(id: string): void;
  query(filter: (item: T) => boolean): T[];
  subscribe(listener: DatabaseEventListener<T>): () => void;
}

/**
 * Database interface for TeamFlow entities
 */
export interface Database {
  tasks: DatabaseCollection<Task>;
  projects: DatabaseCollection<Project>;
  personas: DatabaseCollection<Persona>;
  teams: DatabaseCollection<Team>;
  workflows: DatabaseCollection<Workflow>;
  destroy(): void;
}

/**
 * Create a CRDT-backed database collection
 */
function createCollection<T extends { id: string }>(
  doc: Y.Doc,
  name: string
): DatabaseCollection<T> {
  const map = doc.getMap<T>(name);
  const listeners = new Set<DatabaseEventListener<T>>();

  // Notify all listeners when data changes
  const notifyListeners = () => {
    const items = Array.from(map.values());
    listeners.forEach((listener) => listener(items));
  };

  // Listen for changes
  map.observe(() => {
    notifyListeners();
  });

  return {
    get(id: string): T | undefined {
      return map.get(id);
    },

    getAll(): T[] {
      return Array.from(map.values());
    },

    create(item: T): T {
      if (map.has(item.id)) {
        throw new Error(`Item with id ${item.id} already exists`);
      }
      map.set(item.id, item);
      return item;
    },

    update(id: string, updates: Partial<T>): T {
      const existing = map.get(id);
      if (!existing) {
        throw new Error(`Item with id ${id} not found`);
      }
      const updated = { ...existing, ...updates, updatedAt: new Date() } as T;
      map.set(id, updated);
      return updated;
    },

    delete(id: string): void {
      if (!map.has(id)) {
        throw new Error(`Item with id ${id} not found`);
      }
      map.delete(id);
    },

    query(filter: (item: T) => boolean): T[] {
      return Array.from(map.values()).filter(filter);
    },

    subscribe(listener: DatabaseEventListener<T>): () => void {
      listeners.add(listener);
      // Immediately call with current data
      listener(Array.from(map.values()));
      // Return unsubscribe function
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Initialize the database with Yjs and IndexedDB persistence
 */
export async function initDatabase(dbName: string = 'teamflow-db'): Promise<Database> {
  // Create Yjs document
  const doc = new Y.Doc();

  // Set up IndexedDB persistence
  const persistence = new IndexeddbPersistence(dbName, doc);

  // Wait for initial sync from IndexedDB
  await new Promise<void>((resolve) => {
    persistence.on('synced', () => {
      resolve();
    });
  });

  console.log('Database initialized with Yjs and IndexedDB');

  return {
    tasks: createCollection<Task>(doc, 'tasks'),
    projects: createCollection<Project>(doc, 'projects'),
    personas: createCollection<Persona>(doc, 'personas'),
    teams: createCollection<Team>(doc, 'teams'),
    workflows: createCollection<Workflow>(doc, 'workflows'),

    destroy() {
      persistence.destroy();
      doc.destroy();
    },
  };
}

export default initDatabase;
