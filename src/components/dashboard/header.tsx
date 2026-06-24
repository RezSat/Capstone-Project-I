"use client";

import { Search, Bell, User, LogOut, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutDashboardAction } from "@/app/dashboard/logout-action";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  const title = segment.replaceAll("-", " ");
  const handleLogout = async () => {
    await logoutDashboardAction();
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#e5e7eb] bg-white/92 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="hidden md:block">
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
            Admin workspace
          </p>
          <h2 className="font-display text-xl font-semibold uppercase text-[#191A1C]">
            {title}
          </h2>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search products, orders, stock..."
            className="h-10 w-full rounded-md border border-[#d9d9d9] bg-[#fafafa] pl-9 pr-3 font-ui text-sm outline-none transition placeholder:text-[#94a3b8] focus:border-[#f97316] focus:bg-white focus:ring-3 focus:ring-[#f97316]/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-9 text-[#64748b] hover:text-[#f97316]">
          <Bell className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden size-9 text-[#64748b] hover:text-[#f97316] sm:inline-flex">
          <Sparkles className="size-5" />
        </Button>

        <div className="ml-1 flex items-center gap-2 border-l border-[#e5e7eb] pl-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#fff7ed] text-[#f97316]">
              <User className="size-4" />
            </div>
            <span className="hidden font-ui text-sm font-bold uppercase text-[#191A1C] sm:inline">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-[#64748b] hover:text-[#191A1C]"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
