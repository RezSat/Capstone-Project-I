"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DashboardPageHeader,
  DashboardSection,
  dashboardButtonClass,
  dashboardInputClass,
} from "@/components/dashboard/dashboard-ui";

type CategoryItem = {
  id: string; name: string; slug: string; groupSlug: string; status: string;
  sortOrder: number; filterCount: number; createdAt: Date;
};

type Props = {
  initialData: {
    items: CategoryItem[];
    pagination: { page: number; totalPages: number; total: number };
    canManage: boolean;
    filters: { q?: string; status?: string; sort?: string };
  };
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "active": return "bg-green-50 text-green-700 border-green-200";
    case "inactive": return "bg-orange-50 text-orange-700 border-orange-200";
    case "hidden": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function StorefrontLink({ groupSlug, slug, status }: { groupSlug: string; slug: string; status: string }) {
  const href = `/category/${groupSlug}/${slug}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-mono text-xs ${status !== "active" ? "text-[#94a3b8] line-through" : "text-[#f97316] hover:underline"}`}
    >
      {href}
    </a>
  );
}

export function CategoriesListPanel({ initialData }: Props) {
  const [items] = useState(initialData.items);

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog taxonomy"
        title="Categories"
        description="Organize public category routes, storefront grouping, display status, and filter availability."
        actions={initialData.canManage ? <Link className={dashboardButtonClass()} href="/dashboard/categories/new">Create category</Link> : null}
      />
      <DashboardSection>
        <form className="grid gap-3 md:grid-cols-5">
          <input
            className={dashboardInputClass("md:col-span-2")}
            name="q"
            placeholder="Search name, slug, group"
            defaultValue={initialData.filters.q}
            onChange={(e) => { const form = e.target.closest("form"); if (form && !e.target.value) form.submit(); }}
          />
          <select className={dashboardInputClass()} name="status" defaultValue={initialData.filters.status ?? ""} onChange={(e) => e.target.closest("form")?.submit()}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="hidden">Hidden</option>
          </select>
          <select className={dashboardInputClass()} name="sort" defaultValue={initialData.filters.sort ?? "newest"} onChange={(e) => e.target.closest("form")?.submit()}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="sortOrder">Sort order</option>
          </select>
          <button className={dashboardButtonClass()} type="submit">Apply</button>
        </form>
      </DashboardSection>
      <div className="font-ui text-sm text-[#64748b]">{items.length} of {initialData.pagination.total} items</div>
      {items.length === 0 ? (
        <EmptyState message="No categories found." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
          <table className="w-full font-ui text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f8fafc] text-left">
              <tr>{["Name", "Group", "Route", "Sort", "Filters", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#64748b]">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#eef2f7] last:border-b-0 hover:bg-[#fff7ed]/45">
                  <td className="px-4 py-3 font-semibold text-[#191A1C]">{item.name}<p className="font-mono text-xs font-normal text-[#64748b]">{item.slug}</p></td>
                  <td className="px-4 py-3 text-[#64748b]">{item.groupSlug}</td>
                  <td className="px-4 py-3"><StorefrontLink groupSlug={item.groupSlug} slug={item.slug} status={item.status} /></td>
                  <td className="px-4 py-3">{item.sortOrder}</td>
                  <td className="px-4 py-3">{item.filterCount}</td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-bold uppercase ${statusBadgeClass(item.status)}`}>{item.status}</span></td>
                  <td className="px-4 py-3"><Link className="font-bold uppercase text-[#f97316] hover:underline" href={`/dashboard/categories/${item.id}/edit`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {initialData.pagination.totalPages > 1 ? (
        <div className="flex gap-2">
          {Array.from({ length: initialData.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`?page=${p}`} className={`rounded-md border px-3 py-1.5 font-ui text-sm ${p === initialData.pagination.page ? "border-[#f97316] bg-[#fff7ed] text-[#9a3412]" : "border-[#d9d9d9] bg-white"}`}>{p}</Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}
