import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/demo-session";
import { store } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const session = await getSession();
  const locale = await getAdminLocale();
  const [t, tu] = await Promise.all([
    getTranslations({ locale, namespace: "admin.account" }),
    getTranslations({ locale, namespace: "admin.users" }),
  ]);
  const user = session ? store.adminUsers.find((u) => u.id === session.id) : undefined;

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-muted)]">{t("description")}</p>
      <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
        {t("roleLabel")}: <span className="font-medium text-[var(--color-ink)]">{user.role === "OWNER" ? tu("roleOwner") : tu("roleStaff")}</span>
      </p>
      <AccountForm initial={{ name: user.name, email: user.email }} />
    </div>
  );
}
