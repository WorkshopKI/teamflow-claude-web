'use client';

import { useState } from 'react';
import type { Plugin } from '@teamflow/types';

interface PluginSettingsModalProps {
  plugin: Plugin;
  onSave: (settings: Record<string, any>) => void;
  onClose: () => void;
}

export function PluginSettingsModal({
  plugin,
  onSave,
  onClose,
}: PluginSettingsModalProps) {
  const [values, setValues] = useState<Record<string, any>>(
    plugin.settings?.values || {}
  );

  if (!plugin.settings || !plugin.settings.fields || plugin.settings.fields.length === 0) {
    return null;
  }

  const handleChange = (key: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plugin.name} Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure plugin options and credentials
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {plugin.settings.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={values[field.key] || field.default || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    value={values[field.key] || field.default || ''}
                    onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                    required={field.required}
                    placeholder={field.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                )}

                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values[field.key] ?? field.default ?? false}
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {field.description}
                    </span>
                  </label>
                )}

                {field.type === 'select' && field.options && (
                  <select
                    value={values[field.key] || field.default || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select...</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'textarea' && (
                  <textarea
                    value={values[field.key] || field.default || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required}
                    placeholder={field.description}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                )}

                {field.description && field.type !== 'boolean' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
