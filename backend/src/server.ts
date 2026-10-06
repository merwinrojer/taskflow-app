import mongoose from 'mongoose';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function start(): Promise<void> {
  await connectDatabase();
  const server = app.listen(env.port, () => {
    console.info(`TaskFlow API listening on port ${env.port}`);
  });

  const shutdown = (signal: string) => {
    console.info(`${signal} received; shutting down`);
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error: unknown) => {
  console.error('Failed to start API:', error);
  process.exitCode = 1;
});
