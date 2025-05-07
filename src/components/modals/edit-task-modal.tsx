"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import useSWR from "swr";
import { ITask } from "@/models/task";
import { TaskForm } from "@/components/forms/task-form";

interface EditTaskModalProps {
  task: ITask;
  trigger?: React.ReactNode;
}

export function EditTaskModal({ task, trigger }: EditTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWR<ITask[]>("/api/tasks", authenticatedFetcher);

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    status?: string;
    assigneeId?: string;
    projectId?: string;
  }) => {
    try {
      const response = await authenticatedFetcher<ITask>(
        `/api/tasks/${task._id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );

      toast.success("Task updated successfully");
      setIsOpen(false);

      // Update cache
      await mutate((data: ITask[] | undefined) => {
        if (!data) return [response];
        return data.map((t) => (t._id === task._id ? response : t));
      }, false);
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task"
      );
      mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-blue-500 hover:bg-blue-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          initialData={{
            title: task.title,
            description: task.description,
            status: task.status,
            assigneeId: task.assigneeId,
            projectId: task.projectId,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          submitButtonText="Update Task"
        />
      </DialogContent>
    </Dialog>
  );
} 