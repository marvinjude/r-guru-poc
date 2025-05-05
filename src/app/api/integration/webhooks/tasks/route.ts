import { NextRequest, NextResponse } from "next/server";
import { Task } from "@/models/task";
import { verifyIntegrationAppToken } from "@/lib/integration-token";
import { DataOrigin } from "@/models/common";

interface WebhookPayload {
  externalId: string;
  data: {
    fields: Record<string, unknown>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyIntegrationAppToken(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { externalId, data } = payload as WebhookPayload;

    if (!externalId) {
      return NextResponse.json(
        { error: "externalId is required" },
        { status: 400 }
      );
    }

    // Check if task already exists
    const existingTask = await Task.findOne({ externalId });
    if (existingTask) {
      return NextResponse.json(
        { error: "Task with this externalId already exists" },
        { status: 409 }
      );
    }

    await Task.create({
      ...data.fields,
      externalId,
      origin: DataOrigin.JIRA,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyIntegrationAppToken(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { externalId, data } = payload as WebhookPayload;

    if (!externalId) {
      return NextResponse.json(
        { error: "externalId is required" },
        { status: 400 }
      );
    }

    const task = await Task.findOne({ externalId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update existing task
    Object.assign(task, {
      ...data.fields,
    });
    await task.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyIntegrationAppToken(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { externalId } = payload as WebhookPayload;

    if (!externalId) {
      return NextResponse.json(
        { error: "externalId is required" },
        { status: 400 }
      );
    }

    await Task.deleteOne({ externalId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing task delete webhook:", error);
    return NextResponse.json(
      { error: "Failed to process task delete webhook" },
      { status: 500 }
    );
  }
}
