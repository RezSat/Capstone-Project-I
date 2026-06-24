import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { listDashboardDistinctGroupSlugs } from "@/modules/products/admin-catalog.service";
import { CategoryForm } from "@/components/categories/category-form";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/dashboard-ui";

export const dynamic = 'force-dynamic';

export default async function NewDashboardCategoryPage() {
  await requireAnyPermission("PRODUCTS_MANAGE");
  const groupSlugs = await listDashboardDistinctGroupSlugs();

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog taxonomy"
        title="Create Category"
        description="Add a category route and merchandising metadata for storefront browsing."
      />
      <DashboardSection>
      <CategoryForm existingGroupSlugs={groupSlugs} />
      </DashboardSection>
    </main>
  );
}
