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
import { ProjectForm } from "@/components/forms/project-form";
import { IProject } from "@/models/project";

interface CreateProjectModalProps {
  trigger?: React.ReactNode;
}

export function CreateProjectModal({ trigger }: CreateProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useSWR<IProject[]>("/api/projects");

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    dueDate?: Date;
  }) => {
    try {
      const response = await authenticatedFetcher<IProject>("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      toast.success("Project created successfully");
      setIsOpen(false);

      // Optimistically update the cache
      await mutate((data: IProject[] | undefined) => {
        if (!data) return [response];
        return [...data, response];
      }, false);

      // Revalidate the data
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
      );
      mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-blue-600 text-white hover:bg-blue-700">Create Project</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Create New Project</DialogTitle>
        </DialogHeader>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 