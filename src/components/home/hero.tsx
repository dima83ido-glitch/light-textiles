"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-[var(--color-surface-tint)]">
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[var(--color-accent)]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-10%] h-[380px] w-[380px] rounded-full bg-[var(--color-surface)]/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)]/70 px-4 py-1.5 text-xs font-semibold text-[var(--color-accent-ink)] shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {t("heroEyebrow")}
          </span>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--color-ink-muted)]">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/catalog"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-7 py-3.5 text-sm font-semibold text-[var(--color-canvas)] shadow-[var(--shadow-lifted)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              {t("heroCtaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/custom-order"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface)]/80 px-7 py-3.5 text-sm font-semibold text-[var(--color-ink)] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              {t("heroCtaSecondary")}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-md sm:max-w-lg lg:max-w-md"
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] shadow-[var(--shadow-lifted)]">
            <Image
              src="/images/hero-fabric.jpg"
              alt={t("heroImageAlt")}
              fill
              priority
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 448px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/5" />
            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/15" />
          </div>

          <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-[var(--color-surface)]/90 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <p className="text-xs font-medium text-[var(--color-ink-soft)]">{t("heroCardEyebrow")}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{t("heroCardTitle")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
