"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function DeleteButton({
  id,
  action,
  confirmText,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmText?: string;
}) {
  const t = useTranslations("admin.common");
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-[var(--color-ink-soft)]">{confirmText ?? t("confirmDelete")}</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => action(id))}
          className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-all duration-150 active:scale-95"
        >
          {t("yes")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-subtle)]"
        >
          {t("no")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
      aria-label={t("delete")}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
