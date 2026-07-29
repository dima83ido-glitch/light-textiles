"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
  Menu,
  X,
} from "lucide-react";
import type { AdminRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useOverlayA11y } from "@/lib/use-overlay-a11y";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { adminLogout } from "@/lib/auth-actions";
import { canView, type Resource } from "@/lib/rbac-policy";
import { LogoMark } from "@/components/brand/logo";

export function AdminSidebar({ role, name }: { role: AdminRole; name: string }) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);
  useOverlayA11y(mobileOpen, () => setMobileOpen(false), drawerRef);

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

  const visibleNav = NAV.filter((item) => !item.resource || canView(role, item.resource));

  const sidebarContent = (
    <>
      <div className="mb-6 flex items-center gap-2 px-2 pt-2">
        <LogoMark className="h-9 w-9" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Light Textiles</p>
          <p className="text-xs text-[var(--color-ink-soft)]">{t("title")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {visibleNav.map((item) => {
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
    </>
  );

  return (
    <>
      {/* Desktop: persistent sidebar, pinned so it doesn't scroll away on long admin pages. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile/tablet: sticky top bar with a hamburger that opens the same nav as a drawer. */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <p className="text-sm font-semibold text-[var(--color-ink)]">{t("title")}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t("nav.menu")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-tint)]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  ref={drawerRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("title")}
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 260 }}
                  className="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col bg-[var(--color-surface)] p-4 shadow-2xl lg:hidden"
                >
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-tint)]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {sidebarContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
