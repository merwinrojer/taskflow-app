import { Schema, model, type InferSchemaType } from 'mongoose';

export const priorities = ['Low', 'Medium', 'High'] as const;
export type Priority = (typeof priorities)[number];

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    priority: { type: String, enum: priorities, required: true, default: 'Medium' },
    category: { type: String, trim: true, default: 'Personal', maxlength: 40 },
    deadline: { type: Date, default: null },
    completed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, completed: 1, deadline: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export default model('Task', taskSchema);
