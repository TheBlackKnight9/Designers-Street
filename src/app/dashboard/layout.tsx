import { ToastProvider } from "@/components/dashboard/Toast";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireDashboardContext } from "@/server/auth/dashboard-session";
import { isDatabaseEnabled } from "@/server/utils/env";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let designerName: string | undefined;

  if (isDatabaseEnabled()) {
    try {
      const ctx = await requireDashboardContext();
      designerName = ctx.designer.name;
    } catch {
      /* guest / non-authenticated fallback handled by route protection */
    }
  }

  return (
    <ToastProvider>
      <DashboardShell designerName={designerName}>
        {children}
      </DashboardShell>
    </ToastProvider>
  );
}
