"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  DashboardMetricCard,
  DashboardPageHeader,
  DashboardSection,
  dashboardButtonClass,
  dashboardInputClass,
} from "@/components/dashboard/dashboard-ui";
import { ProductsTable } from "./products-table";

type ProductItem = {
  id: string; name: string; slug: string; category: string | null; brand: string | null;
  status: string; basePriceMinor: number; variantCount: number; totalStock: number;
  createdAt: Date; updatedAt: Date; thumbnailUrl: string | null;
};

type Props = {
  initialData: {
    items: ProductItem[];
    categories: Array<{ id: string; name: string }>;
    brands: Array<{ id: string; name: string }>;
    pagination: { page: number; totalPages: number };
    canManage: boolean;
    filters: { q?: string; categoryId?: string; brandId?: string; status?: string; sort?: string };
    stats: { totalProducts: number; activeProducts: number; averagePrice: number };
  };
};

type TabType = "all" | "active" | "inactive";

function StatsCards({ stats }: { stats: Props["initialData"]["stats"] }) {
  const formatPrice = (cents: number) => (cents / 100).toFixed(2);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <DashboardMetricCard label="Total products" value={stats.totalProducts} tone="orange" />
      <DashboardMetricCard label="Active products" value={stats.activeProducts} />
      <DashboardMetricCard label="Average price" value={`Rs. ${formatPrice(stats.averagePrice)}`} />
    </div>
  );
}

function TabNavigation({ currentTab }: { currentTab: TabType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All products" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];
  const handleTabClick = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("status");
    else params.set("status", tab);
    router.push(`/dashboard/products?${params.toString()}`);
  };
  return (
    <div className="flex border-b border-[#e5e7eb]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => handleTabClick(tab.key)}
          className={`px-4 py-3 font-ui text-sm font-bold uppercase transition-colors ${
            currentTab === tab.key ? "border-b-2 border-[#f97316] text-[#191A1C]" : "text-[#64748b] hover:text-[#191A1C]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ProductsListPanel({ initialData }: Props) {
  const [items, setItems] = useState(initialData.items);
  const statusParam = useSearchParams().get("status");
  const currentTab: TabType = statusParam === "active" || statusParam === "inactive" ? statusParam : "all";
  const archive = async (id: string) => {
    const result = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (result.ok) setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "archived" } : item)));
  };
  const filteredItems = currentTab === "all" ? items : items.filter((item) => item.status === currentTab);
  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog operations"
        title="Product Management"
        description="Manage product records, pricing state, publish status, and storefront readiness."
        actions={<Link href="/dashboard/products/new" className={dashboardButtonClass()}>Add product</Link>}
      />
      <StatsCards stats={initialData.stats} />
      <DashboardSection>
        <TabNavigation currentTab={currentTab} />
        <form className="mt-5 grid gap-3 md:grid-cols-6" method="GET">
          <input className={dashboardInputClass("md:col-span-2")} name="q" placeholder="Search name, slug, SKU" defaultValue={initialData.filters.q} />
          <select className={dashboardInputClass()} name="categoryId" defaultValue={initialData.filters.categoryId ?? ""}><option value="">All categories</option>{initialData.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className={dashboardInputClass()} name="brandId" defaultValue={initialData.filters.brandId ?? ""}><option value="">All brands</option>{initialData.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <select className={dashboardInputClass()} name="status" defaultValue={initialData.filters.status ?? ""}><option value="">All status</option><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select>
          <select className={dashboardInputClass()} name="sort" defaultValue={initialData.filters.sort ?? "newest"}><option value="newest">Newest</option><option value="name">Name</option><option value="status">Status</option><option value="price">Price</option></select>
          <button className={dashboardButtonClass()} type="submit">Apply</button>
        </form>
      </DashboardSection>
      <div className="font-ui text-sm text-[#64748b]">{filteredItems.length} items</div>
      {filteredItems.length === 0 ? <EmptyState message="No products found." /> : <ProductsTable items={filteredItems} canManage={initialData.canManage} onArchive={archive} />}
      {initialData.pagination.totalPages > 1 ? <Pagination totalPages={initialData.pagination.totalPages} currentPage={initialData.pagination.page} /> : null}
    </main>
  );
}
