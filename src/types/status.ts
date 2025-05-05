export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
  BLOCKED = "blocked",
  CANCELLED = "cancelled",
}

export interface StatusDisplay {
  label: string;
  color: string;
  icon?: string;
}

export const statusDisplayMap: Record<TaskStatus, StatusDisplay> = {
  [TaskStatus.TODO]: {
    label: "To Do",
    color: "bg-gray-100 text-gray-800",
    icon: "📝",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: "🚀",
  },
  [TaskStatus.DONE]: {
    label: "Done",
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  [TaskStatus.BLOCKED]: {
    label: "Blocked",
    color: "bg-red-100 text-red-800",
    icon: "⛔",
  },
  [TaskStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-gray-200 text-gray-600",
    icon: "❌",
  },
};
