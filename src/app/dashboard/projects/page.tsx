"use client";

import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { EditProjectModal } from "@/components/modals/edit-project-modal";
import useSWR from "swr";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { IProject } from "@/models/project";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";


export default function ProjectsPage() {
  const { data: projects = [], isLoading, mutate } = useSWR<IProject[]>("/api/projects", authenticatedFetcher);

  const handleDelete = async (projectId: string) => {
    try {
      await authenticatedFetcher(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      // Optimistically update the UI and then revalidate
      await mutate(
        (data) => data?.filter((project) => project._id !== projectId),
        { revalidate: true }
      );

      toast.success("Project deleted successfully");
    } catch {
      toast.error("Failed to delete project");

      mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <CreateProjectModal />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <CreateProjectModal />
      </div>

      <div className="space-y-4">
        {projects?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found. Create your first project!</p>
          </div>
        ) : (
          projects?.map((project) => (
            <div
              key={project._id}
              className="group relative flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  {project.dueDate && (
                    <span>Due {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Created {format(new Date(project.createdAt), "MMM d, yyyy")}
                </div>
                <div className="flex items-center space-x-2">
                  <EditProjectModal project={project} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(project._id)}
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