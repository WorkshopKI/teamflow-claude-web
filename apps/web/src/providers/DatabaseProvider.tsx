'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Database } from '@teamflow/database';
import { initDatabase } from '@teamflow/database';
import { ALL_DEFAULT_PERSONAS, shouldSeedDefaultPersonas } from '@/lib/defaultPersonas';
import { DEFAULT_PROJECT, shouldSeedDefaultProject } from '@/lib/defaultProjects';

interface DatabaseContextValue {
  db: Database | null;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isLoading: true,
  error: null,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let database: Database | null = null;

    async function init() {
      try {
        console.log('Initializing database...');
        database = await initDatabase('teamflow-db');

        // Seed default personas if this is a fresh database
        const existingPersonas = database.personas.getAll();
        if (shouldSeedDefaultPersonas(existingPersonas)) {
          console.log('Seeding default personas...');
          for (const persona of ALL_DEFAULT_PERSONAS) {
            database.personas.create(persona);
          }
          console.log(`Seeded ${ALL_DEFAULT_PERSONAS.length} default personas`);
        }

        // Seed default project if this is a fresh database
        const existingProjects = database.projects.getAll();
        if (shouldSeedDefaultProject(existingProjects)) {
          console.log('Seeding default project...');
          database.projects.create(DEFAULT_PROJECT);
          console.log('Seeded default "General" project');
        }

        if (mounted) {
          setDb(database);
          setIsLoading(false);
          console.log('Database ready');
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (mounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (database) {
        database.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Database Error</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
}
