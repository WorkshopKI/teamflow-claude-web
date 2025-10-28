'use client';

import { useState } from 'react';
import {
  EventType,
  EventTriggerConfig,
  EVENT_TYPE_LABELS,
  getEventTypesByCategory,
} from '@teamflow/workflow-engine/src/event-trigger';

interface EventTriggerConfigPanelProps {
  triggers: EventTriggerConfig[];
  onTriggersChange: (triggers: EventTriggerConfig[]) => void;
}

export function EventTriggerConfigPanel({
  triggers,
  onTriggersChange,
}: EventTriggerConfigPanelProps) {
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddTrigger = () => {
    setShowAddTrigger(true);
    setEditingIndex(null);
  };

  const handleEditTrigger = (index: number) => {
    setEditingIndex(index);
    setShowAddTrigger(true);
  };

  const handleDeleteTrigger = (index: number) => {
    const newTriggers = triggers.filter((_, i) => i !== index);
    onTriggersChange(newTriggers);
  };

  const handleSaveTrigger = (trigger: EventTriggerConfig) => {
    if (editingIndex !== null) {
      // Update existing trigger
      const newTriggers = [...triggers];
      newTriggers[editingIndex] = trigger;
      onTriggersChange(newTriggers);
    } else {
      // Add new trigger
      onTriggersChange([...triggers, trigger]);
    }
    setShowAddTrigger(false);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setShowAddTrigger(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Event Triggers
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Run this workflow when specific events occur
          </p>
        </div>
        {!showAddTrigger && (
          <button
            onClick={handleAddTrigger}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Trigger
          </button>
        )}
      </div>

      {triggers.length === 0 && !showAddTrigger && (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No event triggers configured
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add a trigger to run this workflow automatically when events occur
          </p>
        </div>
      )}

      {triggers.map((trigger, index) => (
        <TriggerCard
          key={index}
          trigger={trigger}
          onEdit={() => handleEditTrigger(index)}
          onDelete={() => handleDeleteTrigger(index)}
        />
      ))}

      {showAddTrigger && (
        <TriggerEditor
          trigger={editingIndex !== null ? triggers[editingIndex] : undefined}
          onSave={handleSaveTrigger}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function TriggerCard({
  trigger,
  onEdit,
  onDelete,
}: {
  trigger: EventTriggerConfig;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasFilters = Object.keys(trigger.filters || {}).length > 0;

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚡</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {EVENT_TYPE_LABELS[trigger.eventType]}
            </span>
            {trigger.enabled === false && (
              <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                Disabled
              </span>
            )}
          </div>

          {hasFilters && (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {trigger.filters?.status && (
                <div>Status: {trigger.filters.status.join(', ')}</div>
              )}
              {trigger.filters?.priority && (
                <div>Priority: {trigger.filters.priority.join(', ')}</div>
              )}
              {trigger.filters?.assignee && (
                <div>Assignee: {trigger.filters.assignee}</div>
              )}
              {trigger.filters?.project && (
                <div>Project: {trigger.filters.project}</div>
              )}
              {trigger.filters?.tags && trigger.filters.tags.length > 0 && (
                <div>Tags: {trigger.filters.tags.join(', ')}</div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Edit trigger"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Delete trigger"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function TriggerEditor({
  trigger,
  onSave,
  onCancel,
}: {
  trigger?: EventTriggerConfig;
  onSave: (trigger: EventTriggerConfig) => void;
  onCancel: () => void;
}) {
  const [eventType, setEventType] = useState<EventType>(trigger?.eventType || 'task.created');
  const [enabled, setEnabled] = useState(trigger?.enabled !== false);
  const [statusFilter, setStatusFilter] = useState<string[]>(trigger?.filters?.status || []);
  const [priorityFilter, setPriorityFilter] = useState<string[]>(trigger?.filters?.priority || []);
  const [assigneeFilter, _setAssigneeFilter] = useState<string[]>(trigger?.filters?.assignee || []);
  const [projectFilter, _setProjectFilter] = useState<string[]>(trigger?.filters?.project || []);
  const [tagsFilter, setTagsFilter] = useState<string[]>(trigger?.filters?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const eventsByCategory = getEventTypesByCategory();

  const handleSave = () => {
    const filters: EventTriggerConfig['filters'] = {};

    if (statusFilter.length > 0) filters.status = statusFilter;
    if (priorityFilter.length > 0) filters.priority = priorityFilter;
    if (assigneeFilter.length > 0) filters.assignee = assigneeFilter;
    if (projectFilter.length > 0) filters.project = projectFilter;
    if (tagsFilter.length > 0) filters.tags = tagsFilter;

    onSave({
      eventType,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      enabled,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tagsFilter.includes(tagInput.trim())) {
      setTagsFilter([...tagsFilter, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTagsFilter(tagsFilter.filter(t => t !== tag));
  };

  const toggleStatus = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: string) => {
    setPriorityFilter(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  return (
    <div className="p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">
        {trigger ? 'Edit Trigger' : 'Add New Trigger'}
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {Object.entries(eventsByCategory).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map(type => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enabled
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Filters (optional)
          </h5>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['todo', 'in-progress', 'blocked', 'done'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1 rounded text-sm ${
                      statusFilter.includes(status)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {['low', 'medium', 'high', 'urgent'].map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => togglePriority(priority)}
                    className={`px-3 py-1 rounded text-sm ${
                      priorityFilter.includes(priority)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {tagsFilter.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagsFilter.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Trigger
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
