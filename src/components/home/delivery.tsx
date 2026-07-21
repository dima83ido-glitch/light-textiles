"use client";

import { motion } from "framer-motion";
import { Banknote, Package, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = [Truck, Banknote, Package];

export function Delivery() {
  const t = useTranslations("home");
  const items = t.raw("deliveryItems") as { title: string; text: string }[];

  return (
    <section id="delivery" className="bg-[var(--color-surface-subtle)] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {t("deliveryTitle")}
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {items.map((card, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]">
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">{card.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
