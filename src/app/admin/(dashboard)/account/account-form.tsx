"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { updateOwnProfile } from "../users/actions";

export function AccountForm({ initial }: { initial: { name: string; email: string } }) {
  const t = useTranslations("admin.account");
  const tc = useTranslations("admin.common");
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: initial.name, email: initial.email, password: "" },
  });

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        setSaved(false);
        await updateOwnProfile({
          name: data.name,
          email: data.email,
          password: data.password ? data.password : undefined,
        });
        setSaved(true);
      })}
      className="flex max-w-md flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("nameLabel")}
        <input required className={inputClass} {...register("name")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("emailLabel")}
        <input required type="email" className={inputClass} {...register("email")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("passwordLabel")}
        <input type="password" placeholder={t("passwordHint")} className={inputClass} {...register("password")} />
      </label>
      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-transform active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? tc("saving") : tc("save")}
        </button>
        {saved && !isSubmitting && (
          <span className="text-sm text-[var(--color-accent-strong)]">{t("saved")}</span>
        )}
      </div>
    </form>
  );
}
