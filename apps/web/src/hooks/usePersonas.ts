'use client';

import type { Persona, HumanPersona, AIPersona } from '@teamflow/types';
import { useCollection } from './useCollection';

/**
 * Hook for managing personas (humans and AI agents)
 */
export function usePersonas() {
  const collection = useCollection<Persona>('personas');

  const getHumans = () => {
    return collection.items.filter((p): p is HumanPersona => p.type === 'human');
  };

  const getAIAgents = () => {
    return collection.items.filter((p): p is AIPersona => p.type === 'ai');
  };

  const getByRole = (role: string) => {
    return collection.items.filter((p) => p.role.toLowerCase().includes(role.toLowerCase()));
  };

  return {
    ...collection,
    personas: collection.items,
    humans: getHumans(),
    aiAgents: getAIAgents(),
    getByRole,
  };
}
