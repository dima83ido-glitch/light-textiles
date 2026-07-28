"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { AdminRole } from "@prisma/client";
import { roleMessageKey } from "@/lib/role-label";

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

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

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
        <input required className={inputClass} {...register("name")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("columnEmail")}
        <input required type="email" className={inputClass} {...register("email")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {tc("password")}
        <input type="password" placeholder={t("newPasswordPlaceholder")} className={inputClass} {...register("password")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
        {t("columnRole")}
        <select className={inputClass} {...register("role")}>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(roleMessageKey(role))}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-canvas)] transition-transform active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? tc("saving") : tc("save")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-subtle)]"
        >
          {tc("cancel")}
        </button>
      </div>
    </form>
  );
}
