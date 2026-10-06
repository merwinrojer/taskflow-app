export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskSort = 'smart' | 'priority' | 'deadline' | 'createdAt';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  deadline: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TaskForm: {taskId?: string} | undefined;
  TaskDetails: {taskId: string};
  Profile: undefined;
}
