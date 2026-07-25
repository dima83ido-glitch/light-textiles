import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "Light Textiles",
  description: "Лайт Текстиль — постільна білизна та тканини",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${golosText.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="light-textiles-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
