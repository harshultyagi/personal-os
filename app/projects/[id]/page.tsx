import { notFound } from "next/navigation";
import { Badge, priorityTone, statusTone } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";

type Project = {
  id: string;
  title: string;
  description: string;
  status: "planning" | "active" | "paused" | "completed" | "abandoned";
  priority: "low" | "medium" | "high";
  progress: number;
  skills: string[];
  githubUrl?: string;
};

const projects: Project[] = [
  {
    id: "1",
    title: "Quadruped Robot",
    description: "A four-legged walking robot with a custom gait controller.",
    status: "active",
    priority: "high",
    progress: 70,
    skills: ["Python", "ROS", "Control Systems"],
    githubUrl: "https://github.com/example/quadruped-robot",
  },
  {
    id: "2",
    title: "Vision-Based Robotic Grasp Planner",
    description: "Detects objects and plans grasp points using computer vision.",
    status: "active",
    priority: "high",
    progress: 45,
    skills: ["Python", "OpenCV", "Computer Vision", "Robotics"],
  },
  {
    id: "3",
    title: "Personal OS (this app)",
    description: "The app we're building right now.",
    status: "active",
    priority: "medium",
    progress: 20,
    skills: ["TypeScript", "Next.js"],
  },
];

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        <div className="flex gap-2">
          <Badge label={project.status} tone={statusTone(project.status)} />
          <Badge label={project.priority} tone={priorityTone(project.priority)} />
        </div>
      </div>

      <p className="text-gray-600">{project.description}</p>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Progress
        </h2>
        <ProgressBar progress={project.progress} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <Badge key={skill} label={skill} tone="blue" />
          ))}
        </div>
      </div>

      {project.githubUrl && (
        <a
          href={project.githubUrl}
          className="text-sm text-blue-600 hover:underline"
        >
          View on GitHub →
        </a>
      )}
    </div>
  );
}