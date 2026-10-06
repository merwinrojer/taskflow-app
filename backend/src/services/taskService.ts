import { Types } from 'mongoose';
import Task, { type Priority } from '../models/Task';
import { AppError } from '../utils/AppError';

const priorityWeight: Record<Priority, number> = {
  High: 30,
  Medium: 20,
  Low: 10,
};

export function smartPriorityScore(
  priority: Priority,
  deadline: Date | null | undefined,
  now = new Date(),
): number {
  if (!deadline) return priorityWeight[priority];
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(deadline);
  const dueDay = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((dueDay - today) / 86_400_000);
  const urgency = days === 0 ? 30 : days === 1 ? 20 : days >= 2 && days <= 7 ? 10 : 0;
  return priorityWeight[priority] + urgency;
}

export interface TaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  category?: string;
  deadline?: string | null;
}

function ownedTaskQuery(userId: string, id: string) {
  return { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) };
}

export async function listTasks(
  userId: string,
  filters: {
    status?: string;
    sort?: string;
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  },
) {
  const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
  if (filters.status === 'pending') query.completed = false;
  if (filters.status === 'completed') query.completed = true;
  if (filters.category) query.category = filters.category;
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 100;
  const sort = filters.sort ?? 'smart';
  const [tasks, total] = await Promise.all([
    Task.find(query).lean(),
    Task.countDocuments(query),
  ]);
  const userIdFilter = { userId: new Types.ObjectId(userId) };
  const [allTasks, completedTasks] = await Promise.all([
    Task.countDocuments(userIdFilter),
    Task.countDocuments({ ...userIdFilter, completed: true }),
  ]);

  if (sort === 'smart') {
    tasks.sort(
      (left, right) =>
        smartPriorityScore(right.priority as Priority, right.deadline) -
          smartPriorityScore(left.priority as Priority, left.deadline) ||
        right.createdAt.getTime() - left.createdAt.getTime(),
    );
  } else if (sort === 'priority') {
    const weights: Record<Priority, number> = {High: 30, Medium: 20, Low: 10};
    tasks.sort(
      (left, right) =>
        weights[right.priority as Priority] - weights[left.priority as Priority] ||
        right.createdAt.getTime() - left.createdAt.getTime(),
    );
  } else if (sort === 'deadline') {
    tasks.sort((left, right) => {
      if (!left.deadline) return right.deadline ? 1 : 0;
      if (!right.deadline) return -1;
      return left.deadline.getTime() - right.deadline.getTime();
    });
  } else {
    tasks.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }
  return {
    tasks: tasks.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    stats: {
      total: allTasks,
      completed: completedTasks,
      pending: allTasks - completedTasks,
    },
  };
}

export async function getTask(userId: string, id: string) {
  const task = await Task.findOne(ownedTaskQuery(userId, id)).lean();
  if (!task) throw new AppError('Task not found', 404);
  return task;
}

export async function createTask(userId: string, input: TaskInput) {
  return Task.create({
    userId: new Types.ObjectId(userId),
    title: input.title,
    description: input.description,
    priority: input.priority,
    category: input.category,
    deadline: input.deadline ? new Date(input.deadline) : null,
  });
}

export async function updateTask(userId: string, id: string, input: TaskInput) {
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.category !== undefined) update.category = input.category;
  if (input.deadline !== undefined) {
    update.deadline = input.deadline ? new Date(input.deadline) : null;
  }
  const task = await Task.findOneAndUpdate(ownedTaskQuery(userId, id), update, {
    new: true,
    runValidators: true,
  });
  if (!task) throw new AppError('Task not found', 404);
  return task;
}

export async function toggleComplete(userId: string, id: string) {
  const task = await Task.findOne(ownedTaskQuery(userId, id));
  if (!task) throw new AppError('Task not found', 404);
  task.completed = !task.completed;
  await task.save();
  return task;
}

export async function deleteTask(userId: string, id: string) {
  const task = await Task.findOneAndDelete(ownedTaskQuery(userId, id));
  if (!task) throw new AppError('Task not found', 404);
  return task;
}
