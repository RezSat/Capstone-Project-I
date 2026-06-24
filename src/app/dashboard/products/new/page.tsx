import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { ProductEditorForm } from "@/components/products/product-editor-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";

export const dynamic = 'force-dynamic';

export default async function NewDashboardProductPage() {
  await requireAnyPermission("PRODUCTS_MANAGE");
  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog operations"
        title="Create Product"
        description="Build product content, images, variants, and storefront publishing settings."
      />
      <ProductEditorForm />
    </main>
  );
}
