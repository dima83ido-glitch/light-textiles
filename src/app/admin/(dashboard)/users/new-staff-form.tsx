"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createStaffUser } from "./actions";

export function NewStaffForm() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { email: "", name: "", password: "" },
  });

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-5 flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-transform active:scale-95"
      >
        <Plus className="h-4 w-4" /> {t("addAdmin")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createStaffUser(data);
        reset();
        setOpen(false);
      })}
      className="mb-6 flex max-w-md flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("newAdmin")}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[var(--color-ink-soft)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input required placeholder={t("namePlaceholder")} className={inputClass} {...register("name")} />
      <input required type="email" placeholder={t("emailPlaceholder")} className={inputClass} {...register("email")} />
      <input required type="password" placeholder={t("passwordPlaceholder")} className={inputClass} {...register("password")} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-transform active:scale-95 disabled:opacity-60"
      >
        {isSubmitting ? tc("saving") : tc("create")}
      </button>
    </form>
  );
}
