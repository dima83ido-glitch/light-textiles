"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPages");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <TriangleAlert className="h-7 w-7" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">{t("errorTitle")}</h1>
        <p className="text-[var(--color-ink-muted)]">{t("errorDescription")}</p>
      </div>
      <button type="button" onClick={reset} className={buttonClass()}>
        {t("errorRetry")}
      </button>
    </div>
  );
}
