"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteMediaAsset } from "./actions";

export function MediaGridItem({ id, url, filename }: { id: string; url: string; filename: string }) {
  const t = useTranslations("admin.media");
  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="relative aspect-square">
        <Image src={url} alt={filename} fill sizes="200px" className="object-cover" />
      </div>
      <div className="flex items-center justify-between gap-1 p-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-subtle)]"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("copied") : t("urlLabel")}
        </button>
        <DeleteButton id={id} action={deleteMediaAsset} />
      </div>
    </div>
  );
}
