import {apiClient} from './client';
import type {Task, TaskDraft, TaskSort, TaskStatus} from '../types';

interface TaskRecord extends Omit<Task, 'id'> {
  _id?: string;
  id?: string;
}

interface TaskListResponse {
  tasks: TaskRecord[];
  total: number;
  page: number;
  limit: number;
  stats: {total: number; completed: number; pending: number};
}

function normalizeTask(task: TaskRecord): Task {
  const id = task.id ?? task._id;
  if (!id) {
    throw new Error('The server returned a task without an identifier');
  }
  return {...task, id};
}

export const taskApi = {
  async list(params: {
    status: TaskStatus;
    sort: TaskSort;
    search: string;
    page?: number;
  }): Promise<{
    tasks: Task[];
    stats: TaskListResponse['stats'];
    total: number;
    page: number;
  }> {
    const {data} = await apiClient.get<TaskListResponse>('/tasks', {
      params: {...params, limit: 100},
    });
    return {
      tasks: data.tasks.map(normalizeTask),
      stats: data.stats,
      total: data.total,
      page: data.page,
    };
  },
  async get(id: string): Promise<Task> {
    const {data} = await apiClient.get<{task: TaskRecord}>(`/tasks/${id}`);
    return normalizeTask(data.task);
  },
  async create(draft: TaskDraft): Promise<Task> {
    const {data} = await apiClient.post<{task: TaskRecord}>('/tasks', draft);
    return normalizeTask(data.task);
  },
  async update(id: string, draft: TaskDraft): Promise<Task> {
    const {data} = await apiClient.put<{task: TaskRecord}>(`/tasks/${id}`, draft);
    return normalizeTask(data.task);
  },
  async toggleComplete(id: string): Promise<Task> {
    const {data} = await apiClient.patch<{task: TaskRecord}>(
      `/tasks/${id}/complete`,
    );
    return normalizeTask(data.task);
  },
  async remove(id: string): Promise<Task> {
    const {data} = await apiClient.delete<{task: TaskRecord}>(`/tasks/${id}`);
    return normalizeTask(data.task);
  },
};
