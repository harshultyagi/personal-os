type BadgeTone = "gray" | "red" | "yellow" | "green" | "blue";

type BadgeProps = {
  label: string;
  tone: BadgeTone;
};

const toneStyles: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({ label, tone }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}

export function priorityTone(priority: "low" | "medium" | "high"): BadgeTone {
  if (priority === "high") return "red";
  if (priority === "medium") return "yellow";
  return "gray";
}

export function statusTone(
  status: "planning" | "active" | "paused" | "completed" | "abandoned"
): BadgeTone {
  if (status === "active") return "blue";
  if (status === "completed") return "green";
  if (status === "paused") return "yellow";
  if (status === "abandoned") return "gray";
  return "gray"; // planning
}