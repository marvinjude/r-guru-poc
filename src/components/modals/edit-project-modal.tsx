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
import { IProject } from "@/models/project";
import { ProjectForm } from "@/components/forms/project-form";

interface EditProjectModalProps {
  project: IProject;
  trigger?: React.ReactNode;
}

export function EditProjectModal({ project, trigger }: EditProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWR<IProject[]>("/api/projects");

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    dueDate?: Date;
  }) => {
    try {
      const response = await authenticatedFetcher<IProject>(
        `/api/projects/${project._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      toast.success("Project updated successfully");
      setIsOpen(false);

      // Optimistically update the cache
      await mutate((data: IProject[] | undefined) => {
        if (!data) return [response];
        return data.map((p) => (p._id === project._id ? response : p));
      }, false);

      // Revalidate the data
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update project"
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
          <DialogTitle className="text-gray-900">Edit Project</DialogTitle>
        </DialogHeader>
        <ProjectForm
          initialData={{
            name: project.name,
            description: project.description,
            dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          submitButtonText="Update Project"
        />
      </DialogContent>
    </Dialog>
  );
} 