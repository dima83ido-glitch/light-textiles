import { redirect } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { roleMessageKey } from "@/lib/role-label";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { TransferOwnershipButton } from "@/components/admin/transfer-ownership-button";
import { NewStaffForm } from "./new-staff-form";
import { toggleStaffActive, deleteStaffUser, transferOwnership } from "./actions";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (session?.role !== "OWNER") redirect("/admin");

  const locale = await getAdminLocale();
  const [t, tc, users] = await Promise.all([
    getTranslations({ locale, namespace: "admin.users" }),
    getTranslations({ locale, namespace: "admin.common" }),
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const currentId = session.id;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("title")}</h1>
      <NewStaffForm />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-left text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">{t("columnName")}</th>
              <th className="px-4 py-3 font-medium">{t("columnEmail")}</th>
              <th className="px-4 py-3 font-medium">{t("columnRole")}</th>
              <th className="px-4 py-3 font-medium">{t("columnStatus")}</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">
                  {t("notFound")}
                </td>
              </tr>
            )}
            {users.map((user) => {
              const isSelf = user.id === currentId;
              return (
                <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-3 text-[var(--color-ink)]">
                    {user.name}
                    {isSelf && <span className="ml-1 text-[var(--color-ink-soft)]">{t("you")}</span>}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)]">{user.email}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-muted)]">{t(roleMessageKey(user.role))}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-[var(--color-ink-soft)]">—</span>
                    ) : (
                      <VisibilityToggle id={user.id} isVisible={user.isActive} action={toggleStaffActive} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-ink)]"
                        aria-label={tc("edit")}
                        title={tc("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {!isSelf && (
                        <TransferOwnershipButton id={user.id} action={transferOwnership} />
                      )}
                      {!isSelf && <DeleteButton id={user.id} action={deleteStaffUser} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
