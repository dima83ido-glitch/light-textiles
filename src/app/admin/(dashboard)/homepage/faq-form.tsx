"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedTextField } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { createFaqItem } from "./actions";

function emptyLocaleMap() {
  return Object.fromEntries(routing.locales.map((l) => [l, ""]));
}

export function FaqForm() {
  const t = useTranslations("admin.homepage");
  const tCommon = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { question: emptyLocaleMap(), answer: emptyLocaleMap() },
  });

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="mb-5">
        <Plus className="h-4 w-4" /> {t("addQuestion")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createFaqItem(data);
        reset();
        setOpen(false);
      })}
      className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("newQuestion")}</p>
        <button type="button" onClick={() => setOpen(false)} aria-label={tCommon("cancel")} className="text-[var(--color-ink-soft)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <LocalizedTextField label={t("questionLabel")} register={register} name="question" required />
      <LocalizedTextField label={t("answerLabel")} register={register} name="answer" multiline rows={3} required />
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? tCommon("saving") : tCommon("add")}
      </Button>
    </form>
  );
}
