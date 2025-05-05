import { NextResponse } from "next/server";
import { Project } from "@/models/project";
import { APIHandler, RequestParams } from "@/lib/api-middleware";

interface DeleteProjectParams extends RequestParams {
  params: {
    projectId: string;
  };
}

interface UpdateProjectParams extends RequestParams {
  params: {
    projectId: string;
  };
  body: {
    name?: string;
    description?: string;
    dueDate?: Date;
  };
}

export const PATCH = APIHandler<UpdateProjectParams>(
  async (request, auth, requestParams) => {
    try {
      const { projectId } = requestParams.params;
      const { name, description, dueDate } = requestParams.body;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (dueDate !== undefined) project.dueDate = dueDate;

      await project.save();

      return NextResponse.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = APIHandler<DeleteProjectParams>(
  async (request, auth, requestParams) => {
    try {
      const { projectId } = requestParams.params;

      if (!projectId) {
        return NextResponse.json(
          { error: "Project ID is required" },
          { status: 400 }
        );
      }

      const project = await Project.findByIdAndDelete(projectId);

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
      );
    }
  }
);
