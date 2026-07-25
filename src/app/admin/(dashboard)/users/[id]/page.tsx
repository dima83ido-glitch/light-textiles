import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/demo-session";
import { store } from "@/lib/demo-store";
import { getAdminLocale } from "@/lib/admin-locale";
import { EditStaffForm } from "./edit-staff-form";
import { updateStaffUser } from "../actions";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session?.role !== "OWNER") redirect("/admin");

  const { id } = await params;
  const locale = await getAdminLocale();
  const [t] = await Promise.all([getTranslations({ locale, namespace: "admin.users" })]);
  const user = store.adminUsers.find((u) => u.id === id);

  if (!user) notFound();

  const boundUpdate = updateStaffUser.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-ink)]">{t("editAdmin")}</h1>
      <EditStaffForm initial={{ name: user.name, email: user.email }} onSubmit={boundUpdate} />
    </div>
  );
}
