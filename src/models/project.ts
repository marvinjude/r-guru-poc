import mongoose from "mongoose";
import { model, models } from "mongoose";
import { DataOrigin } from "./common";
export interface IProject {
  _id: string;
  externalId?: string;
  name: string;
  description?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  origin: DataOrigin;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    externalId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    origin: {
      type: String,
      required: true,
      enum: Object.values(DataOrigin),
    },
  },
  {
    timestamps: true,
  }
);

if (models.Project) {
  delete models.Project;
}

export const Project = model<IProject>("Project", projectSchema);
