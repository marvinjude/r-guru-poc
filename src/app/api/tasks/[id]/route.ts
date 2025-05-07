import { NextRequest, NextResponse } from "next/server";
import { Task } from "@/models/task";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import type { AuthCustomer } from "@/lib/auth";
import { DataOrigin } from "@/models/common";
import { authenticatedFetcher } from "@/lib/fetch-utils";

const INTEGRATION_WEBHOOK_URL = "https://api.integration.app/webhooks/app-events/3ee7ee5d-dec8-4786-a7fa-d541495744e6";

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

const notifyIntegrationApp = async (task: any, customerId: string) => {
  try {
    const webhookPayload = {
      type: "updated",
      customerId: customerId,
      data: {
        id: task.externalId,
        title: task.title,
        description: task.description || "",
        assigneeId: task.assigneeId || "",
        projectId: task.projectId || "",
        reporter: task.assigneeId || ""
      }
    };

    console.log('Attempting to send webhook to Integration App:', {
      url: INTEGRATION_WEBHOOK_URL,
      payload: webhookPayload
    });

    const response = await fetch(INTEGRATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload),
    });

    // Also log the response body for debugging
    const responseData = await response.json();
    console.log('Integration App webhook response:', responseData);

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send webhook to Integration App:', error);
    throw new Error('Failed to sync with external system');
  }
};

async function handler(
  request: NextRequest,
  auth: AuthCustomer,
  params: TaskUpdateParams
) {
  try {
    console.log('PATCH /api/tasks/[id] - Request received:', {
      taskId: params.params.id,
      updateData: params.body,
      auth: {
        customerId: auth.customerId,
        customerName: auth.customerName
      }
    });

    const taskId = params.params.id;
    const updateData = params.body;

    // Remove status validation since we're using project status IDs
    
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
      console.error(`Task not found with ID: ${taskId}`);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Log the update operation details
    console.log('Attempting to update task with data:', {
      taskId: taskId,
      currentTask: task.toObject(),
      updateFields: updateData,
      validationErrors: task.validateSync()
    });

    // Update the task with provided fields
    Object.assign(task, updateData);
    
    // Check for validation errors before saving
    const validationError = task.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: "Validation error", details: validationError },
        { status: 400 }
      );
    }

    await task.save();

    // Notify Integration App after successful update
    await notifyIntegrationApp(task, auth.customerId);

    console.log('Task updated successfully:', task.toObject());

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    const err = error as Error & {
      code?: number;
      kind?: string;
      value?: string;
      path?: string;
      reason?: unknown;
    };

    console.error('Error updating task:', {
      message: err.message,
      code: err.code,
      kind: err.kind,
      value: err.value,
      path: err.path,
      stack: err.stack,
      fullError: err
    });

    // Handle specific error cases
    if (err.kind === 'ObjectId') {
      return NextResponse.json(
        { error: "Invalid task ID format" },
        { status: 400 }
      );
    }

    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate key error" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update task", details: err.message },
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

export const GET = APIHandler<TaskUpdateParams>(async (request, auth, params) => {
  try {
    console.log('GET /api/tasks/[id] - Request received:', {
      taskId: params.params.id,
      auth: {
        customerId: auth.customerId,
        customerName: auth.customerName
      }
    });

    const task = await Task.findById(params.params.id);
    
    console.log('Task found:', task);

    if (!task) {
      console.log(`Task not found with ID: ${params.params.id}`);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching task:', {
      message: err.message,
      stack: err.stack
    });

    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
});
