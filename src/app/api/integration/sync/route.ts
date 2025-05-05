import { NextResponse } from "next/server";
import { getIntegrationClient } from "@/lib/integration-app-client";
import { APIHandler, RequestParams } from "@/lib/api-middleware";
import { IntegrationAppClient } from "@integration-app/sdk";
import { Model } from "mongoose";
import { Task } from "@/models/task";
import { Project } from "@/models/project";
import { TaskUser } from "@/models/task-user";

interface SyncTasksParams extends RequestParams {
  body?: {
    integrationKey: string;
  };
}

/**
 * Here, we'll sync
 * - Tasks
 * - Task Users
 * - Projects
 */

async function fetchAndCreateRecords<T>(
  client: IntegrationAppClient,
  integrationKey: string,
  actionKey: string,
  model: Model<T>
) {
  let cursor: string | undefined;

  do {
    const result = await client
      .connection(integrationKey)
      .action(actionKey)
      .run({ cursor });

    const nextCursor = result.output.cursor;
    const records = result.output.records as {
      fields: Record<string, unknown>;
    }[];

    const recordsToCreate = records.map((record) => record.fields);

    // Bulk update all tasks at once
    if (recordsToCreate.length > 0) {
      await model.bulkWrite(
        recordsToCreate.map((record) => {
          return {
            updateOne: {
              filter: {
                externalId: record.id,
              },
              update: { $set: { ...record, origin: integrationKey } },
              upsert: true,
            },
          };
        })
      );
    }

    if (!nextCursor) {
      break;
    }
    cursor = nextCursor;
  } while (true);
}

export const POST = APIHandler<SyncTasksParams>(
  async (request, auth, params) => {
    try {
      const { integrationKey } = params.body || {};

      if (!integrationKey) {
        return NextResponse.json(
          { error: "Integration key is required" },
          { status: 400 }
        );
      }

      const client = await getIntegrationClient(auth);
      const connectionsResponse = await client.connections.find({
        integrationKey,
      });

      const connection = connectionsResponse.items[0];

      if (!connection) {
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404 }
        );
      }

      await fetchAndCreateRecords(client, integrationKey, "get-tasks", Task);
      await fetchAndCreateRecords(
        client,
        integrationKey,
        "get-projects",
        Project
      );
      await fetchAndCreateRecords(
        client,
        integrationKey,
        "get-users",
        TaskUser
      );

      return NextResponse.json({
        success: true,
        message: "Tasks synced successfully",
      });
    } catch (error) {
      console.error("Error syncing tasks:", error);
      return NextResponse.json(
        { error: "Failed to sync tasks" },
        { status: 500 }
      );
    }
  }
);
