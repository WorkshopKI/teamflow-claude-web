'use client';

import { useState } from 'react';
import type { Task, TaskStatus } from '@teamflow/types';
import { TaskCard } from './TaskCard';
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

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    update(taskId, { status: newStatus });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status.value);

          return (
            <div key={status.value} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <h2 className="font-semibold text-lg">{status.label}</h2>
                  <span className="text-sm text-muted-foreground">({columnTasks.length})</span>
                </div>
                <div className="h-1 bg-border rounded-full" />
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} onClick={() => handleTaskClick(task)}>
                      <TaskCard
                        task={task}
                        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

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
