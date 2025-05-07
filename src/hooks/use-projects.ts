import useSWR from "swr";
import { authenticatedFetcher } from "@/lib/fetch-utils";
import { IProject } from "@/models/project";

export function useProjects() {
  return useSWR<IProject[]>("/api/projects", authenticatedFetcher);
} 