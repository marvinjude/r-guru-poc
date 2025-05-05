"use client";

import { CreateWorkspaceUserModal } from "@/components/modals/create-workspace-user-modal";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import useSWR from "swr";
import { ITaskUser } from "@/models/task-user";

export default function WorkspaceUsersPage() {
  const { data: taskUsers } = useSWR<ITaskUser[]>("/api/task-users", authenticatedFetcher, {
    revalidateOnFocus: false,
  });



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <CreateWorkspaceUserModal />
      </div>

      <div className="space-y-4">
        {taskUsers?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found. Add your first user!</p>
          </div>
        ) : (
          taskUsers?.map((user) => (
            <div
              key={user.email}
              className="group relative flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-base font-medium text-gray-600">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  Added {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 