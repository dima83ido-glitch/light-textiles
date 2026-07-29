import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalized } from "@/lib/get-localized";
import { Reveal } from "@/components/ui/reveal";

export async function PromoBanners() {
  const [banners, locale] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    getLocale(),
  ]);

  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner, i) => {
          const title = getLocalized(banner.title as Record<string, string>, locale);
          const subtitle = banner.subtitle ? getLocalized(banner.subtitle as Record<string, string>, locale) : null;
          const content = (
            <div className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1">
              <Image src={banner.image} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />
              <div className="relative">
                <p className="text-lg font-semibold text-white drop-shadow-sm">{title}</p>
                {subtitle && <p className="text-sm text-white/85">{subtitle}</p>}
              </div>
            </div>
          );
          return (
            <Reveal key={banner.id} delay={i * 0.08}>
              {banner.link ? <Link href={banner.link}>{content}</Link> : content}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
