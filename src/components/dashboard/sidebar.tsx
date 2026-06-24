"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  Settings,
  Home,
  ShoppingBag,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { PERMISSIONS, type DashboardUserRole, type Permission } from "@/core/auth/rbac-permissions";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
};

const navGroups: { label: string; items: SidebarItem[] }[] = [
  { label: "Workspace", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/dashboard/products", icon: Package, permission: PERMISSIONS.PRODUCTS_VIEW },
      { label: "Categories", href: "/dashboard/categories", icon: Tag, permission: PERMISSIONS.PRODUCTS_VIEW },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, permission: PERMISSIONS.ORDERS_VIEW },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Inventory", href: "/dashboard/inventory", icon: Warehouse, permission: PERMISSIONS.INVENTORY_VIEW },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_READ },
    ],
  },
];

function hasPermission(role: string, permission: string): boolean {
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: [
      PERMISSIONS.STAFF_MANAGE, PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_READ,
      PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_MANAGE, PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_WRITE, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_MANAGE,
      PERMISSIONS.FILES_READ, PERMISSIONS.FILES_MANAGE,
    ],
    admin: [
      PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_MANAGE, PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_WRITE, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_MANAGE,
      PERMISSIONS.FILES_READ, PERMISSIONS.FILES_MANAGE, PERMISSIONS.SETTINGS_READ,
    ],
    operator: [
      PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_READ, PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_READ, PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_MANAGE, PERMISSIONS.FILES_READ,
    ],
    viewer: [
      PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_READ, PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_READ,
    ],
  };
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isVisible = (item: SidebarItem) =>
    !item.permission || hasPermission(role as DashboardUserRole, item.permission as Permission);

  return (
    <aside className={`sticky top-0 flex h-screen flex-col border-r border-[#e5e7eb] bg-white transition-all duration-200 ${collapsed ? "w-[84px]" : "w-[84px] md:w-[280px]"}`}>
      <div className="flex h-16 items-center justify-between border-b border-[#e5e7eb] px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#f97316] font-ui text-lg font-black text-white">S</span>
          {!collapsed && (
            <span className="hidden md:block">
              <span className="block font-display text-lg font-semibold uppercase leading-none text-[#191A1C]">Admin</span>
              <span className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">Capstone</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          className="flex size-9 items-center justify-center rounded-md text-[#64748b] hover:bg-[#fff7ed] hover:text-[#f97316]"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(isVisible);
            if (visibleItems.length === 0) return null;

            return (
              <section key={group.label}>
                {!collapsed && (
                  <p className="mb-2 hidden px-3 font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-[#94a3b8] md:block">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-ui text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-[#fff7ed] text-[#f97316]"
                              : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#191A1C]"
                          }`}
                        >
                          <Icon className="size-5 shrink-0" />
                          {!collapsed && <span className="hidden md:inline">{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[#e5e7eb] p-3">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 font-ui text-sm font-bold text-[#9a3412] hover:border-[#f97316]"
          title={collapsed ? "Home page" : undefined}
        >
          <Home className="size-4 shrink-0" />
          {!collapsed && <span className="hidden md:inline">Storefront</span>}
        </Link>
      </div>
    </aside>
  );
}
