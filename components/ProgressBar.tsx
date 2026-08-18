type ProgressBarProps = {
  progress: number;
};

function progressColor(progress: number): string {
  if (progress >= 67) return "bg-green-500";
  if (progress >= 34) return "bg-blue-500";
  return "bg-gray-400";
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${progressColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm text-gray-500">
        {progress}%
      </span>
    </div>
  );
}