import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const inputBaseClass =
  "w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-all duration-200 placeholder:text-[var(--color-ink-soft)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/15";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputBaseClass, className)} {...props} />;
  },
);
Input.displayName = "Input";
