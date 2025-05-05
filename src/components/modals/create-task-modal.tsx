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
import { TaskForm } from "@/components/forms/task-form";
import { ITask } from "@/models/task";

interface CreateTaskModalProps {
  trigger?: React.ReactNode;
  projectId?: string;
}

export function CreateTaskModal({ trigger, projectId }: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWR<ITask[]>("/api/tasks");

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    status?: string;
    assigneeId?: string;
    projectId?: string;
  }) => {
    try {
      const response = await authenticatedFetcher<ITask>("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          projectId: projectId || data.projectId,
        }),
      });

      toast.success("Task created successfully");
      setIsOpen(false);

      // Optimistically update the cache
      await mutate((data: ITask[] | undefined) => {
        if (!data) return [response];
        return [...data, response];
      }, false);

      // Revalidate the data
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task"
      );
      mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-blue-600 text-white hover:bg-blue-700">Create Task</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          initialData={{
            title: "",
            description: "",
            status: "todo",
            assigneeId: "",
            projectId: projectId || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 