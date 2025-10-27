'use client';

import { useState, useEffect } from 'react';
import { loadSettings, saveSettings, type AppSettings } from '@/lib/settings-storage';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({ apiKeys: {} });
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    ollama: false,
  });

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleShowKey = (provider: keyof typeof showKeys) => {
    setShowKeys({ ...showKeys, [provider]: !showKeys[provider] });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your API keys and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 max-w-3xl">
        <div className="space-y-8">
          {/* API Keys Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">LLM API Keys</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure API keys for AI agents to connect to LLM providers. Keys are stored locally
              in your browser and never sent to our servers.
            </p>

            <div className="space-y-6">
              {/* OpenAI API Key */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  OpenAI API Key
                  <span className="text-muted-foreground ml-2">(for GPT models)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={settings.apiKeys.openai || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, openai: e.target.value },
                      })
                    }
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => toggleShowKey('openai')}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                    title={showKeys.openai ? 'Hide' : 'Show'}
                  >
                    {showKeys.openai ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>

              {/* Anthropic API Key */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Anthropic API Key
                  <span className="text-muted-foreground ml-2">(for Claude models)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={settings.apiKeys.anthropic || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, anthropic: e.target.value },
                      })
                    }
                    placeholder="sk-ant-..."
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => toggleShowKey('anthropic')}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                    title={showKeys.anthropic ? 'Hide' : 'Show'}
                  >
                    {showKeys.anthropic ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com/settings/keys
                  </a>
                </p>
              </div>

              {/* Ollama Base URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ollama Base URL
                  <span className="text-muted-foreground ml-2">(for local models)</span>
                </label>
                <input
                  type="text"
                  value={settings.apiKeys.ollama || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, ollama: e.target.value },
                    })
                  }
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Run Ollama locally for free, privacy-focused AI. Install from{' '}
                  <a
                    href="https://ollama.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ollama.ai
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  ✓ Settings saved successfully
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Save Settings
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">🔒 Security & Privacy</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• API keys are stored locally in your browser&apos;s localStorage</li>
              <li>• Keys are never transmitted to TeamFlow servers</li>
              <li>• Keys are only sent directly to the respective LLM providers</li>
              <li>• Clear your browser data to remove stored keys</li>
              <li>• Use read-only API keys when possible for additional security</li>
            </ul>
          </div>

          {/* Usage Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
              💡 Using AI Agents
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Once configured, AI agents in your team will use these API keys to execute tasks.
              Assign tasks to AI agents and they will autonomously work on them using the
              configured LLM provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
