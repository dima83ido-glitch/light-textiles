import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";

export async function About() {
  const t = await getTranslations("home");
  const stats = t.raw("aboutStats") as { value: string; label: string }[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal
          direction="left"
          duration={0.6}
          className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-tint)] shadow-[var(--shadow-lifted)]"
        >
          <Image
            src="/images/about-fabric.jpg"
            alt={t("aboutTitle")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal direction="right" duration={0.6} delay={0.1}>
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {t("aboutTitle")}
          </h2>
          <p className="mb-4 text-base leading-relaxed text-[var(--color-ink-muted)]">
            {t("aboutParagraph1")}
          </p>
          <p className="mb-8 text-base leading-relaxed text-[var(--color-ink-muted)]">
            {t("aboutParagraph2")}
          </p>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold text-[var(--color-accent-strong)]">{stat.value}</p>
                <p className="text-xs text-[var(--color-ink-soft)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
