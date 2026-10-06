import type { Request, Response } from 'express';
import * as taskService from '../services/taskService';

export async function list(request: Request, response: Response) {
  const result = await taskService.listTasks(request.userId!, {
    status: request.query.status as string | undefined,
    sort: request.query.sort as string | undefined,
    search: request.query.search as string | undefined,
    category: request.query.category as string | undefined,
    page: request.query.page ? Number(request.query.page) : undefined,
    limit: request.query.limit ? Number(request.query.limit) : undefined,
  });
  response.json(result);
}

export async function get(request: Request, response: Response) {
  response.json({ task: await taskService.getTask(request.userId!, request.params.id) });
}

export async function create(request: Request, response: Response) {
  const task = await taskService.createTask(request.userId!, request.body);
  response.status(201).json({ task });
}

export async function update(request: Request, response: Response) {
  const task = await taskService.updateTask(
    request.userId!,
    request.params.id,
    request.body,
  );
  response.json({ task });
}

export async function toggleComplete(request: Request, response: Response) {
  const task = await taskService.toggleComplete(request.userId!, request.params.id);
  response.json({ task });
}

export async function remove(request: Request, response: Response) {
  const task = await taskService.deleteTask(request.userId!, request.params.id);
  response.json({ task });
}
