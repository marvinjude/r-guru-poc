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
    console.log(`Fetching records for action: ${actionKey}`);
    const result = await client
      .connection(integrationKey)
      .action(actionKey)
      .run({ cursor });

    const nextCursor = result.output.cursor;
    const records = result.output.records as {
      fields: Record<string, unknown>;
    }[];

    console.log(`Received ${records.length} records from Integration App`);
    
    if (actionKey === 'get-projects') {
      // For each project, fetch its statuses
      for (const record of records) {
        try {
          const statusResult = await client
            .connection(integrationKey)
            .action('list-status')
            .run({ projectId: record.fields.id });

          record.fields.statuses = statusResult.output.records.map((status: any) => ({
            id: status.fields.id,
            name: status.fields.name
          }));
        } catch (error) {
          console.error(`Failed to fetch statuses for project ${record.fields.id}:`, error);
        }
      }
    }

    const recordsToCreate = records.map((record) => {
      const fields = record.fields;
      // Map assigneeId to userId if it exists
      return {
        ...fields,
        userId: fields.assigneeId || null,
        // Ensure we're using externalId as the unique identifier
        externalId: fields.id,
        // Keep track of the original ID
        originalId: fields.id,
      };
    });

    // Log the first few records to inspect their structure
    console.log(`Sample records for ${actionKey}:`, 
      JSON.stringify(recordsToCreate.slice(0, 2), null, 2)
    );

    // Validate records before processing
    const validRecords = recordsToCreate.filter(record => {
      const isValid = record.externalId != null;
      if (!isValid) {
        console.warn(`Invalid record found in ${actionKey}:`, record);
      }
      return isValid;
    });

    // Bulk update all tasks at once
    if (validRecords.length > 0) {
      console.log(`Attempting to write ${validRecords.length} records to ${model.modelName}`);
      
      try {
        const bulkOps = validRecords.map((record) => ({
          updateOne: {
            filter: {
              externalId: record.externalId,
            },
            update: { 
              $set: { 
                ...record,
                origin: integrationKey,
              }
            },
            upsert: true,
          },
        }));

        const result = await model.bulkWrite(bulkOps);
        console.log(`Bulk write result for ${actionKey}:`, {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          upserted: result.upsertedCount
        });
      } catch (error) {
        console.error(`Error during bulk write for ${actionKey}:`, {
          error: error.message,
          code: error.code,
          writeErrors: error.writeErrors
        });
        throw error;
      }
    }

    if (!nextCursor) {
      console.log(`Completed syncing ${actionKey}`);
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

      console.log(`Starting sync for integration: ${integrationKey}`);

      const client = await getIntegrationClient(auth);
      const connectionsResponse = await client.connections.find({
        integrationKey,
      });

      const connection = connectionsResponse.items[0];

      if (!connection) {
        console.warn(`No connection found for integration key: ${integrationKey}`);
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404 }
        );
      }

      // Log the sync order and timing
      console.log('Starting task sync...');
      await fetchAndCreateRecords(client, integrationKey, "get-tasks", Task);
      
      console.log('Starting project sync...');
      await fetchAndCreateRecords(client, integrationKey, "get-projects", Project);
      
      console.log('Starting user sync...');
      await fetchAndCreateRecords(client, integrationKey, "get-users", TaskUser);

      console.log('Sync completed successfully');
      return NextResponse.json({
        success: true,
        message: "Tasks synced successfully",
      });
    } catch (error) {
      console.error("Error in sync operation:", {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      return NextResponse.json(
        { error: "Failed to sync tasks" },
        { status: 500 }
      );
    }
  }
);
