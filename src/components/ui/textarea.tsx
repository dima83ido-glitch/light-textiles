import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-all duration-200 placeholder:text-[var(--color-ink-soft)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/15",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
