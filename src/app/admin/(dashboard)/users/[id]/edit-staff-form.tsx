"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { AdminRole } from "@prisma/client";
import { roleMessageKey } from "@/lib/role-label";
import { adminInputClass } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";

const ROLES: AdminRole[] = ["OWNER", "MANAGER", "WAREHOUSE", "EMPLOYEE"];

export function EditStaffForm({
  initial,
  onSubmit,
}: {
  initial: { name: string; email: string; role: AdminRole };
  onSubmit: (data: { name: string; email: string; password?: string; role: AdminRole }) => Promise<void>;
}) {
  const t = useTranslations("admin.users");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: initial.name, email: initial.email, password: "", role: initial.role },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({
          name: data.name,
          email: data.email,
          password: data.password ? data.password : undefined,
          role: data.role,
        });
        router.push("/admin/users");
        router.refresh();
      })}
      className="flex max-w-md flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("columnName")}
        <input required className={adminInputClass} {...register("name")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("columnEmail")}
        <input required type="email" className={adminInputClass} {...register("email")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {tc("password")}
        <input type="password" placeholder={t("newPasswordPlaceholder")} className={adminInputClass} {...register("password")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("columnRole")}
        <select className={adminInputClass} {...register("role")}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(roleMessageKey(role))}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-1 flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? tc("saving") : tc("save")}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
