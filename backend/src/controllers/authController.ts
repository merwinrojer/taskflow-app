import type { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(request: Request, response: Response) {
  const result = await authService.register(
    request.body.email,
    request.body.password,
  );
  response.status(201).json(result);
}

export async function login(request: Request, response: Response) {
  const result = await authService.login(request.body.email, request.body.password);
  response.json(result);
}

export async function me(request: Request, response: Response) {
  const user = await authService.getCurrentUser(request.userId!);
  response.json({ user });
}
