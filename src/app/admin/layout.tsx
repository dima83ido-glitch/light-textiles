import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);
  return {
    title: `${messages.admin.title} — Light Textiles`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);

  return (
    <div className="min-h-screen bg-[var(--color-surface-subtle)]">
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
