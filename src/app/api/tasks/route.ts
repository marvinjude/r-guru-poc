import { NextResponse } from "next/server";
import { Task } from "@/models/task";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import { DataOrigin } from "@/models/common";
import { authenticatedFetcher } from "@/lib/fetch-utils";

interface CreateTaskParams extends RequestParams {
  body: {
    title: string;
    description?: string;
    projectId?: string;
    assigneeId: string;
    status?: string;
  };
}

const INTEGRATION_WEBHOOK_URL = "https://api.integration.app/webhooks/app-events/3ee7ee5d-dec8-4786-a7fa-d541495744e6";

const notifyIntegrationApp = async (task: any, customerId: string) => {
  try {
    const webhookPayload = {
      type: "created",
      customerId: customerId,
      data: {
        id: task._id.toString(), // Use MongoDB _id since we don't have externalId yet
        title: task.title,
        description: task.description || "",
        assigneeId: task.assigneeId || "",
        projectId: task.projectId || "",
        reporter: task.assigneeId || "",
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

      // Notify Integration App after successful creation
      await notifyIntegrationApp(task, auth.customerId);

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
