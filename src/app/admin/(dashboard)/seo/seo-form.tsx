"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedTextField } from "@/components/admin/localized-field";
import { updateGlobalSeo } from "./actions";

export function SeoForm({
  initial,
}: {
  initial: { metaTitle: Record<string, string>; metaDescription: Record<string, string> };
}) {
  const t = useTranslations("admin.seo");
  const tCommon = useTranslations("admin.common");
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: initial });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await updateGlobalSeo(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })}
      className="flex max-w-2xl flex-col gap-4"
    >
      <LocalizedTextField label={t("metaTitle")} register={register} name="metaTitle" />
      <LocalizedTextField label={t("metaDescription")} register={register} name="metaDescription" multiline rows={3} />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? tCommon("saving") : tCommon("save")}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> {tCommon("saved")}
          </span>
        )}
      </div>
    </form>
  );
}
