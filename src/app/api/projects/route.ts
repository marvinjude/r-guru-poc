import { NextResponse } from "next/server";
import { Project } from "@/models/project";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import { DataOrigin } from "@/models/common";

interface CreateProjectParams extends RequestParams {
  body: {
    name: string;
    description?: string;
    dueDate?: Date;
  };
}

export const POST = APIHandler<CreateProjectParams>(
  async (request, auth, requestParams) => {
    try {
      const { name, description, dueDate } = requestParams.body;

      if (!name) {
        return NextResponse.json(
          { error: "Project name is required" },
          { status: 400 }
        );
      }

      const project = await Project.create({
        name,
        description,
        dueDate,
        origin: DataOrigin.APP,
      });

      return NextResponse.json(project, { status: 201 });
    } catch (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }
  }
);

export const GET = APIHandler<RequestParams>(async () => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
});
