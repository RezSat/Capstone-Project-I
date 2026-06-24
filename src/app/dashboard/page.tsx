import Link from "next/link";
import { getDashboardOverviewSummary } from "./overview-summary";
import { DashboardMetricCard, DashboardPageHeader, DashboardSection } from "@/components/dashboard/dashboard-ui";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const overview = await getDashboardOverviewSummary();

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Operational control"
        title="Dashboard Overview"
        description="Presentation-ready snapshot of catalog, stock, users, and operational readiness."
        actions={
          <>
            <Link className="rounded-md border border-[#d9d9d9] bg-white px-4 py-2 font-ui text-xs font-bold uppercase text-[#191A1C] hover:border-[#f97316]" href="/dashboard/products">
              Products
            </Link>
            <Link className="rounded-md bg-[#f97316] px-4 py-2 font-ui text-xs font-bold uppercase text-white hover:bg-[#ea580c]" href="/dashboard/inventory">
              Inventory
            </Link>
          </>
        }
      />

      <DashboardSection>
        <p className="font-ui text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748b]">Signed in account</p>
        <p className="mt-2 font-body text-sm text-[#191A1C]">{overview.accountIdentifier}</p>
      </DashboardSection>

      {overview.status === "error" ? (
        <DashboardSection className="border-red-200 bg-red-50">
          <p className="font-ui text-sm font-bold text-red-700">Overview data is temporarily unavailable.</p>
          <p className="font-body text-sm text-red-600">Refresh the page to try again.</p>
        </DashboardSection>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardMetricCard label="Active products" value={overview.activeProductsCount} tone="orange" />
          <DashboardMetricCard label="Inactive products" value={overview.inactiveProductsCount} />
          <DashboardMetricCard label="Low stock" value={overview.lowStockCount} tone="green" />
          <DashboardMetricCard label="Out of stock" value={overview.outOfStockCount} tone="red" />
          <DashboardMetricCard label="Active users" value={overview.activeUsersCount} />
        </section>
      )}

      {overview.status === "ready" && overview.isEmpty ? (
        <DashboardSection>
          <p className="font-body text-sm text-[#64748b]">No products yet. Add products to start tracking stock.</p>
        </DashboardSection>
      ) : null}
    </main>
  );
}
