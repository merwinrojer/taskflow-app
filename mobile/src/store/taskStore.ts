import {create} from 'zustand';
import {getApiError} from '../api/client';
import {taskApi} from '../api/taskApi';
import type {Task, TaskDraft, TaskSort, TaskStatus} from '../types';

let latestRequestId = 0;

interface TaskState {
  tasks: Task[];
  stats: {total: number; completed: number; pending: number};
  filteredTotal: number;
  page: number;
  status: TaskStatus;
  sort: TaskSort;
  search: string;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  setStatus: (status: TaskStatus) => void;
  setSort: (sort: TaskSort) => void;
  setSearch: (search: string) => void;
  load: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  save: (draft: TaskDraft, id?: string) => Promise<Task>;
  toggleComplete: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: {total: 0, completed: 0, pending: 0},
  filteredTotal: 0,
  page: 1,
  status: 'all',
  sort: 'smart',
  search: '',
  loading: true,
  refreshing: false,
  loadingMore: false,
  error: null,
  setStatus: status => set({status}),
  setSort: sort => set({sort}),
  setSearch: search => set({search}),
  load: async (refresh = false) => {
    const requestId = ++latestRequestId;
    set({loading: !refresh, refreshing: refresh, loadingMore: false, error: null});
    const query = get();
    const filters = {status: query.status, sort: query.sort, search: query.search};
    try {
      const result = await taskApi.list(filters);
      const latest = get();
      if (
        requestId === latestRequestId &&
        latest.status === filters.status &&
        latest.sort === filters.sort &&
        latest.search === filters.search
      ) {
        set({
          tasks: result.tasks,
          stats: result.stats,
          filteredTotal: result.total,
          page: result.page,
          loading: false,
          refreshing: false,
        });
      }
    } catch (error) {
      const latest = get();
      if (
        requestId === latestRequestId &&
        latest.status === filters.status &&
        latest.sort === filters.sort &&
        latest.search === filters.search
      ) {
        set({
          loading: false,
          refreshing: false,
          error: getApiError(error),
        });
      }
      throw error;
    }
  },
  loadMore: async () => {
    const current = get();
    if (current.loadingMore || current.tasks.length >= current.filteredTotal) return;
    const requestId = latestRequestId;
    const nextPage = current.page + 1;
    const query = {status: current.status, sort: current.sort, search: current.search};
    set({loadingMore: true, error: null});
    try {
      const result = await taskApi.list({...query, page: nextPage});
      const latest = get();
      if (
        requestId === latestRequestId &&
        latest.status === query.status &&
        latest.sort === query.sort &&
        latest.search === query.search
      ) {
        set(state => ({
          tasks: [...state.tasks, ...result.tasks],
          filteredTotal: result.total,
          page: result.page,
          stats: result.stats,
          loadingMore: false,
        }));
      }
    } catch (error) {
      const latest = get();
      if (
        requestId === latestRequestId &&
        latest.status === query.status &&
        latest.sort === query.sort &&
        latest.search === query.search
      ) {
        set({loadingMore: false, error: getApiError(error)});
      }
      throw error;
    }
  },
  save: async (draft, id) => {
    const saved = id ? await taskApi.update(id, draft) : await taskApi.create(draft);
    set(state => ({
      stats: id
        ? state.stats
        : {
            total: state.stats.total + 1,
            completed: state.stats.completed,
            pending: state.stats.pending + 1,
          },
      tasks: id
        ? state.tasks.map(task => (task.id === id ? saved : task))
        : [saved, ...state.tasks],
    }));
    return saved;
  },
  toggleComplete: async id => {
    const updated = await taskApi.toggleComplete(id);
    set(state => ({
      stats: {
        total: state.stats.total,
        completed: state.stats.completed + (updated.completed ? 1 : -1),
        pending: state.stats.pending + (updated.completed ? -1 : 1),
      },
      tasks: state.tasks.flatMap(task => {
        if (task.id !== id) return [task];
        if (
          (state.status === 'pending' && updated.completed) ||
          (state.status === 'completed' && !updated.completed)
        ) {
          return [];
        }
        return [updated];
      }),
      filteredTotal:
        state.status === 'all' ||
        (state.status === 'pending' && !updated.completed) ||
        (state.status === 'completed' && updated.completed)
          ? state.filteredTotal
          : Math.max(0, state.filteredTotal - 1),
    }));
    if (get().status !== 'all') {
      await get().load(true);
    }
  },
  remove: async id => {
    const removed = await taskApi.remove(id);
    set(state => {
      return {
        stats: {
          total: state.stats.total - 1,
          completed: state.stats.completed - (removed.completed ? 1 : 0),
          pending: state.stats.pending - (removed.completed ? 0 : 1),
        },
        tasks: state.tasks.filter(item => item.id !== id),
        filteredTotal:
          state.tasks.some(item => item.id === id)
            ? Math.max(0, state.filteredTotal - 1)
            : state.filteredTotal,
      };
    });
    await get().load(true);
  },
}));
