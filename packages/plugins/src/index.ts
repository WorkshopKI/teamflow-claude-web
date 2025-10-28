/**
 * @teamflow/plugins
 * Plugin system for extending TeamFlow AI
 */

// Core plugin system
export { PluginManager, getPluginManager, initializePluginManager } from './plugin-manager';
export type { PluginStorage } from './plugin-manager';

// Plugin builder
export { PluginBuilder, NodeBuilder, ToolBuilder, createPlugin } from './plugin-builder';

// Plugin registry
export {
  PluginRegistry,
  getPluginRegistry,
  discoverPlugins,
  installPluginFromRegistry,
} from './plugin-registry';
export type { PluginMetadata } from './plugin-registry';

// Example plugins
export { createSlackPlugin } from './examples/slack-plugin';
export { createGitHubPlugin } from './examples/github-plugin';
export { createDataTransformPlugin } from './examples/data-transform-plugin';
export { createEmailPlugin } from './examples/email-plugin';
export { createSpreadsheetPlugin } from './examples/spreadsheet-plugin';
export { createCalendarPlugin } from './examples/calendar-plugin';
