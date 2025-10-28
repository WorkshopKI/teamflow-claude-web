'use client';

import { useState } from 'react';
import { formatNextRun, isValidPattern } from '@teamflow/workflow-engine/src/scheduler';

interface ScheduleConfig {
  enabled: boolean;
  pattern: string;
  nextRun?: Date;
}

interface ScheduleConfigPanelProps {
  schedule?: ScheduleConfig;
  onScheduleChange: (schedule: ScheduleConfig | null) => void;
}

const COMMON_PATTERNS = [
  { label: 'Every 5 minutes', value: '5m' },
  { label: 'Every 15 minutes', value: '15m' },
  { label: 'Every 30 minutes', value: '30m' },
  { label: 'Every hour', value: '1h' },
  { label: 'Every 2 hours', value: '2h' },
  { label: 'Every 6 hours', value: '6h' },
  { label: 'Every 12 hours', value: '12h' },
  { label: 'Every day', value: '1d' },
  { label: 'Every 2 days', value: '2d' },
  { label: 'Every week', value: '7d' },
];

export function ScheduleConfigPanel({ schedule, onScheduleChange }: ScheduleConfigPanelProps) {
  const [enabled, setEnabled] = useState(schedule?.enabled || false);
  const [pattern, setPattern] = useState(schedule?.pattern || '1h');
  const [customPattern, setCustomPattern] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPattern = useCustom ? customPattern : pattern;

  const handleEnableToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      onScheduleChange(null);
      setError(null);
    } else {
      validateAndSave(currentPattern);
    }
  };

  const handlePatternChange = (newPattern: string) => {
    setPattern(newPattern);
    setUseCustom(false);
    setCustomPattern('');
    if (enabled) {
      validateAndSave(newPattern);
    }
  };

  const handleCustomPatternChange = (value: string) => {
    setCustomPattern(value);
    if (enabled && useCustom) {
      validateAndSave(value);
    }
  };

  const validateAndSave = (patternToValidate: string) => {
    if (!patternToValidate.trim()) {
      setError('Pattern is required');
      return;
    }

    if (!isValidPattern(patternToValidate)) {
      setError('Invalid pattern. Use format like "5m", "1h", "2d"');
      return;
    }

    setError(null);

    // Calculate next run time
    const nextRun = calculateNextRun(patternToValidate);

    onScheduleChange({
      enabled: true,
      pattern: patternToValidate,
      nextRun,
    });
  };

  const calculateNextRun = (schedulePattern: string): Date => {
    const match = schedulePattern.match(/^(\d+)(m|h|d)$/);
    if (!match) return new Date();

    const value = parseInt(match[1]);
    const unit = match[2];

    let milliseconds = 0;
    switch (unit) {
      case 'm':
        milliseconds = value * 60 * 1000;
        break;
      case 'h':
        milliseconds = value * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
    }

    return new Date(Date.now() + milliseconds);
  };

  const nextRunText = enabled && schedule?.nextRun
    ? formatNextRun(schedule.nextRun)
    : 'Not scheduled';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Schedule
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Run this workflow automatically on a schedule
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleEnableToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {enabled && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Schedule Pattern
            </label>
            <div className="space-y-2">
              {!useCustom && (
                <select
                  value={pattern}
                  onChange={(e) => handlePatternChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {COMMON_PATTERNS.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {useCustom ? 'Use preset pattern' : 'Use custom pattern'}
              </button>

              {useCustom && (
                <div>
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => handleCustomPatternChange(e.target.value)}
                    placeholder="e.g., 15m, 2h, 3d"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format: number + unit (m=minutes, h=hours, d=days)
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Next Run
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {nextRunText}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Pattern: {currentPattern}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> Scheduled workflows will only run when the application is running.
              The workflow must be in &quot;active&quot; status to execute on schedule.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
