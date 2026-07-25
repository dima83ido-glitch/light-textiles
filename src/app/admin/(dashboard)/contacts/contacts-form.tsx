"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedTextField } from "@/components/admin/localized-field";
import { updateSiteSettings, type ContactsFormState } from "./actions";

export function ContactsForm({ initial }: { initial: ContactsFormState }) {
  const t = useTranslations("admin.contacts");
  const tCommon = useTranslations("admin.common");
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ContactsFormState>({
    defaultValues: initial,
  });

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]";
  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]";

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await updateSiteSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })}
      className="flex max-w-2xl flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{t("phone")}</label>
          <input className={inputClass} {...register("phone")} />
        </div>
        <div>
          <label className={labelClass}>{t("viberLabel")}</label>
          <input className={inputClass} {...register("viber")} />
        </div>
        <div>
          <label className={labelClass}>{t("email")}</label>
          <input className={inputClass} {...register("email")} />
        </div>
        <div>
          <label className={labelClass}>{t("facebookLabel")}</label>
          <input className={inputClass} {...register("facebookUrl")} />
        </div>
        <div>
          <label className={labelClass}>{t("instagramLabel")}</label>
          <input className={inputClass} {...register("instagramUrl")} />
        </div>
      </div>

      <LocalizedTextField label={t("workingHours")} register={register} name="workingHours" />
      <LocalizedTextField label={t("address")} register={register} name="address" />

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
