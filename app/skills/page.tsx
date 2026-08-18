type Skill = {
  id: string;
  name: string;
  currentLevel: number; // 1-5
  targetLevel: number; // 1-5
};

const skills: Skill[] = [
  { id: "1", name: "Python", currentLevel: 4, targetLevel: 5 },
  { id: "2", name: "ROS", currentLevel: 2, targetLevel: 4 },
  { id: "3", name: "C++", currentLevel: 2, targetLevel: 4 },
  { id: "4", name: "OpenCV", currentLevel: 3, targetLevel: 4 },
  { id: "5", name: "Git", currentLevel: 4, targetLevel: 4 },
];

function LevelDots({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${
            i < level ? "bg-gray-900" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
          + New Skill
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          const gap = skill.targetLevel - skill.currentLevel;
          return (
            <li
              key={skill.id}
              className="rounded-md border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{skill.name}</span>
                {gap > 0 && (
                  <span className="text-xs text-gray-400">
                    Gap: {gap}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Current</span>
                  <LevelDots level={skill.currentLevel} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Target</span>
                  <LevelDots level={skill.targetLevel} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}