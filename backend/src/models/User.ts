import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export default model('User', userSchema);
