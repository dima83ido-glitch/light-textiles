"use client";

import { useState } from "react";
import Image from "next/image";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";
import { routing } from "@/i18n/routing";
import { LocalizedTextField } from "./localized-field";

type CategoryOption = { id: string; label: string };

function emptyLocaleMap() {
  return Object.fromEntries(routing.locales.map((l) => [l, ""]));
}

export function ProductForm({
  initial,
  categories,
  onSubmit,
}: {
  initial?: Partial<ProductFormState>;
  categories: CategoryOption[];
  onSubmit: (data: ProductFormState) => Promise<void>;
}) {
  const t = useTranslations("admin.products");
  const tCommon = useTranslations("admin.common");
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, control, watch, setValue, formState: { isSubmitting } } =
    useForm<ProductFormState>({
      defaultValues: {
        name: emptyLocaleMap(),
        description: emptyLocaleMap(),
        categoryId: categories[0]?.id ?? "",
        basePrice: 0,
        discountPrice: null,
        availability: "IN_STOCK",
        isVisible: true,
        isFeatured: false,
        images: [],
        variants: [],
        ...initial,
      },
    });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const images = watch("images");

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (res.ok) {
          const json = await res.json();
          uploaded.push(json.url);
        }
      }
      setValue("images", [...images, ...uploaded]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]";
  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-ink-muted)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <LocalizedTextField label={t("nameLabel")} register={register} name="name" required />
        <LocalizedTextField label={t("descriptionLabel")} register={register} name="description" multiline />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className={labelClass}>{t("category")}</label>
          <select className={inputClass} {...register("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("basePrice")}</label>
          <input type="number" className={inputClass} {...register("basePrice", { valueAsNumber: true })} />
        </div>
        <div>
          <label className={labelClass}>{t("discountPrice")}</label>
          <input
            type="number"
            className={inputClass}
            {...register("discountPrice", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
        </div>
        <div>
          <label className={labelClass}>{t("availability")}</label>
          <select className={inputClass} {...register("availability")}>
            <option value="IN_STOCK">{t("availabilityInStock")}</option>
            <option value="OUT_OF_STOCK">{t("availabilityOutOfStock")}</option>
            <option value="ON_ORDER">{t("availabilityOnOrder")}</option>
          </select>
        </div>
      </section>

      <section className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input type="checkbox" className="h-4 w-4" {...register("isVisible")} />
          {t("showOnSite")}
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input type="checkbox" className="h-4 w-4" {...register("isFeatured")} />
          {t("featured")}
        </label>
      </section>

      <section>
        <label className={labelClass}>{t("images")}</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={url + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--color-border)]">
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setValue("images", images.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-accent)]">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">{uploading ? "..." : t("addImageShort")}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>{t("variants")}</label>
          <button
            type="button"
            onClick={() => appendVariant({ name: "", price: 0 })}
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent-strong)]"
          >
            <Plus className="h-3.5 w-3.5" /> {t("addVariant")}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {variantFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input
                placeholder={t("variantNamePlaceholder")}
                className={inputClass}
                {...register(`variants.${i}.name` as const)}
              />
              <input
                type="number"
                placeholder={t("variantPricePlaceholder")}
                className={`${inputClass} w-32`}
                {...register(`variants.${i}.price` as const, { valueAsNumber: true })}
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-fit rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95 disabled:opacity-60"
      >
        {isSubmitting ? tCommon("saving") : tCommon("save")}
      </button>
    </form>
  );
}
