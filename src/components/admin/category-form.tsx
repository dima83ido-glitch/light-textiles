"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryFormState } from "@/app/admin/(dashboard)/categories/actions";
import { routing } from "@/i18n/routing";
import { LocalizedTextField, adminInputClass } from "./localized-field";
import { Button } from "@/components/ui/button";

function emptyLocaleMap() {
  return Object.fromEntries(routing.locales.map((l) => [l, ""]));
}

export function CategoryForm({
  initial,
  parentOptions,
  onSubmit,
}: {
  initial?: Partial<CategoryFormState>;
  parentOptions: { id: string; label: string }[];
  onSubmit: (data: CategoryFormState) => Promise<void>;
}) {
  const t = useTranslations("admin.categories");
  const tCommon = useTranslations("admin.common");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<CategoryFormState>({
    defaultValues: {
      name: emptyLocaleMap(),
      parentId: null,
      image: null,
      isVisible: true,
      ...initial,
    },
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
      if (res.ok) {
        const json = await res.json();
        setValue("image", json.url);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-5">
      <LocalizedTextField label={t("nameLabel")} register={register} name="name" required />

      <div>
        <label className={labelClass}>{t("parentCategory")}</label>
        <select
          className={adminInputClass}
          {...register("parentId", { setValueAs: (v) => (v === "" ? null : v) })}
        >
          <option value="">{t("noParent")}</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{t("image")}</label>
        {image ? (
          <div className="group relative h-32 w-32 overflow-hidden rounded-xl border border-[var(--color-border)]">
            <Image src={image} alt="" fill sizes="128px" className="object-cover" />
            <button
              type="button"
              onClick={() => setValue("image", null)}
              aria-label={tCommon("delete")}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent-strong)] focus-within:ring-offset-2">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">{uploading ? "..." : t("upload")}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileSelect} />
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
        <input type="checkbox" className="h-4 w-4" {...register("isVisible")} />
        {t("showOnSite")}
      </label>

      <Button type="submit" disabled={isSubmitting || uploading} className="w-fit">
        {isSubmitting ? tCommon("saving") : tCommon("save")}
      </Button>
    </form>
  );
}
