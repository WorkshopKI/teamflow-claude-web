/**
 * NodePropertiesPanel Component
 *
 * Panel for editing selected node properties
 */

'use client';

import { useState, useEffect } from 'react';
import type { WorkflowNode } from '@teamflow/types';
import { usePersonas } from '@/hooks/usePersonas';
import { useProjects } from '@/hooks/useProjects';

interface NodePropertiesPanelProps {
  node: WorkflowNode | null;
  onUpdate: (nodeId: string, data: Record<string, any>) => void;
  onDelete?: (nodeId: string) => void;
  onClose: () => void;
}

export function NodePropertiesPanel({ node, onUpdate, onDelete, onClose }: NodePropertiesPanelProps) {
  const { personas } = usePersonas();
  const { projects } = useProjects();
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Update form data when node changes
  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  if (!node) return null;

  /**
   * Handle form change
   */
  const handleChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete?.(node.id);
      onClose();
    }
  };

  /**
   * Render form fields based on node type
   */
  const renderFields = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <>
            <FormField
              label="Trigger Type"
              value={formData.triggerType || 'manual'}
              onChange={(value) => handleChange('triggerType', value)}
              type="select"
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'event', label: 'Event' },
                { value: 'webhook', label: 'Webhook' },
              ]}
            />
          </>
        );

      case 'condition':
        return (
          <>
            <FormField
              label="Operator"
              value={formData.operator || 'equals'}
              onChange={(value) => handleChange('operator', value)}
              type="select"
              options={[
                { value: 'equals', label: 'Equals' },
                { value: 'not_equals', label: 'Not Equals' },
                { value: 'greater_than', label: 'Greater Than' },
                { value: 'less_than', label: 'Less Than' },
                { value: 'contains', label: 'Contains' },
              ]}
            />
            <FormField
              label="Left Value"
              value={formData.leftValue || ''}
              onChange={(value) => handleChange('leftValue', value)}
              placeholder="${variableName} or value"
            />
            <FormField
              label="Right Value"
              value={formData.rightValue || ''}
              onChange={(value) => handleChange('rightValue', value)}
              placeholder="${variableName} or value"
            />
          </>
        );

      case 'ai-agent':
        return (
          <>
            <FormField
              label="AI Agent"
              value={formData.agentId || ''}
              onChange={(value) => handleChange('agentId', value)}
              type="select"
              options={[
                { value: '', label: 'Select an agent...' },
                ...personas
                  .filter((p) => p.type === 'ai')
                  .map((p) => ({ value: p.id, label: `${p.name} - ${p.role}` })),
              ]}
            />
            <FormField
              label="Instruction"
              value={formData.instruction || ''}
              onChange={(value) => handleChange('instruction', value)}
              type="textarea"
              placeholder="What should the agent do?"
            />
            <FormField
              label="Output Variable"
              value={formData.outputVariable || 'agentResult'}
              onChange={(value) => handleChange('outputVariable', value)}
              placeholder="Variable name to store result"
            />
          </>
        );

      case 'task':
        return (
          <>
            <FormField
              label="Task Title"
              value={formData.taskTitle || ''}
              onChange={(value) => handleChange('taskTitle', value)}
              placeholder="Enter task title..."
            />
            <FormField
              label="Task Description"
              value={formData.taskDescription || ''}
              onChange={(value) => handleChange('taskDescription', value)}
              type="textarea"
              placeholder="Enter task description..."
            />
            <FormField
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(value) => handleChange('priority', value)}
              type="select"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <FormField
              label="Assignee"
              value={formData.assigneeId || ''}
              onChange={(value) => handleChange('assigneeId', value)}
              type="select"
              options={[
                { value: '', label: 'Unassigned' },
                ...personas.map((p) => ({
                  value: p.id,
                  label: `${p.type === 'ai' ? '🤖' : '👤'} ${p.name}`,
                })),
              ]}
            />
            <FormField
              label="Project"
              value={formData.projectId || ''}
              onChange={(value) => handleChange('projectId', value)}
              type="select"
              options={[
                { value: '', label: 'Default Project' },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </>
        );

      case 'delay':
        return (
          <>
            <FormField
              label="Duration"
              value={formData.duration || 1}
              onChange={(value) => handleChange('duration', parseInt(value))}
              type="number"
            />
            <FormField
              label="Unit"
              value={formData.unit || 'seconds'}
              onChange={(value) => handleChange('unit', value)}
              type="select"
              options={[
                { value: 'seconds', label: 'Seconds' },
                { value: 'minutes', label: 'Minutes' },
                { value: 'hours', label: 'Hours' },
              ]}
            />
          </>
        );

      case 'webhook':
        return (
          <>
            <FormField
              label="URL"
              value={formData.url || ''}
              onChange={(value) => handleChange('url', value)}
              placeholder="https://example.com/webhook"
            />
            <FormField
              label="Method"
              value={formData.method || 'POST'}
              onChange={(value) => handleChange('method', value)}
              type="select"
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
              ]}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Node Properties</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Common Fields */}
      <FormField
        label="Label"
        value={formData.label || ''}
        onChange={(value) => handleChange('label', value)}
        placeholder="Node label"
      />
      <FormField
        label="Description"
        value={formData.description || ''}
        onChange={(value) => handleChange('description', value)}
        type="textarea"
        placeholder="Node description"
      />

      {/* Type-specific fields */}
      {renderFields()}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Delete Node
        </button>
      )}
    </div>
  );
}

/**
 * Form Field Component
 */
interface FormFieldProps {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

function FormField({ label, value, onChange, type = 'text', placeholder, options }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
