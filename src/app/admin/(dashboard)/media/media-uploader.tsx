"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";

export function MediaUploader() {
  const t = useTranslations("admin.media");
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch("/api/admin/upload", { method: "POST", body: formData });
      }
      router.refresh();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="mb-6 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-all duration-200 active:scale-95">
      <Upload className="h-4 w-4" />
      {uploading ? t("uploading") : t("uploadFiles")}
      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
    </label>
  );
}
