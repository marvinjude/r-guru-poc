import { NextRequest, NextResponse } from "next/server";
import { TaskUser } from "@/models/task-user";
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

    // Check if task user already exists
    const existingTaskUser = await TaskUser.findOne({ externalId });
    if (existingTaskUser) {
      return NextResponse.json(
        { error: "Task user with this externalId already exists" },
        { status: 409 }
      );
    }

    // Create new task user
    await TaskUser.create({
      ...data.fields,
      externalId,
      origin: DataOrigin.JIRA,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating task user:", error);
    return NextResponse.json(
      { error: "Failed to create task user" },
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

    const taskUser = await TaskUser.findOne({ externalId });
    if (!taskUser) {
      return NextResponse.json(
        { error: "Task user not found" },
        { status: 404 }
      );
    }

    // Update existing task user
    Object.assign(taskUser, {
      ...data.fields,
    });
    await taskUser.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating task user:", error);
    return NextResponse.json(
      { error: "Failed to update task user" },
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

    await TaskUser.deleteOne({ externalId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing task user delete webhook:", error);
    return NextResponse.json(
      { error: "Failed to process task user delete webhook" },
      { status: 500 }
    );
  }
}
