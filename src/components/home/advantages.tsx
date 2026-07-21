"use client";

import { motion } from "framer-motion";
import { Ruler, ShieldCheck, Truck, Percent } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [ShieldCheck, Ruler, Truck, Percent];

export function Advantages() {
  const t = useTranslations("home");
  const items = t.raw("advantagesItems") as { title: string; text: string }[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {t("advantagesTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-white">
                <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">{item.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
