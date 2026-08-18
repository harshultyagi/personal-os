import { Badge,priorityTone } from "@/components/Badge";

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
};

type Deadline = {
  id: string;
  label: string;
  daysLeft: number;
};

type ProjectSummary = {
  id: string;
  title: string;
  progress: number;
};

const todayTasks: Task[] = [
  { id: "1", title: "Finish gait controller", priority: "high" },
  { id: "2", title: "Apply to robotics internship", priority: "high" },
  { id: "3", title: "Study Thermodynamics", priority: "medium" },
];

const upcomingDeadlines: Deadline[] = [
  { id: "1", label: "Internship deadline", daysLeft: 4 },
  { id: "2", label: "Exam", daysLeft: 8 },
];

const projects: ProjectSummary[] = [
  { id: "1", title: "Quadruped Robot", progress: 70 },
  { id: "2", title: "Grasp Planner", progress: 45 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
          Today — High Priority
        </h2>
        <ul className="space-y-2">
          {todayTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2"
            >
              <span>{task.title}</span>
              <Badge label={task.priority} tone={priorityTone(task.priority)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
          Upcoming
        </h2>
        <ul className="space-y-2">
          {upcomingDeadlines.map((deadline) => (
            <li
              key={deadline.id}
              className="rounded-md border border-gray-200 bg-white px-4 py-2"
            >
              {deadline.label} — {deadline.daysLeft} days
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
          Projects
        </h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-md border border-gray-200 bg-white px-4 py-2"
            >
              <div className="flex justify-between">
                <span>{project.title}</span>
                <span className="text-gray-500">{project.progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gray-900"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}