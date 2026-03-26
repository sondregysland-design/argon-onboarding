interface ProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ completed, total, showLabel = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
          {completed}/{total} ({percentage}%)
        </span>
      )}
    </div>
  );
}
