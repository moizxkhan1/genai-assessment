import { cn } from "@/lib/utils";

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800", className)}>
      <div
        className="h-full bg-zinc-900 transition-all dark:bg-zinc-100"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
