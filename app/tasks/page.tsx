import { Badge, priorityTone, taskStatusTone } from "@/components/Badge";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  projectTitle?: string;
  opportunityTitle?: string;
};

const tasks: Task[] = [
  {
    id: "1",
    title: "Implement object detection",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-08-25",
    projectTitle: "Vision-Based Robotic Grasp Planner",
  },
  {
    id: "2",
    title: "Complete ROS publisher/subscriber tutorial",
    status: "todo",
    priority: "high",
    dueDate: "2026-08-22",
    opportunityTitle: "Robotics Intern",
  },
  {
    id: "3",
    title: "Study Thermodynamics — Chapter 4",
    status: "todo",
    priority: "medium",
    dueDate: "2026-08-24",
  },
  {
    id: "4",
    title: "Set up navbar and routing",
    status: "done",
    priority: "low",
    projectTitle: "Personal OS (this app)",
  },
];



export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
          + New Task
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="rounded-md border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  task.status === "done"
                    ? "text-gray-400 line-through"
                    : "font-medium"
                }
              >
                {task.title}
              </span>
              <div className="flex gap-2">
                <Badge label={task.status} tone={taskStatusTone(task.status)} />
                <Badge label={task.priority} tone={priorityTone(task.priority)} />
              </div>
            </div>
            {(task.projectTitle || task.opportunityTitle || task.dueDate) && (
              <div className="mt-2 flex gap-3 text-xs text-gray-500">
                {task.projectTitle && <span>📁 {task.projectTitle}</span>}
                {task.opportunityTitle && <span>💼 {task.opportunityTitle}</span>}
                {task.dueDate && <span>Due {task.dueDate}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}