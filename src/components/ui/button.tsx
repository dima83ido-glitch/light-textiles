import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-canvas)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lifted)] hover:-translate-y-0.5",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)]",
  ghost: "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
          variantClass[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
