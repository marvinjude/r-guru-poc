import mongoose from "mongoose";
import { model, models } from "mongoose";
import { DataOrigin } from "./common";

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  createdAt: Date;
  assigneeId?: string;
  origin: DataOrigin;
  updatedAt: Date;
  status: string;
  projectId?: string;
  externalId?: string;
}

const TaskStatus = ["todo", "in_progress", "done"] as const;

const taskSchema = new mongoose.Schema<ITask>(
  {
    externalId: {
      type: String,
      default: null,
    },
    origin: {
      type: String,
      required: true,
      enum: Object.values(DataOrigin),
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    projectId: {
      type: String,
      default: null,
    },
    assigneeId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: TaskStatus,
    },
  },
  {
    timestamps: true,
  }
);

if (models.Task) {
  delete models.Task;
}

export const Task = model<ITask>("Task", taskSchema);
