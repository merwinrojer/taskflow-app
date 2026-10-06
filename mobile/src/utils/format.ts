import type {Priority, Task} from '../types';

export const priorityColor: Record<Priority, string> = {
  High: '#D94F5C',
  Medium: '#E4A12C',
  Low: '#389B78',
};

export function formatDate(value: string | null): string {
  if (!value) return 'No deadline';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getTaskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length,
    progress: tasks.length
      ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100)
      : 0,
  };
}
