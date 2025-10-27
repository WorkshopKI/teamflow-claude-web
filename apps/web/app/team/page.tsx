'use client';

import { useState } from 'react';
import { usePersonas } from '@/hooks/usePersonas';
import { PersonaCard } from '@/components/team/PersonaCard';
import { CreatePersonaModal } from '@/components/team/CreatePersonaModal';

export default function TeamPage() {
  const { personas, humans, aiAgents, isLoading } = usePersonas();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Team</h1>
              <p className="text-muted-foreground mt-1">
                {personas.length} total members ({humans.length} humans, {aiAgents.length} AI
                agents)
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              + Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {personas.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-semibold mb-2">Build Your Team</h2>
              <p className="text-muted-foreground mb-6">
                Add team members and AI agents to collaborate on tasks. AI agents can
                automatically handle assigned work.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Add Your First Member
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Human Team Members */}
            {humans.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>👤</span>
                  <span>Team Members</span>
                  <span className="text-sm text-muted-foreground">({humans.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {humans.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                  ))}
                </div>
              </div>
            )}

            {/* AI Agents */}
            {aiAgents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Agents</span>
                  <span className="text-sm text-muted-foreground">({aiAgents.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiAgents.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreatePersonaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
