"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContactRequestSchema, type ContactRequestInput } from "@/lib/validation/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="contact-name" className="sr-only">
          {t("name")}
        </label>
        <Input id="contact-name" placeholder={t("name")} {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="contact-phone" className="sr-only">
          {t("phone")}
        </label>
        <Input id="contact-phone" placeholder={t("phone")} {...register("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>
      <div>
        <label htmlFor="contact-email" className="sr-only">
          {t("email")}
        </label>
        <Input id="contact-email" placeholder={t("email")} {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="contact-message" className="sr-only">
          {t("message")}
        </label>
        <Textarea id="contact-message" placeholder={t("message")} rows={4} {...register("message")} />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <Send className="h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            {t("success")}
          </motion.p>
        )}
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-red-500"
          >
            {t("error")}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
