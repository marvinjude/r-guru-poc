import { NextRequest, NextResponse } from "next/server";
import { Task } from "@/models/task";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { DataOrigin } from "@/models/common";

interface TaskUpdateParams extends RequestParams {
  params: {
    id: string;
  };
  body: {
    title?: string;
    description?: string;
    status?: string;
    assigneeId?: string;
    projectId?: string;
    externalId?: string;
    origin?: DataOrigin;
  };
}

interface TaskDeleteParams extends RequestParams {
  params: {
    id: string;
  };
}

const TaskStatus = ["todo", "in_progress", "done"] as const;
type TaskStatusType = (typeof TaskStatus)[number];

async function handler(
  request: NextRequest,
  auth: AuthCustomer,
  params: TaskUpdateParams
) {
  try {
    const taskId = params.params.id;
    const updateData = params.body;

    // Validate status if provided
    if (
      updateData.status &&
      !TaskStatus.includes(updateData.status as TaskStatusType)
    ) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: todo, in_progress, done" },
        { status: 400 }
      );
    }

    if (
      updateData.origin &&
      !Object.values(DataOrigin).includes(updateData.origin)
    ) {
      return NextResponse.json(
        { error: "Invalid origin. Must be one of: jira, asana, app" },
        { status: 400 }
      );
    }

    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update the task with provided fields
    Object.assign(task, updateData);
    await task.save();

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

async function deleteHandler(
  request: NextRequest,
  auth: AuthCustomer,
  params: TaskDeleteParams
) {
  try {
    const taskId = params.params.id;
    const task = await Task.findOne({ _id: taskId });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await Task.deleteOne({ _id: taskId });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export const PATCH = APIHandler<TaskUpdateParams>(handler);
export const DELETE = APIHandler<TaskDeleteParams>(deleteHandler);
