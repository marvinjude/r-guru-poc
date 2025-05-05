import mongoose from "mongoose";
import { model, models } from "mongoose";
import { DataOrigin } from "./common";

export interface ITaskUser {
  _id: string;
  email?: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  externalId?: string;
  origin: DataOrigin;
}

const taskUserSchema = new mongoose.Schema<ITaskUser>(
  {
    email: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: String,
    },
    origin: {
      type: String,
      enum: Object.values(DataOrigin),
      default: DataOrigin.APP,
    },
  },
  {
    timestamps: true,
  }
);

if (models.TaskUser) {
  delete models.TaskUser;
}

export const TaskUser = model<ITaskUser>("TaskUser", taskUserSchema);
