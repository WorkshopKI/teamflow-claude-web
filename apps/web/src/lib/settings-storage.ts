/**
 * Settings Storage
 *
 * Local storage for application settings including API keys
 */

import type { LLMProvider } from '@teamflow/types';

export interface APIKeySettings {
  openai?: string;
  anthropic?: string;
  ollama?: string; // Base URL for Ollama
  custom?: string; // For custom providers
}

export interface AppSettings {
  apiKeys: APIKeySettings;
  theme?: 'light' | 'dark';
  defaultLLMProvider?: LLMProvider;
}

const SETTINGS_KEY = 'teamflow-settings';

/**
 * Load settings from localStorage
 */
export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return { apiKeys: {} };
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return { apiKeys: {} };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { apiKeys: {} };
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Get API key for a provider
 */
export function getAPIKey(provider: LLMProvider): string | undefined {
  const settings = loadSettings();
  return settings.apiKeys[provider];
}

/**
 * Set API key for a provider
 */
export function setAPIKey(provider: LLMProvider, apiKey: string): void {
  const settings = loadSettings();
  settings.apiKeys[provider] = apiKey;
  saveSettings(settings);
}

/**
 * Clear API key for a provider
 */
export function clearAPIKey(provider: LLMProvider): void {
  const settings = loadSettings();
  delete settings.apiKeys[provider];
  saveSettings(settings);
}

/**
 * Check if any API keys are configured
 */
export function hasAnyAPIKeys(): boolean {
  const settings = loadSettings();
  return Object.keys(settings.apiKeys).length > 0;
}

/**
 * Check if API key is configured for a provider
 */
export function hasAPIKey(provider: LLMProvider): boolean {
  const settings = loadSettings();
  return !!settings.apiKeys[provider];
}
