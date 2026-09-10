"use client";

import { useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  // Remove root body padding-bottom (from public BottomNav) and reset background for admin viewport
  useEffect(() => {
    const originalPadding = document.body.style.paddingBottom;
    const originalBg = document.body.style.backgroundColor;

    document.body.style.paddingBottom = "0px";
    document.body.style.backgroundColor = "#fafafa";

    return () => {
      document.body.style.paddingBottom = originalPadding;
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 w-full h-full bg-zinc-50/70 flex font-sans text-zinc-950 antialiased overflow-hidden">
      {/* Left Dark Sidebar - Fixed full height without scrollbar */}
      <AdminSidebar />

      {/* Main Content Canvas - Independently scrollable */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto h-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
