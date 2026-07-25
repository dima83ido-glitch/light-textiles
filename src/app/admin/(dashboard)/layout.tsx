import { getSession } from "@/lib/demo-session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex">
      <AdminSidebar isOwner={session?.role === "OWNER"} name={session?.name ?? ""} />
      <main className="min-h-screen flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}
