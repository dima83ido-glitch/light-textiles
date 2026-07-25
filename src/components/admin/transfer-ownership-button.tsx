"use client";

import { useState, useTransition } from "react";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

export function TransferOwnershipButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<void>;
}) {
  const t = useTranslations("admin.users");
  const tc = useTranslations("admin.common");
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-[var(--color-ink-soft)]">{t("transferConfirmText")}</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => action(id))}
          className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold text-white transition-all duration-150 active:scale-95"
        >
          {t("transferButton")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-subtle)]"
        >
          {tc("cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
      aria-label={t("transferOwnership")}
      title={t("transferOwnership")}
    >
      <Crown className="h-4 w-4" />
    </button>
  );
}
