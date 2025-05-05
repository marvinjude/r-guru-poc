"use client";

import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { EditTaskModal } from "@/components/modals/edit-task-modal";
import useSWR from "swr";
import { format } from "date-fns";
import { ITask } from "@/models/task";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { data: tasks = [], mutate } = useSWR<ITask[]>("/api/tasks", authenticatedFetcher);

  const handleDelete = async (taskId: string) => {
    try {
      await authenticatedFetcher(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      // Optimistically update the UI and then revalidate
      await mutate(
        tasks.filter((task) => task._id !== taskId),
        { revalidate: true }
      );

      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
      mutate();
    }
  };


  const getHTMLContent = (content: string) => {
    if (!content) return "";
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, (match) => {
        // Only allow basic HTML tags
        const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'];
        const tag = match.match(/<\/?([a-z]+)/i)?.[1]?.toLowerCase();
        return allowedTags.includes(tag || '') ? match : '';
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        <CreateTaskModal />
      </div>

      <div className="space-y-4">
        {tasks?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        ) : (
          tasks?.map((task) => (
            <div
              key={task._id}
              className="group relative flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                  {task.assigneeId?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    {task.projectId && (
                      <span className="text-sm text-gray-500">Project: {task.projectId}</span>
                    )}
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${task.status === "done"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {task.status === "done"
                        ? "Done"
                        : task.status === "in_progress"
                          ? "In Progress"
                          : "To Do"}
                    </span>
                  </div>
                  {task.description && (
                    <p
                      className="mt-2 text-sm text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: getHTMLContent(task.description)
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  Created {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "Unknown"}
                </div>
                <div className="flex items-center space-x-2">
                  <EditTaskModal task={task} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(task._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 