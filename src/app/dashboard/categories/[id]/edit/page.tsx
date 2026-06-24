import { requireAnyPermission } from "@/core/auth/dashboard-route-protection";
import { notFound } from "next/navigation";
import { getDashboardCategory, listDashboardDistinctGroupSlugs } from "@/modules/products/admin-catalog.service";
import { CategoryEditForm } from "@/components/categories/category-edit-form";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/dashboard-ui";

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function DashboardCategoryEditPage({ params }: Props) {
  await requireAnyPermission("PRODUCTS_MANAGE");
  const { id } = await params;
  const [category, groupSlugs] = await Promise.all([
    getDashboardCategory(id).catch(() => null),
    listDashboardDistinctGroupSlugs(),
  ]);

  if (!category) {
    notFound();
  }

  const initialData = {
    name: category.name,
    slug: category.slug,
    groupSlug: category.groupSlug,
    parentId: category.parentId,
    description: category.description,
    title: (category as Record<string, unknown>).pageContent ? (category.pageContent as Record<string, unknown>).title as string ?? null : null,
    heroImage: (category as Record<string, unknown>).pageContent ? (category.pageContent as Record<string, unknown>).heroImageUrl as string ?? null : null,
    fallbackHeroImage: (category as Record<string, unknown>).pageContent ? (category.pageContent as Record<string, unknown>).fallbackHeroImageUrl as string ?? null : null,
    seoTitle: (category as Record<string, unknown>).pageContent ? (category.pageContent as Record<string, unknown>).seoTitle as string ?? null : null,
    seoDescription: (category as Record<string, unknown>).pageContent ? (category.pageContent as Record<string, unknown>).seoDescription as string ?? null : null,
    status: category.status,
    sortOrder: category.sortOrder,
  };

  return (
    <main className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog taxonomy"
        title="Edit Category"
        description="Adjust category metadata, SEO fields, image references, and storefront availability."
        actions={<a href="/dashboard/categories" className="rounded-md border border-[#d9d9d9] bg-white px-4 py-2 font-ui text-xs font-bold uppercase hover:border-[#f97316]">Back to list</a>}
      />
      <DashboardSection>
      <CategoryEditForm categoryId={id} initialData={initialData} existingGroupSlugs={groupSlugs} />
      </DashboardSection>
    </main>
  );
}
