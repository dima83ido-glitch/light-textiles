import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAdminLocale } from "@/lib/admin-locale";
import { EditStaffForm } from "./edit-staff-form";
import { updateStaffUser } from "../actions";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "OWNER") redirect("/admin");

  const { id } = await params;
  const locale = await getAdminLocale();
  const [t, user] = await Promise.all([
    getTranslations({ locale, namespace: "admin.users" }),
    prisma.adminUser.findUnique({ where: { id } }),
  ]);

  if (!user) notFound();

  const boundUpdate = updateStaffUser.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("editAdmin")}</h1>
      <EditStaffForm initial={{ name: user.name, email: user.email, role: user.role }} onSubmit={boundUpdate} />
    </div>
  );
}
