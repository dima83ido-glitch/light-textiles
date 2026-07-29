"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminRole } from "@prisma/client";
import { roleMessageKey } from "@/lib/role-label";
import { adminInputClass } from "@/components/admin/localized-field";
import { Button } from "@/components/ui/button";
import { createStaffUser } from "./actions";

const ROLES: AdminRole[] = ["OWNER", "MANAGER", "WAREHOUSE", "EMPLOYEE"];

export function NewStaffForm() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{
    email: string;
    name: string;
    password: string;
    role: AdminRole;
  }>({
    defaultValues: { email: "", name: "", password: "", role: "EMPLOYEE" },
  });

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="mb-5">
        <Plus className="h-4 w-4" /> {t("addAdmin")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await createStaffUser(data);
        reset();
        setOpen(false);
      })}
      className="mb-6 flex max-w-md flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("newAdmin")}</p>
        <button type="button" onClick={() => setOpen(false)} aria-label={tc("cancel")} className="text-[var(--color-ink-soft)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input required placeholder={t("namePlaceholder")} className={adminInputClass} {...register("name")} />
      <input required type="email" placeholder={t("emailPlaceholder")} className={adminInputClass} {...register("email")} />
      <input required type="password" placeholder={t("passwordPlaceholder")} className={adminInputClass} {...register("password")} />
      <select className={adminInputClass} {...register("role")}>
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {t(roleMessageKey(role))}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? tc("saving") : tc("create")}
      </Button>
    </form>
  );
}
