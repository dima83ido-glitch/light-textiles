"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Plus, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedTextField, adminInputClass } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { createBanner } from "./actions";

function emptyLocaleMap() {
  return Object.fromEntries(routing.locales.map((l) => [l, ""]));
}

export function BannerForm() {
  const t = useTranslations("admin.homepage");
  const tCommon = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { title: emptyLocaleMap(), subtitle: emptyLocaleMap(), image: "", link: "" },
  });
  const image = watch("image");

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) setValue("image", (await res.json()).url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="mb-5">
        <Plus className="h-4 w-4" /> {t("addBanner")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createBanner(data);
        reset();
        setOpen(false);
      })}
      className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("newBanner")}</p>
        <button type="button" onClick={() => setOpen(false)} aria-label={tCommon("cancel")} className="text-[var(--color-ink-soft)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      {image ? (
        <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-xl border border-[var(--color-border)]">
          <Image src={image} alt="" fill sizes="320px" className="object-cover" />
        </div>
      ) : (
        <label className="flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-ink-soft)] focus-within:ring-2 focus-within:ring-[var(--color-accent-strong)] focus-within:ring-offset-2">
          <Upload className="h-5 w-5" />
          <span className="text-[11px]">{uploading ? "..." : t("uploadImage")}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} />
        </label>
      )}

      <LocalizedTextField label={t("titleLabel")} register={register} name="title" required />
      <LocalizedTextField label={t("subtitleLabel")} register={register} name="subtitle" />
      <input placeholder={t("linkPlaceholder")} className={adminInputClass} {...register("link")} />

      <Button type="submit" disabled={isSubmitting || uploading || !image} className="w-fit">
        {isSubmitting ? tCommon("saving") : tCommon("add")}
      </Button>
    </form>
  );
}
