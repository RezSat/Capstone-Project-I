import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { ProductEditorForm } from "@/components/products/product-editor-form";
import { getProductEditData } from "../../product-edit-data";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";

//export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ productId: string }> };

export default async function DashboardProductEditPage({ params }: Props) {
  await requireAnyPermission("PRODUCTS_MANAGE");
  const { productId } = await params;
  const productData = await getProductEditData(productId);

  const initialData = productData
    ? {
        title: productData.name,
        slug: productData.slug,
        description: productData.description ?? "",
        priceMinor: productData.basePriceMinor,
        comparePriceMinor: productData.compareAtPriceMinor,
        status: productData.status as "draft" | "active" | "archived",
        categoryId: productData.primaryCategoryId,
        brandId: productData.brandId,
        isFeatured: productData.isFeatured,
        promoLabel: productData.promoLabel as "none" | "new_arrival" | "best_seller",
        accordions: productData.accordions,
        images: productData.images,
        sizes: productData.optionGroups.find(g => g.displayType === "button")?.values.map(v => v.value) ?? [],
        colors: productData.optionGroups.find(g => g.displayType === "color")?.values.map(v => ({ label: v.label, hex: v.color ?? "#000000" })) ?? [],
        sizeLabel: productData.optionGroups.find(g => g.displayType === "button")?.name ?? "Size",
        variantRows: productData.variantRows.map(v => ({
          id: v.id,
          combination: v.optionSignature,
          sku: v.sku,
          priceOverride: v.priceOverride,
          initialStock: v.initialStock,
        })),
      }
    : undefined;

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog operations"
        title="Edit Product"
        description="Update product information while preserving the existing save, image upload, and archive flows."
      />
      <ProductEditorForm productId={productId} initialData={initialData} />
    </main>
  );
}
