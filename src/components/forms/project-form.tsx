"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProjectFormProps {
  initialData?: {
    name: string;
    description?: string;
    dueDate?: Date;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    dueDate?: Date;
  }) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function ProjectForm({
  initialData = { name: "", description: "", dueDate: undefined },
  onSubmit,
  onCancel,
  submitButtonText = "Create Project",
  cancelButtonText = "Cancel",
}: ProjectFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData.dueDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        description,
        dueDate,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-700">
          Project Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Label htmlFor="dueDate" className="text-gray-700">
          Due Date
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
          onChange={(e) =>
            setDueDate(e.target.value ? new Date(e.target.value) : undefined)
          }
          className="bg-white border-gray-200 text-gray-900"
        />
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