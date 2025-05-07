"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { ITaskUser } from "@/models/task-user";
import { IProject } from "@/models/project";
import { useProjects } from "@/hooks/use-projects";

interface TaskFormProps {
  initialData?: {
    title: string;
    description?: string;
    status?: string;
    assigneeId?: string;
    projectId?: string;
  };
  onSubmit: (data: {
    title: string;
    description?: string;
    status?: string;
    assigneeId?: string;
    projectId?: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function TaskForm({
  initialData = {
    title: "",
    description: "",
    status: "todo",
    assigneeId: "",
    projectId: "",
  },
  onSubmit,
  onCancel,
  submitButtonText = "Create Task",
  cancelButtonText = "Cancel",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || "");
  const [status, setStatus] = useState(initialData.status || "todo");
  const [assigneeId, setAssigneeId] = useState(initialData.assigneeId || "");
  const [projectId, setProjectId] = useState(initialData.projectId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taskUsers } = useSWR<ITaskUser[]>("/api/task-users", authenticatedFetcher);
  const { data: projects } = useProjects();

  // Find the selected project's statuses
  const projectStatuses = projects?.find(p => p._id === projectId)?.statuses || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        status,
        assigneeId,
        projectId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-700">
          Task Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-white border-gray-200 text-gray-900"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white border-gray-200 text-gray-900"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="text-gray-700">
          Status
        </Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {projectStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assigneeId" className="text-gray-700">
            Assignee
          </Label>
        </div>
        <Select value={assigneeId} onValueChange={setAssigneeId}>
          <SelectTrigger className="bg-white border-gray-200 text-gray-900">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            {taskUsers?.map((user) => (
              <SelectItem key={user.email} value={user.externalId} className="text-gray-900">
                {user.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="projectId" className="text-gray-700">
            Project
          </Label>
        </div>
        <Select
          value={projectId}
          onValueChange={(value) => setProjectId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-gray-200 text-gray-700 hover:bg-gray-50"
          type="button"
        >
          {cancelButtonText}
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
} 