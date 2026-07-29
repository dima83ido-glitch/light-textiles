"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { adminInputClass } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { createReview } from "./actions";

export function NewReviewForm() {
  const t = useTranslations("admin.reviews");
  const tCommon = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { authorName: "", rating: 5, text: "" },
  });

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="mb-5">
        <Plus className="h-4 w-4" /> {t("addReview")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createReview({ ...data, rating: Number(data.rating) });
        reset();
        setOpen(false);
      })}
      className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("newReview")}</p>
        <button type="button" onClick={() => setOpen(false)} aria-label={tCommon("cancel")} className="text-[var(--color-ink-soft)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input required placeholder={t("authorPlaceholder")} className={adminInputClass} {...register("authorName")} />
        <select className={adminInputClass} {...register("rating")}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {t("starsOption", { count: r })}
            </option>
          ))}
        </select>
      </div>
      <textarea required rows={3} placeholder={t("textPlaceholder")} className={adminInputClass} {...register("text")} />
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? tCommon("saving") : tCommon("add")}
      </Button>
    </form>
  );
}
