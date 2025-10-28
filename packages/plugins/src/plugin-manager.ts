import type {
  Plugin,
  CustomNodeDefinition,
  NodeExecutionContext,
  Tool,
  PluginHooks,
} from '@teamflow/types';

/**
 * Plugin Manager
 * Handles plugin loading, registration, lifecycle, and execution
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private customNodes: Map<string, CustomNodeDefinition> = new Map();
  private customTools: Map<string, Tool> = new Map();
  private pluginStorage: PluginStorage;

  constructor(storage?: PluginStorage) {
    this.pluginStorage = storage || new LocalStoragePluginStorage();
  }

  /**
   * Initialize plugin manager - load installed plugins
   */
  async initialize(): Promise<void> {
    const savedPlugins = await this.pluginStorage.loadPlugins();

    for (const plugin of savedPlugins) {
      try {
        await this.register(plugin);

        if (plugin.enabled) {
          await this.enable(plugin.id);
        }
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.id}:`, error);
      }
    }
  }

  /**
   * Register a new plugin
   */
  async register(plugin: Plugin): Promise<void> {
    // Validate plugin
    this.validatePlugin(plugin);

    // Check for conflicts
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // Register custom nodes
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        if (this.customNodes.has(node.type)) {
          throw new Error(`Node type ${node.type} is already registered`);
        }
      }
    }

    // Store plugin
    this.plugins.set(plugin.id, plugin);

    // Call install hook
    if (plugin.hooks?.onInstall) {
      await plugin.hooks.onInstall();
    }

    // Save to storage
    await this.pluginStorage.savePlugin(plugin);
  }

  /**
   * Unregister and remove a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Disable first if enabled
    if (plugin.enabled) {
      await this.disable(pluginId);
    }

    // Call uninstall hook
    if (plugin.hooks?.onUninstall) {
      await plugin.hooks.onUninstall();
    }

    // Remove from registry
    this.plugins.delete(pluginId);

    // Remove from storage
    await this.pluginStorage.deletePlugin(pluginId);
  }

  /**
   * Enable a plugin
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.enabled) {
      return; // Already enabled
    }

    // Register custom nodes
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        this.customNodes.set(node.type, node);
      }
    }

    // Register custom tools
    if (plugin.tools) {
      for (const tool of plugin.tools) {
        this.customTools.set(tool.name, tool);
      }
    }

    // Call enable hook
    if (plugin.hooks?.onEnable) {
      await plugin.hooks.onEnable();
    }

    // Update plugin state
    plugin.enabled = true;
    await this.pluginStorage.savePlugin(plugin);
  }

  /**
   * Disable a plugin
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!plugin.enabled) {
      return; // Already disabled
    }

    // Unregister custom nodes
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        this.customNodes.delete(node.type);
      }
    }

    // Unregister custom tools
    if (plugin.tools) {
      for (const tool of plugin.tools) {
        this.customTools.delete(tool.name);
      }
    }

    // Call disable hook
    if (plugin.hooks?.onDisable) {
      await plugin.hooks.onDisable();
    }

    // Update plugin state
    plugin.enabled = false;
    await this.pluginStorage.savePlugin(plugin);
  }

  /**
   * Execute a custom node
   */
  async executeNode(nodeType: string, context: NodeExecutionContext): Promise<any> {
    const nodeDef = this.customNodes.get(nodeType);
    if (!nodeDef) {
      throw new Error(`Custom node type ${nodeType} not found`);
    }

    try {
      return await nodeDef.execute(context);
    } catch (error) {
      throw new Error(`Node execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a custom tool
   */
  async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    const tool = this.customTools.get(toolName);
    if (!tool) {
      throw new Error(`Custom tool ${toolName} not found`);
    }

    try {
      return await tool.execute(params);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return this.getPlugins().filter(p => p.enabled);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all custom nodes
   */
  getCustomNodes(): CustomNodeDefinition[] {
    return Array.from(this.customNodes.values());
  }

  /**
   * Get custom nodes by category
   */
  getCustomNodesByCategory(): Record<string, CustomNodeDefinition[]> {
    const byCategory: Record<string, CustomNodeDefinition[]> = {};

    for (const node of this.customNodes.values()) {
      if (!byCategory[node.category]) {
        byCategory[node.category] = [];
      }
      byCategory[node.category].push(node);
    }

    return byCategory;
  }

  /**
   * Get a specific custom node definition
   */
  getCustomNode(nodeType: string): CustomNodeDefinition | undefined {
    return this.customNodes.get(nodeType);
  }

  /**
   * Get all custom tools
   */
  getCustomTools(): Tool[] {
    return Array.from(this.customTools.values());
  }

  /**
   * Check if a node type is a custom plugin node
   */
  isCustomNode(nodeType: string): boolean {
    return this.customNodes.has(nodeType);
  }

  /**
   * Update plugin settings
   */
  async updatePluginSettings(pluginId: string, settings: Record<string, any>): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.settings) {
      plugin.settings.values = { ...plugin.settings.values, ...settings };
    }

    await this.pluginStorage.savePlugin(plugin);
  }

  /**
   * Trigger plugin hooks
   */
  async triggerHook(hookName: keyof PluginHooks, ...args: any[]): Promise<void> {
    for (const plugin of this.getEnabledPlugins()) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        try {
          // @ts-ignore - dynamic hook calling
          await plugin.hooks[hookName](...args);
        } catch (error) {
          console.error(`Plugin ${plugin.id} hook ${hookName} failed:`, error);
        }
      }
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.id || typeof plugin.id !== 'string') {
      throw new Error('Plugin must have a valid id');
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin must have a valid name');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error('Plugin must have a valid version');
    }

    // Validate custom nodes
    if (plugin.nodes) {
      for (const node of plugin.nodes) {
        if (!node.type || !node.label || !node.execute) {
          throw new Error(`Invalid node definition in plugin ${plugin.id}`);
        }
      }
    }

    // Validate custom tools
    if (plugin.tools) {
      for (const tool of plugin.tools) {
        if (!tool.name || !tool.description || !tool.execute) {
          throw new Error(`Invalid tool definition in plugin ${plugin.id}`);
        }
      }
    }
  }
}

/**
 * Plugin Storage Interface
 * Allows different storage backends
 */
export interface PluginStorage {
  loadPlugins(): Promise<Plugin[]>;
  savePlugin(plugin: Plugin): Promise<void>;
  deletePlugin(pluginId: string): Promise<void>;
}

/**
 * LocalStorage-based plugin storage
 */
export class LocalStoragePluginStorage implements PluginStorage {
  private readonly STORAGE_KEY = 'teamflow_plugins';

  async loadPlugins(): Promise<Plugin[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load plugins from localStorage:', error);
      return [];
    }
  }

  async savePlugin(plugin: Plugin): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const plugins = await this.loadPlugins();
      const index = plugins.findIndex(p => p.id === plugin.id);

      if (index >= 0) {
        plugins[index] = plugin;
      } else {
        plugins.push(plugin);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plugins));
    } catch (error) {
      console.error('Failed to save plugin to localStorage:', error);
      throw error;
    }
  }

  async deletePlugin(pluginId: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const plugins = await this.loadPlugins();
      const filtered = plugins.filter(p => p.id !== pluginId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete plugin from localStorage:', error);
      throw error;
    }
  }
}

/**
 * Create global plugin manager instance
 */
let globalPluginManager: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager();
  }
  return globalPluginManager;
}

export function initializePluginManager(storage?: PluginStorage): PluginManager {
  globalPluginManager = new PluginManager(storage);
  return globalPluginManager;
}
