'use client';

import type { Plugin } from '@teamflow/types';

interface PluginCardProps {
  plugin: Plugin;
  onEnable: () => void;
  onDisable: () => void;
  onUninstall: () => void;
  onSettings: () => void;
}

export function PluginCard({
  plugin,
  onEnable,
  onDisable,
  onUninstall,
  onSettings,
}: PluginCardProps) {
  const nodeCount = plugin.nodes?.length || 0;
  const toolCount = plugin.tools?.length || 0;
  const hasSettings = !!plugin.settings;

  return (
    <div className={`p-6 rounded-lg border-2 transition-all ${
      plugin.enabled
        ? 'bg-white dark:bg-gray-800 border-green-500 shadow-lg'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {plugin.name}
            {plugin.enabled && (
              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Enabled
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            v{plugin.version} by {plugin.author}
          </p>
        </div>

        {/* Enable/Disable Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={plugin.enabled}
            onChange={(e) => {
              if (e.target.checked) {
                onEnable();
              } else {
                onDisable();
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
        {plugin.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        {nodeCount > 0 && (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <span>📦</span>
            <span>{nodeCount} node{nodeCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {toolCount > 0 && (
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <span>🔧</span>
            <span>{toolCount} tool{toolCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Nodes Preview */}
      {plugin.enabled && plugin.nodes && plugin.nodes.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Custom Nodes:
          </div>
          <div className="flex flex-wrap gap-1">
            {plugin.nodes.slice(0, 3).map(node => (
              <span
                key={node.type}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
              >
                {node.icon} {node.label}
              </span>
            ))}
            {plugin.nodes.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{plugin.nodes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {hasSettings && (
          <button
            onClick={onSettings}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            ⚙️ Settings
          </button>
        )}
        <button
          onClick={onUninstall}
          className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm font-medium"
        >
          🗑️ Uninstall
        </button>
      </div>
    </div>
  );
}
