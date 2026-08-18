import Link from "next/link";
import { Badge, priorityTone, statusTone } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";

type Project = {
  id: string;
  title: string;
  status: "planning" | "active" | "paused" | "completed" | "abandoned";
  priority: "low" | "medium" | "high";
  progress: number;
};

const projects: Project[] = [
  {
    id: "1",
    title: "Quadruped Robot",
    status: "active",
    priority: "high",
    progress: 70,
  },
  {
    id: "2",
    title: "Vision-Based Robotic Grasp Planner",
    status: "active",
    priority: "high",
    progress: 45,
  },
  {
    id: "3",
    title: "Personal OS (this app)",
    status: "active",
    priority: "medium",
    progress: 20,
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
          + New Project
        </button>
      </div>

      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="block rounded-md border border-gray-200 bg-white px-4 py-3 hover:border-gray-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{project.title}</span>
                <div className="flex gap-2">
                  <Badge label={project.status} tone={statusTone(project.status)} />
                  <Badge label={project.priority} tone={priorityTone(project.priority)} />
                </div>
              </div>
              <div className="mt-3">
              <ProgressBar progress={project.progress} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}