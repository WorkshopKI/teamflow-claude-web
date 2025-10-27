'use client';

import { getShortcutLabel, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const categories: Record<string, KeyboardShortcut[]> = {
    'General': shortcuts.filter(s => s.description.includes('Help') || s.description.includes('Close')),
    'Navigation': shortcuts.filter(s => s.description.includes('Go to') || s.description.includes('Navigate')),
    'Tasks': shortcuts.filter(s => s.description.includes('task') || s.description.includes('Task')),
    'Other': shortcuts.filter(s =>
      !s.description.includes('Help') &&
      !s.description.includes('Close') &&
      !s.description.includes('Go to') &&
      !s.description.includes('Navigate') &&
      !s.description.includes('task') &&
      !s.description.includes('Task')
    ),
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between sticky top-0 bg-card">
          <div>
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Speed up your workflow with these shortcuts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {Object.entries(categories).map(([category, categoryShortcuts]) => {
            if (categoryShortcuts.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-secondary border border-border rounded text-sm font-mono font-semibold">
                        {getShortcutLabel(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-secondary/20">
          <p className="text-sm text-muted-foreground text-center">
            Press <kbd className="px-2 py-1 bg-card border border-border rounded text-xs font-mono">?</kbd> or{' '}
            <kbd className="px-2 py-1 bg-card border border-border rounded text-xs font-mono">Esc</kbd> to close this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
