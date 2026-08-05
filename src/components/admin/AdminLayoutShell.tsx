"use client";

import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  return (
    <div className="h-screen w-full bg-[#F4F0E5] flex font-sans overflow-hidden">
      {/* Left Dark Sidebar - Fixed / Sticky full height */}
      <AdminSidebar />

      {/* Main Content Canvas - Independently scrollable */}
      <main className="flex-1 min-w-0 p-5 sm:p-7 md:p-9 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
