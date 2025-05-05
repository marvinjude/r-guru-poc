import { NextRequest, NextResponse } from "next/server";
import { Project } from "@/models/project";
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

    // Check if project already exists
    const existingProject = await Project.findOne({ externalId });
    if (existingProject) {
      return NextResponse.json(
        { error: "Project with this externalId already exists" },
        { status: 409 }
      );
    }

    // Create new project
    await Project.create({
      ...data.fields,
      externalId,
      origin: DataOrigin.JIRA,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
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

    const project = await Project.findOne({ externalId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update existing project
    Object.assign(project, {
      ...data.fields,
    });
    await project.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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

    await Project.deleteOne({ externalId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing project delete webhook:", error);
    return NextResponse.json(
      { error: "Failed to process project delete webhook" },
      { status: 500 }
    );
  }
}
