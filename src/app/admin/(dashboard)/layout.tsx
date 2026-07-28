import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { NotificationBell } from "@/components/admin/notification-bell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex">
      <AdminSidebar role={session?.role ?? "EMPLOYEE"} name={session?.name ?? ""} />
      <main className="min-h-screen flex-1 overflow-x-hidden p-8">
        <div className="mb-6 flex justify-end">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
