"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContactRequestSchema, type ContactRequestInput } from "@/lib/validation/contact";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const t = useTranslations("contactForm");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactRequestInput>({
    resolver: zodResolver(createContactRequestSchema(t)),
  });

  const onSubmit = async (data: ContactRequestInput) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <input placeholder={t("name")} className={inputClass} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <input placeholder={t("phone")} className={inputClass} {...register("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>
      <div>
        <input placeholder={t("email")} className={inputClass} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <textarea placeholder={t("message")} rows={4} className={inputClass} {...register("message")} />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] py-3.5 text-sm font-semibold text-[var(--color-canvas)] shadow-[var(--shadow-lifted)] transition-opacity",
          isSubmitting && "opacity-60",
        )}
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </motion.button>

      {status === "success" && (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t("success")}</p>
      )}
      {status === "error" && <p className="text-sm font-medium text-red-500">{t("error")}</p>}
    </form>
  );
}
