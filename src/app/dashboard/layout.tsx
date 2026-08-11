import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";
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
  // Gate: only admin can access /dashboard
  if (isDatabaseEnabled()) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser?.email) {
      redirect("/account/login?next=/dashboard");
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdminByEmail = adminEmails.includes(authUser.email.toLowerCase());

    if (!isAdminByEmail) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
        if (!dbUser || dbUser.role !== "admin") {
          redirect("/?error=admin_required");
        }
      } catch (err: unknown) {
        if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        console.error("[DashboardLayout] Database error checking admin:", err);
        redirect("/?error=admin_required");
      }
    }
  }

  let designerName: string | undefined;

  if (isDatabaseEnabled()) {
    try {
      const ctx = await requireDashboardContext();
      designerName = ctx.designer.name;
    } catch {
      /* No active house selected yet — DashboardShell will show placeholder */
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
