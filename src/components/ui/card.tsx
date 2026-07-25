import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, hoverLift = false, ...props }: HTMLAttributes<HTMLDivElement> & { hoverLift?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)] transition-all duration-300",
        hoverLift && "hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]",
        className,
      )}
      {...props}
    />
  );
}
