"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Star,
  Image as ImageIcon,
  Home,
  Phone,
  Search,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { demoLogout } from "@/lib/demo-auth-actions";

export function AdminSidebar({ isOwner, name }: { isOwner: boolean; name: string }) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const NAV = [
    { href: "/admin", label: t("nav.dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: t("nav.products"), icon: Package },
    { href: "/admin/categories", label: t("nav.categories"), icon: FolderTree },
    { href: "/admin/orders", label: t("nav.orders"), icon: ShoppingCart },
    { href: "/admin/reviews", label: t("nav.reviews"), icon: Star },
    { href: "/admin/media", label: t("nav.media"), icon: ImageIcon },
    { href: "/admin/homepage", label: t("nav.homepage"), icon: Home },
    { href: "/admin/contacts", label: t("nav.contacts"), icon: Phone },
    { href: "/admin/seo", label: t("nav.seo"), icon: Search },
    { href: "/admin/users", label: t("nav.users"), icon: Users, ownerOnly: true },
    { href: "/admin/account", label: t("nav.account"), icon: UserCircle },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-6 flex items-center gap-2.5 px-2 pt-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-strong)] text-sm font-bold text-white">
          LT
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Light Textiles</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{t("title")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.filter((item) => !item.ownerOnly || isOwner).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-surface-tint)] text-[var(--color-accent-strong)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-subtle)]",
              )}
            >
              <item.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] pt-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="truncate text-xs text-[var(--color-ink-soft)]">{name}</p>
          <ThemeToggle />
        </div>
        <div className="px-3 pb-1">
          <AdminLocaleSwitcher />
        </div>
        <button
          type="button"
          onClick={() => demoLogout()}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-subtle)]"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
          {t("nav.signOut")}
        </button>
      </div>
    </aside>
  );
}
