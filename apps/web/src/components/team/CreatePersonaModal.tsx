'use client';

import { useState } from 'react';
import { createHumanPersona, createAIPersona } from '@teamflow/core';
import { usePersonas } from '@/hooks/usePersonas';
import type { LLMProvider } from '@teamflow/types';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PersonaType = 'human' | 'ai';

export function CreatePersonaModal({ isOpen, onClose }: CreatePersonaModalProps) {
  const { create } = usePersonas();
  const [personaType, setPersonaType] = useState<PersonaType>('human');

  // Human form state
  const [humanForm, setHumanForm] = useState({
    name: '',
    email: '',
    role: '',
    skills: '',
  });

  // AI form state
  const [aiForm, setAIForm] = useState({
    name: '',
    role: '',
    skills: '',
    goals: '',
    provider: 'openai' as LLMProvider,
    model: 'gpt-4-turbo-preview',
    systemPrompt: 'You are a helpful AI assistant.',
  });

  if (!isOpen) return null;

  const handleCreateHuman = () => {
    if (!humanForm.name || !humanForm.email) {
      alert('Please fill in name and email');
      return;
    }

    const persona = createHumanPersona({
      name: humanForm.name,
      email: humanForm.email,
      role: humanForm.role || 'Team Member',
      skills: humanForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      publicKey: `key_${Date.now()}`, // TODO: Generate real key
    });

    create(persona);
    resetForm();
    onClose();
  };

  const handleCreateAI = () => {
    if (!aiForm.name || !aiForm.role) {
      alert('Please fill in name and role');
      return;
    }

    const persona = createAIPersona({
      name: aiForm.name,
      role: aiForm.role,
      skills: aiForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      goals: aiForm.goals.split('\n').filter(Boolean),
      llmConfig: {
        provider: aiForm.provider,
        model: aiForm.model,
        systemPrompt: aiForm.systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      },
    });

    create(persona);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setHumanForm({ name: '', email: '', role: '', skills: '' });
    setAIForm({
      name: '',
      role: '',
      skills: '',
      goals: '',
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      systemPrompt: 'You are a helpful AI assistant.',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border p-6">
          <h2 className="text-2xl font-bold">Add Team Member</h2>
          <p className="text-muted-foreground mt-1">Create a human team member or AI agent</p>
        </div>

        {/* Type Tabs */}
        <div className="border-b border-border px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setPersonaType('human')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                personaType === 'human'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              👤 Human
            </button>
            <button
              onClick={() => setPersonaType('ai')}
              className={`py-3 px-4 border-b-2 font-medium transition-colors ${
                personaType === 'ai'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              🤖 AI Agent
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {personaType === 'human' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={humanForm.name}
                  onChange={(e) => setHumanForm({ ...humanForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={humanForm.email}
                  onChange={(e) => setHumanForm({ ...humanForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={humanForm.role}
                  onChange={(e) => setHumanForm({ ...humanForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={humanForm.skills}
                  onChange={(e) => setHumanForm({ ...humanForm, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="TypeScript, React, Node.js"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent Name *</label>
                <input
                  type="text"
                  value={aiForm.name}
                  onChange={(e) => setAIForm({ ...aiForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Code Reviewer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <input
                  type="text"
                  value={aiForm.role}
                  onChange={(e) => setAIForm({ ...aiForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={aiForm.skills}
                  onChange={(e) => setAIForm({ ...aiForm, skills: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="code review, static analysis, best practices"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Goals (one per line)</label>
                <textarea
                  value={aiForm.goals}
                  onChange={(e) => setAIForm({ ...aiForm, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  placeholder="Review code for quality&#10;Suggest improvements&#10;Identify potential bugs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">LLM Provider</label>
                  <select
                    value={aiForm.provider}
                    onChange={(e) => setAIForm({ ...aiForm, provider: e.target.value as LLMProvider })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Model</label>
                  <input
                    type="text"
                    value={aiForm.model}
                    onChange={(e) => setAIForm({ ...aiForm, model: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">System Prompt</label>
                <textarea
                  value={aiForm.systemPrompt}
                  onChange={(e) => setAIForm({ ...aiForm, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={personaType === 'human' ? handleCreateHuman : handleCreateAI}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Create {personaType === 'human' ? 'Member' : 'Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}
