import { notFound } from "next/navigation";
import { Badge, priorityTone, opportunityStatusTone } from "@/components/Badge";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: "internship" | "hackathon" | "research" | "competition" | "job" | "other";
  location: string;
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
  description: string;
  requiredSkills: string[];
  url?: string;
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
    description:
      "Work on perception and control systems for warehouse robots.",
    requiredSkills: ["Python", "ROS", "C++", "Computer Vision"],
    url: "https://example.com/xyz-robotics-internship",
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
    description: "48-hour hackathon focused on applied machine learning.",
    requiredSkills: ["Python", "Machine Learning"],
  },
];

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = opportunities.find((o) => o.id === id);

  if (!opportunity) {
    notFound();
  }

  const days = daysUntil(opportunity.deadline);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{opportunity.title}</h1>
          <p className="text-gray-500">
            {opportunity.organization} · {opportunity.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            label={opportunity.status}
            tone={opportunityStatusTone(opportunity.status)}
          />
          <Badge label={opportunity.priority} tone={priorityTone(opportunity.priority)} />
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Deadline: {opportunity.deadline} ({days} {days === 1 ? "day" : "days"} left)
      </p>

      <p className="text-gray-600">{opportunity.description}</p>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
          Required Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {opportunity.requiredSkills.map((skill) => (
            <Badge key={skill} label={skill} tone="blue" />
          ))}
        </div>
      </div>

      {opportunity.url && (
        <a
          href={opportunity.url}
          className="text-sm text-blue-600 hover:underline"
        >
          View listing →
        </a>
      )}
    </div>
  );
}