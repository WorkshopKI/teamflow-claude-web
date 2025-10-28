import type { Plugin } from '@teamflow/types';
import { createSlackPlugin } from './examples/slack-plugin';
import { createGitHubPlugin } from './examples/github-plugin';
import { createDataTransformPlugin } from './examples/data-transform-plugin';
import { createEmailPlugin } from './examples/email-plugin';
import { createSpreadsheetPlugin } from './examples/spreadsheet-plugin';
import { createCalendarPlugin } from './examples/calendar-plugin';

/**
 * Plugin Registry
 * Central registry for available plugins
 */
export class PluginRegistry {
  private plugins: Map<string, () => Plugin> = new Map();

  constructor() {
    // Register built-in example plugins
    this.registerBuiltInPlugins();
  }

  /**
   * Register built-in plugins
   */
  private registerBuiltInPlugins(): void {
    this.register('slack-integration', createSlackPlugin);
    this.register('github-integration', createGitHubPlugin);
    this.register('data-transform', createDataTransformPlugin);
    this.register('email-integration', createEmailPlugin);
    this.register('spreadsheet-csv', createSpreadsheetPlugin);
    this.register('calendar-scheduling', createCalendarPlugin);
  }

  /**
   * Register a plugin factory
   */
  register(id: string, factory: () => Plugin): void {
    if (this.plugins.has(id)) {
      throw new Error(`Plugin ${id} is already registered in the registry`);
    }

    this.plugins.set(id, factory);
  }

  /**
   * Unregister a plugin factory
   */
  unregister(id: string): void {
    this.plugins.delete(id);
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(id: string): Plugin | null {
    const factory = this.plugins.get(id);
    if (!factory) {
      return null;
    }

    try {
      return factory();
    } catch (error) {
      console.error(`Failed to create plugin ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all available plugins
   */
  getAllPlugins(): Plugin[] {
    const plugins: Plugin[] = [];

    for (const [id, factory] of this.plugins.entries()) {
      try {
        plugins.push(factory());
      } catch (error) {
        console.error(`Failed to create plugin ${id}:`, error);
      }
    }

    return plugins;
  }

  /**
   * Get plugin metadata (without full instantiation)
   */
  getPluginMetadata(): PluginMetadata[] {
    return this.getAllPlugins().map(plugin => ({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      nodeCount: plugin.nodes?.length || 0,
      toolCount: plugin.tools?.length || 0,
      hasHooks: !!plugin.hooks,
      hasSettings: !!plugin.settings,
    }));
  }

  /**
   * Search plugins by keyword
   */
  searchPlugins(query: string): Plugin[] {
    const lowerQuery = query.toLowerCase();

    return this.getAllPlugins().filter(plugin => {
      return (
        plugin.name.toLowerCase().includes(lowerQuery) ||
        plugin.description.toLowerCase().includes(lowerQuery) ||
        plugin.id.toLowerCase().includes(lowerQuery) ||
        plugin.author.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get plugins by category (based on node categories)
   */
  getPluginsByCategory(): Record<string, Plugin[]> {
    const byCategory: Record<string, Plugin[]> = {};

    for (const plugin of this.getAllPlugins()) {
      if (plugin.nodes) {
        for (const node of plugin.nodes) {
          if (!byCategory[node.category]) {
            byCategory[node.category] = [];
          }

          if (!byCategory[node.category].includes(plugin)) {
            byCategory[node.category].push(plugin);
          }
        }
      }
    }

    return byCategory;
  }

  /**
   * Check if a plugin exists
   */
  hasPlugin(id: string): boolean {
    return this.plugins.has(id);
  }

  /**
   * Get count of available plugins
   */
  getPluginCount(): number {
    return this.plugins.size;
  }
}

/**
 * Plugin Metadata
 * Lightweight plugin information
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  nodeCount: number;
  toolCount: number;
  hasHooks: boolean;
  hasSettings: boolean;
}

/**
 * Global plugin registry instance
 */
let globalRegistry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry();
  }
  return globalRegistry;
}

/**
 * Helper function to discover available plugins
 */
export function discoverPlugins(): PluginMetadata[] {
  return getPluginRegistry().getPluginMetadata();
}

/**
 * Helper function to install a plugin from the registry
 */
export async function installPluginFromRegistry(
  pluginId: string,
  pluginManager: any
): Promise<void> {
  const plugin = getPluginRegistry().getPlugin(pluginId);

  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found in registry`);
  }

  await pluginManager.register(plugin);
}
