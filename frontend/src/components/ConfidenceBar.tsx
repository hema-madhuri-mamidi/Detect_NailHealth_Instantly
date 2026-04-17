import { cn } from "@/lib/utils";

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function fillColorClass(pct: number): string {
  if (pct >= 85) return "bg-green-600";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

type ConfidenceBarProps = {
  /** Confidence in 0–100 (already scaled from API). */
  confidence: number;
  className?: string;
};

/**
 * Horizontal confidence bar: gray track, colored fill by level, percentage beside the bar.
 */
export function ConfidenceBar({ confidence, className }: ConfidenceBarProps) {
  const pct = clampConfidence(confidence);
  const fill = fillColorClass(pct);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3",
        className
      )}
    >
      <div
        className="h-3 min-h-[12px] min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence ${pct.toFixed(2)} percent`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            fill
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-foreground sm:min-w-[4.5rem] sm:text-right">
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}
