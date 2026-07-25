import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex">
      <AdminSidebar isOwner={session?.user?.role === "OWNER"} name={session?.user?.name ?? ""} />
      <main className="min-h-screen flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}
