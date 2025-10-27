'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function DroppableColumn({ id, title, color, count, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h2 className="font-semibold text-lg">{title}</h2>
          <span className="text-sm text-muted-foreground">({count})</span>
        </div>
        <div className="h-1 bg-border rounded-full" />
      </div>

      {/* Column Content - Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-primary/5 border-2 border-primary border-dashed' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
