import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryTree } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Каталог — Light Textiles",
  description: "Повний каталог постільної білизни, рушників та тканин Light Textiles.",
};

export default async function CatalogRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const groups = await getCategoryTree();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        Каталог
      </h1>

      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="mb-5 text-xl font-semibold text-[var(--color-ink)]">
              {(group.name as Record<string, string>)[locale] ?? group.name.uk}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/catalog/${child.slug}`}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
                >
                  {child.image && (
                    <Image
                      src={child.image}
                      alt={(child.name as Record<string, string>)[locale] ?? child.name.uk}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                  <p className="relative text-sm font-semibold text-white drop-shadow-sm">
                    {(child.name as Record<string, string>)[locale] ?? child.name.uk}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
