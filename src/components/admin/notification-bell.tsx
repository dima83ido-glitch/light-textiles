"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "NEW_ORDER" | "LOW_STOCK";
  message: string;
  isRead: boolean;
  createdAt: string;
};

const POLL_INTERVAL_MS = 15000;

export function NotificationBell() {
  const t = useTranslations("admin.notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
        aria-label={t("title")}
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lifted)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{t("title")}</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-[var(--color-accent-strong)]">
                {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-ink-soft)]">{t("empty")}</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-[var(--color-border)] px-4 py-3 text-sm last:border-0",
                  !n.isRead && "bg-[var(--color-surface-tint)]",
                )}
              >
                <p className="text-[var(--color-ink)]">{n.message}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
