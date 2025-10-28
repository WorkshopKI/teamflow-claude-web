'use client';

import { useState, useEffect } from 'react';
import { getPluginManager, getPluginRegistry, discoverPlugins, installPluginFromRegistry } from '@teamflow/plugins';
import type { Plugin } from '@teamflow/types';
import type { PluginMetadata } from '@teamflow/plugins';
import { PluginCard } from '@/components/plugins/PluginCard';
import { PluginDiscoveryModal } from '@/components/plugins/PluginDiscoveryModal';
import { PluginSettingsModal } from '@/components/plugins/PluginSettingsModal';

export default function PluginsPage() {
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize plugin manager and load plugins
  useEffect(() => {
    const initialize = async () => {
      try {
        const manager = getPluginManager();
        await manager.initialize();
        setInstalledPlugins(manager.getPlugins());
      } catch (error) {
        console.error('Failed to initialize plugin manager:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleInstallPlugin = async (pluginId: string) => {
    try {
      const manager = getPluginManager();
      await installPluginFromRegistry(pluginId, manager);
      setInstalledPlugins(manager.getPlugins());
      setShowDiscovery(false);
    } catch (error) {
      alert(`Failed to install plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEnablePlugin = async (pluginId: string) => {
    try {
      const manager = getPluginManager();
      await manager.enable(pluginId);
      setInstalledPlugins(manager.getPlugins());
    } catch (error) {
      alert(`Failed to enable plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    try {
      const manager = getPluginManager();
      await manager.disable(pluginId);
      setInstalledPlugins(manager.getPlugins());
    } catch (error) {
      alert(`Failed to disable plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) {
      return;
    }

    try {
      const manager = getPluginManager();
      await manager.unregister(pluginId);
      setInstalledPlugins(manager.getPlugins());
    } catch (error) {
      alert(`Failed to uninstall plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleOpenSettings = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setShowSettings(true);
  };

  const handleSaveSettings = async (pluginId: string, settings: Record<string, any>) => {
    try {
      const manager = getPluginManager();
      await manager.updatePluginSettings(pluginId, settings);
      setShowSettings(false);
      setSelectedPlugin(null);
    } catch (error) {
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const enabledCount = installedPlugins.filter(p => p.enabled).length;
  const totalNodes = installedPlugins
    .filter(p => p.enabled)
    .reduce((sum, p) => sum + (p.nodes?.length || 0), 0);
  const totalTools = installedPlugins
    .filter(p => p.enabled)
    .reduce((sum, p) => sum + (p.tools?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plugins</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Extend TeamFlow AI with custom nodes and tools
            </p>
          </div>
          <button
            onClick={() => setShowDiscovery(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Discover Plugins
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Installed</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {installedPlugins.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Enabled</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {enabledCount}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Custom Nodes</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalNodes}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Custom Tools</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalTools}
            </div>
          </div>
        </div>
      </div>

      {/* Plugin List */}
      {installedPlugins.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No plugins installed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Discover and install plugins to extend your workflows
          </p>
          <button
            onClick={() => setShowDiscovery(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Plugin Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {installedPlugins.map(plugin => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onEnable={() => handleEnablePlugin(plugin.id)}
              onDisable={() => handleDisablePlugin(plugin.id)}
              onUninstall={() => handleUninstallPlugin(plugin.id)}
              onSettings={() => handleOpenSettings(plugin)}
            />
          ))}
        </div>
      )}

      {/* Plugin Discovery Modal */}
      {showDiscovery && (
        <PluginDiscoveryModal
          installedPluginIds={installedPlugins.map(p => p.id)}
          onInstall={handleInstallPlugin}
          onClose={() => setShowDiscovery(false)}
        />
      )}

      {/* Plugin Settings Modal */}
      {showSettings && selectedPlugin && (
        <PluginSettingsModal
          plugin={selectedPlugin}
          onSave={(settings) => handleSaveSettings(selectedPlugin.id, settings)}
          onClose={() => {
            setShowSettings(false);
            setSelectedPlugin(null);
          }}
        />
      )}
    </div>
  );
}
