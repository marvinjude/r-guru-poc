import { Metadata } from "next"
import { redirect } from 'next/navigation';


export const metadata: Metadata = {
  title: "Tasks",
  description: "Manage your tasks and assignments",
}

export default function DashboardPage() {
  redirect('/dashboard/projects');
} 