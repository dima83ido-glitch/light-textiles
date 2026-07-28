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
  Warehouse,
} from "lucide-react";
import type { AdminRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { adminLogout } from "@/lib/auth-actions";
import { canView, type Resource } from "@/lib/rbac-policy";
import { LogoMark } from "@/components/brand/logo";

export function AdminSidebar({ role, name }: { role: AdminRole; name: string }) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  const NAV: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; resource?: Resource }[] = [
    { href: "/admin", label: t("nav.dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: t("nav.products"), icon: Package, resource: "products" },
    { href: "/admin/categories", label: t("nav.categories"), icon: FolderTree, resource: "categories" },
    { href: "/admin/orders", label: t("nav.orders"), icon: ShoppingCart, resource: "orders" },
    { href: "/admin/warehouses", label: t("nav.warehouses"), icon: Warehouse, resource: "warehouses" },
    { href: "/admin/reviews", label: t("nav.reviews"), icon: Star, resource: "reviews" },
    { href: "/admin/media", label: t("nav.media"), icon: ImageIcon, resource: "media" },
    { href: "/admin/homepage", label: t("nav.homepage"), icon: Home, resource: "homepage" },
    { href: "/admin/contacts", label: t("nav.contacts"), icon: Phone, resource: "contacts" },
    { href: "/admin/seo", label: t("nav.seo"), icon: Search, resource: "seo" },
    { href: "/admin/users", label: t("nav.users"), icon: Users, resource: "users" },
    { href: "/admin/account", label: t("nav.account"), icon: UserCircle },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-6 flex items-center gap-2 px-2 pt-2">
        <LogoMark className="h-9 w-9" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Light Textiles</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{t("title")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.filter((item) => !item.resource || canView(role, item.resource)).map((item) => {
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
          onClick={() => adminLogout()}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-subtle)]"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
          {t("nav.signOut")}
        </button>
      </div>
    </aside>
  );
}
