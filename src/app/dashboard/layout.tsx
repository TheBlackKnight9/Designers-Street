import { ToastProvider } from "@/components/dashboard/Toast";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/server/db";
import { isDatabaseEnabled } from "@/server/utils/env";

export const dynamic = "force-dynamic";

async function loadDesignerName(): Promise<string | null> {
  try {
    if (!isDatabaseEnabled()) return null;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const house = await prisma.designerHouse.findUnique({
      where: { ownerUserId: user.id },
      select: { name: true },
    });
    return house?.name ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const name = await loadDesignerName();
  return (
    <ToastProvider>
      <DashboardShell designerName={name || undefined}>{children}</DashboardShell>
    </ToastProvider>
  );
}
