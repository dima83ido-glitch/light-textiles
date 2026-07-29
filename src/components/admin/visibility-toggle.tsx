"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function VisibilityToggle({
  id,
  isVisible,
  action,
}: {
  id: string;
  isVisible: boolean;
  action: (id: string, isVisible: boolean) => Promise<void>;
}) {
  const t = useTranslations("admin.common");
  const [optimistic, setOptimistic] = useState(isVisible);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const next = !optimistic;
        setOptimistic(next);
        startTransition(() => {
          action(id, next);
        });
      }}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        optimistic ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]",
      )}
      role="switch"
      aria-checked={optimistic}
      aria-label={t("toggleVisibility")}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-[var(--color-surface)] shadow transition-transform",
          optimistic ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
