import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';
import { AppError } from '../utils/AppError';

function issueToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    subject: userId,
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

function publicUser(user: { _id: { toString(): string }; email: string; createdAt: Date }) {
  return { id: user._id.toString(), email: user.email, createdAt: user.createdAt };
}

export async function register(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    throw new AppError('An account with this email already exists', 409);
  }
  const hashedPassword = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ email: normalizedEmail, password: hashedPassword });
  return { token: issueToken(user.id), user: publicUser(user) };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+password',
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Email or password is incorrect', 401);
  }
  return { token: issueToken(user.id), user: publicUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Account no longer exists', 401);
  }
  return publicUser(user);
}
