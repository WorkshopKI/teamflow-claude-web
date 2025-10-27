'use client';

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  description: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatches = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = s.ctrl === undefined || s.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatches = s.shift === undefined || s.shift === event.shiftKey;
        const altMatches = s.alt === undefined || s.alt === event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (shortcut) {
        // Don't trigger if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          // Allow Ctrl+Enter and Esc even in inputs
          if (!(event.key === 'Enter' && (event.ctrlKey || event.metaKey)) && event.key !== 'Escape') {
            return;
          }
        }

        event.preventDefault();
        shortcut.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export const getShortcutLabel = (shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'shift' | 'alt'>) => {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
};
