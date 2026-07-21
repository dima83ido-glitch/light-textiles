"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/categories";
import { HeaderBadges } from "./header-badges";

export function HeaderNav({
  groups,
  extraLinks,
}: {
  groups: NavCategory[];
  extraLinks: { href: string; label: string }[];
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  return (
    <nav className="relative">
      <div className="hidden items-center gap-1 lg:flex">
        {groups.map((group) => (
          <div
            key={group.id}
            className="relative"
            onMouseEnter={() => setOpenGroup(group.id)}
            onMouseLeave={() => setOpenGroup((cur) => (cur === group.id ? null : cur))}
          >
            <Link
              href={`/catalog/${group.slug}`}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
            >
              {group.name.uk}
              {group.children.length > 0 && (
                <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
              )}
            </Link>

            <AnimatePresence>
              {openGroup === group.id && group.children.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-0 top-full z-40 grid w-72 gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-lifted)] backdrop-blur-md"
                >
                  {group.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/catalog/${child.slug}`}
                      className="rounded-[var(--radius-control)] px-4 py-2.5 text-sm text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]"
                    >
                      {child.name.uk}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {extraLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-tint)] hover:text-[var(--color-accent-strong)]",
              pathname === link.href && "text-[var(--color-accent-strong)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <HeaderBadges />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
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
                  className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileOpen(false)}
                />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-[var(--color-surface)] p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-semibold">Меню</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-surface-tint)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <div key={group.id}>
                    <Link
                      href={`/catalog/${group.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-semibold text-[var(--color-ink)]"
                    >
                      {group.name.uk}
                    </Link>
                    {group.children.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1 border-l border-[var(--color-border)] pl-3">
                        {group.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/catalog/${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="py-1.5 text-sm text-[var(--color-ink-muted)]"
                          >
                            {child.name.uk}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
                  {extraLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-[var(--color-ink)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </nav>
  );
}
