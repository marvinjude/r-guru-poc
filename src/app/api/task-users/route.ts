import { NextResponse } from "next/server";
import { TaskUser } from "@/models/task-user";
import { APIHandler, RequestParams } from "@/lib/api-middleware";

interface CreateTaskUserParams extends RequestParams {
  body: {
    email: string;
    fullName?: string;
  };
}

export const GET = APIHandler(async (request, auth) => {
  try {
    const taskUsers = await TaskUser.find().sort({ name: 1 });
    return NextResponse.json(taskUsers);
  } catch (error) {
    console.error("Error fetching task users:", error);
    return NextResponse.json(
      { error: "Failed to fetch task users" },
      { status: 500 }
    );
  }
});

export const POST = APIHandler<CreateTaskUserParams>(
  async (request, auth, requestParams) => {
    try {
      const { email, fullName } = requestParams.body;

      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      const existingUser = await TaskUser.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      const taskUser = await TaskUser.create({
        email,
        fullName,
      });

      return NextResponse.json(taskUser, { status: 201 });
    } catch (error) {
      console.error("Error creating task user:", error);
      return NextResponse.json(
        { error: "Failed to create task user" },
        { status: 500 }
      );
    }
  }
);
