import { requireAdmin } from "@/lib/auth/admin-guard";
import { ToastProvider } from "@/components/dashboard/Toast";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

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
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </ToastProvider>
  );
}
