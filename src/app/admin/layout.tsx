import { requireAdmin } from "@/lib/auth/admin-guard";
import { ToastProvider } from "@/components/dashboard/Toast";
import { AdminHouseSwitcher } from "@/components/admin/AdminHouseSwitcher";

export const dynamic = "force-dynamic";

/** Admin Command Center Layout — admin-only, server-side guarded */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard: redirects non-admins to /
  await requireAdmin();

  return (
    <ToastProvider>
      <AdminHouseSwitcher />
      <div className="min-h-screen bg-[#F8F7F4]">{children}</div>
    </ToastProvider>
  );
}
