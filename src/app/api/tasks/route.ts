import { NextResponse } from "next/server";
import { Task } from "@/models/task";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import { DataOrigin } from "@/models/common";

interface CreateTaskParams extends RequestParams {
  body: {
    title: string;
    description?: string;
    projectId?: string;
    assigneeId: string;
    status?: string;
  };
}

export const GET = APIHandler<RequestParams>(async () => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
});

export const POST = APIHandler<CreateTaskParams>(
  async (request, auth, requestParams) => {
    try {
      const { title, description, projectId, assigneeId, status } =
        requestParams.body;

      if (!title) {
        return NextResponse.json(
          { error: "Task title is required" },
          { status: 400 }
        );
      }

      if (!assigneeId) {
        return NextResponse.json(
          { error: "Assignee ID is required" },
          { status: 400 }
        );
      }

      const task = await Task.create({
        title,
        description,
        projectId,
        assigneeId,
        status,
        origin: DataOrigin.APP,
      });

      return NextResponse.json(task, { status: 201 });
    } catch (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }
  }
);
