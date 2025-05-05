"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2 } from "lucide-react"

const workspaces = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Tech Solutions" },
  { id: "3", name: "Design Studio" },
]

export function WorkspaceSwitcher() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0].id)

  return (
    <div className="flex items-center space-x-2">
      <div className="flex h-6 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Building2 className="h-4 w-4" />
      </div>
      <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
        <SelectTrigger className="w-[180px] border-none bg-transparent">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 