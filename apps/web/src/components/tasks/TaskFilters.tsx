'use client';

import { useState } from 'react';
import type { TaskPriority, TaskStatus, PersonaId } from '@teamflow/types';
import { usePersonas } from '@/hooks/usePersonas';

export interface TaskFilterOptions {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: PersonaId | 'all' | 'unassigned';
  tags: string[];
}

interface TaskFiltersProps {
  filters: TaskFilterOptions;
  onFiltersChange: (filters: TaskFilterOptions) => void;
}

const STATUSES: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done', 'blocked', 'cancelled'];
const PRIORITIES: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high', 'urgent'];

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { personas } = usePersonas();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: TaskStatus | 'all') => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: TaskPriority | 'all') => {
    onFiltersChange({ ...filters, priority });
  };

  const handleAssigneeChange = (assignee: PersonaId | 'all' | 'unassigned') => {
    onFiltersChange({ ...filters, assignee });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all' ||
    filters.tags.length > 0;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      tags: [],
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-4 py-2 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 ${
            hasActiveFilters ? 'border-primary text-primary' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus | 'all')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | 'all')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Assignee</label>
            <select
              value={filters.assignee}
              onChange={(e) => handleAssigneeChange(e.target.value as PersonaId | 'all' | 'unassigned')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.type === 'ai' ? '🤖 ' : '👤 '}
                  {persona.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.search && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Search: &ldquo;{filters.search}&rdquo;
              <button
                onClick={() => handleSearchChange('')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Status: {filters.status.replace('_', ' ')}
              <button
                onClick={() => handleStatusChange('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.priority !== 'all' && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Priority: {filters.priority}
              <button
                onClick={() => handlePriorityChange('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.assignee !== 'all' && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
              Assignee: {filters.assignee === 'unassigned' ? 'Unassigned' : personas.find(p => p.id === filters.assignee)?.name}
              <button
                onClick={() => handleAssigneeChange('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
