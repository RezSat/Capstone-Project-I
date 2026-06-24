import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { requireRole } from "@/core/auth/dashboard-route-protection";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";

export const dynamic = 'force-dynamic';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await requireRole("super_admin", "admin", "operator", "viewer");
  const auth = await getDashboardAuth();

  return (
    <div className="flex min-h-screen bg-[#f6f7f9]">
      <Toaster position="bottom-right" />
      <Sidebar role={auth.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
