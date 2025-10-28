'use client';

import { useState, useEffect } from 'react';
import { discoverPlugins } from '@teamflow/plugins';
import type { PluginMetadata } from '@teamflow/plugins';

interface PluginDiscoveryModalProps {
  installedPluginIds: string[];
  onInstall: (pluginId: string) => void;
  onClose: () => void;
}

export function PluginDiscoveryModal({
  installedPluginIds,
  onInstall,
  onClose,
}: PluginDiscoveryModalProps) {
  const [plugins, setPlugins] = useState<PluginMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    const availablePlugins = discoverPlugins();
    setPlugins(availablePlugins);
  }, []);

  const filteredPlugins = plugins.filter(plugin => {
    const query = searchQuery.toLowerCase();
    return (
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query) ||
      plugin.author.toLowerCase().includes(query)
    );
  });

  const handleInstall = async (pluginId: string) => {
    setInstalling(pluginId);
    try {
      await onInstall(pluginId);
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Discover Plugins
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPlugins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No plugins found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlugins.map(plugin => {
                const isInstalled = installedPluginIds.includes(plugin.id);
                const isInstalling = installing === plugin.id;

                return (
                  <div
                    key={plugin.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plugin.name}
                          </h3>
                          {isInstalled && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              Installed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {plugin.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>v{plugin.version}</span>
                          <span>by {plugin.author}</span>
                          {plugin.nodeCount > 0 && (
                            <span className="flex items-center gap-1">
                              <span>📦</span>
                              {plugin.nodeCount} node{plugin.nodeCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {plugin.toolCount > 0 && (
                            <span className="flex items-center gap-1">
                              <span>🔧</span>
                              {plugin.toolCount} tool{plugin.toolCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {isInstalled ? (
                          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium">
                            ✓ Installed
                          </div>
                        ) : (
                          <button
                            onClick={() => handleInstall(plugin.id)}
                            disabled={isInstalling}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isInstalling ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Installing...
                              </>
                            ) : (
                              <>
                                + Install
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} available
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
