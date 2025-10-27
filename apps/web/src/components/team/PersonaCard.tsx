'use client';

import type { Persona, AIPersona } from '@teamflow/types';
import { usePersonas } from '@/hooks/usePersonas';
import { useState } from 'react';

interface PersonaCardProps {
  persona: Persona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const { remove } = usePersonas();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    remove(persona.id);
  };

  const isAI = persona.type === 'ai';
  const aiPersona = isAI ? (persona as AIPersona) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {isAI ? '🤖' : persona.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold">{persona.name}</h3>
            <p className="text-sm text-muted-foreground">{persona.role}</p>
          </div>
        </div>

        {showDeleteConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:opacity-90"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 text-xs border border-border rounded hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Skills */}
      {persona.skills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Skills:</p>
          <div className="flex flex-wrap gap-1">
            {persona.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {persona.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
                +{persona.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI-specific info */}
      {isAI && aiPersona && (
        <div className="space-y-2 text-xs">
          {aiPersona.goals && aiPersona.goals.length > 0 && (
            <div>
              <p className="text-muted-foreground">Goals:</p>
              <p className="text-foreground line-clamp-2">{aiPersona.goals[0]}</p>
            </div>
          )}
          {aiPersona.llmConfig && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>🧠</span>
              <span>
                {aiPersona.llmConfig.provider} / {aiPersona.llmConfig.model}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Type badge */}
      <div className="mt-3 pt-3 border-t border-border">
        <span
          className={`px-2 py-1 text-xs rounded ${
            isAI ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {isAI ? 'AI Agent' : 'Human'}
        </span>
      </div>
    </div>
  );
}
