'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { Task, TaskStatus } from '@teamflow/types';
import { TaskCard } from './TaskCard';
import { DroppableColumn } from './DroppableColumn';
import { DraggableTaskCard } from './DraggableTaskCard';
import { TaskDetailsModal } from './TaskDetailsModal';
import { useTasks } from '@/hooks/useTasks';

interface TaskBoardProps {
  tasks: Task[];
}

const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-500' },
];

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { update } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    // Get the task being dragged and the column it's dropped into
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Update task status if it changed
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      update(taskId, { status: newStatus });
    }

    setActiveTask(null);
  };

  const handleTaskClick = (task: Task) => {
    if (!activeTask) {
      // Only open modal if not dragging
      setSelectedTask(task);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUSES.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status.value);

            return (
              <DroppableColumn
                key={status.value}
                id={status.value}
                title={status.label}
                color={status.color}
                count={columnTasks.length}
              >
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                    <p className="text-xs text-muted-foreground mt-1">Drag tasks here</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))
                )}
              </DroppableColumn>
            );
          })}
        </div>

        {/* Drag Overlay - shows a copy of the card being dragged */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 cursor-grabbing opacity-80">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
