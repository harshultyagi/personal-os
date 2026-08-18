import Link from "next/link";
import { Badge, priorityTone, opportunityStatusTone } from "@/components/Badge";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: "internship" | "hackathon" | "research" | "competition" | "job" | "other";
  location: string; // e.g. "Remote", "Bangalore, India", "Berlin, Germany"
  deadline: string;
  status:
    | "interested"
    | "preparing"
    | "applied"
    | "interview"
    | "accepted"
    | "rejected"
    | "closed";
  priority: "low" | "medium" | "high";
  requiredSkills: string[];
};

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Robotics Intern",
    organization: "XYZ Robotics",
    type: "internship",
    location: "Munich, Germany",
    deadline: "2026-09-20",
    status: "preparing",
    priority: "high",
    requiredSkills: ["Python", "ROS", "C++", "Computer Vision"],
  },
  {
    id: "2",
    title: "AI Hackathon",
    organization: "TechFest",
    type: "hackathon",
    location: "Remote",
    deadline: "2026-09-05",
    status: "interested",
    priority: "medium",
    requiredSkills: ["Python", "Machine Learning"],
  },
];

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Opportunities</h1>
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
          + New Opportunity
        </button>
      </div>

      <ul className="space-y-3">
        {opportunities.map((opp) => {
          const days = daysUntil(opp.deadline);
          return (
            <li key={opp.id}>
              <Link
                href={`/opportunities/${opp.id}`}
                className="block rounded-md border border-gray-200 bg-white px-4 py-3 hover:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{opp.title}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {opp.organization} - {opp.location}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      label={opp.status}
                      tone={opportunityStatusTone(opp.status)}
                    />
                    <Badge label={opp.priority} tone={priorityTone(opp.priority)} />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Deadline in {days} {days === 1 ? "day" : "days"}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}