import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { AppError } from "../../core/http/errors";
import { createAuditLog } from "../audit/audit.service";
import { categoryFilters, categories, brands } from "../../core/db/schema";
import {
  adminBrandCreateSchema,
  adminBrandUpdateSchema,
  adminCategoryCreateSchema,
  adminCategoryFilterCreateSchema,
  adminCategoryFilterOptionCreateSchema,
  adminCategoryFilterOptionUpdateSchema,
  adminCategoryFilterUpdateSchema,
  adminCategoryUpdateSchema,
  adminProductCreateSchema,
  adminProductUpdateSchema,
} from "./admin-catalog.schema";
import {
  createAdminBrand,
  createAdminCategory,
  createAdminCategoryFilter,
  createAdminCategoryFilterOption,
  createAdminProduct,
  buildVariantRowsFromOptionGroups,
  createDefaultVariant,
  upsertProductVariants,
  upsertProductOptionGroups,
  getAdminProductById,
  getAdminProductBySlug,
  updateAdminProduct,
  listAdminProducts,
  syncProductAccordions,
  syncProductImages,
  upsertProductAccordionsDetailed,
  getAdminCategoryById,
  getAdminCategoryBySlug,
  updateAdminCategory,
  listAdminCategories,
  listAdminCategoryFilters,
  listAdminCategoryFiltersWithOptions,
  listAdminCategoryFilterOptions,
  updateAdminCategoryFilter,
  deleteAdminCategoryFilter,
  updateAdminCategoryFilterOption,
  deleteAdminCategoryFilterOption,
  listAdminBrands,
  getAdminBrandBySlug,
  updateAdminBrand,
  listDistinctGroupSlugs,
} from "./admin-catalog.repo";

const shapeProduct = (row: Awaited<ReturnType<typeof getAdminProductById>>) => row;
const shapeCategory = (row: Awaited<ReturnType<typeof getAdminCategoryById>>) => row;

export const listDashboardCatalogProducts = async () => (await listAdminProducts()).map(shapeProduct);
export const getDashboardCatalogProduct = async (id: string) => {
  const product = await getAdminProductById(id);
  if (!product) throw new AppError("NOT_FOUND", "Product not found");
  return shapeProduct(product);
};

export async function createDashboardCatalogProduct(input: unknown, actorUserId?: string) {
  try {
    const parsed = adminProductCreateSchema.parse(input);
    if (await getAdminProductBySlug(parsed.slug)) throw new AppError("CONFLICT", "Product slug already exists");

    if (parsed.categoryId) {
      const cat = await db.query.categories.findFirst({ where: eq(categories.id, parsed.categoryId) });
      if (!cat) throw new AppError("INVALID_INPUT", "Category not found");
    }
    if (parsed.brandId) {
      const brand = await db.query.brands.findFirst({ where: eq(brands.id, parsed.brandId) });
      if (!brand) throw new AppError("INVALID_INPUT", "Brand not found");
    }

    const created = await createAdminProduct({
      name: parsed.name,
      slug: parsed.slug,
      primaryCategoryId: parsed.categoryId ?? null,
      brandId: parsed.brandId ?? null,
      shortDescription: parsed.shortDescription ?? null,
      description: parsed.description ?? null,
      basePriceMinor: parsed.basePriceMinor,
      compareAtPriceMinor: parsed.compareAtPriceMinor ?? null,
      status: parsed.status,
      seoTitle: parsed.seoTitle ?? null,
      seoDescription: parsed.seoDescription ?? null,
      isFeatured: parsed.isFeatured,
      promoLabel: parsed.promoLabel,
    });

    if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create product");

    if (parsed.optionGroups) {
      await upsertProductOptionGroups(created.id, parsed.optionGroups);
      const variantRows = await buildVariantRowsFromOptionGroups(
        created.name,
        created.slug,
        parsed.optionGroups
      );
      if (variantRows.length > 0) {
        await upsertProductVariants(created.id, variantRows, created.basePriceMinor);
      }
    } else if (parsed.variantRows && parsed.variantRows.length > 0) {
      await upsertProductVariants(created.id, parsed.variantRows, created.basePriceMinor);
    } else {
      await createDefaultVariant(created.id, created.name, created.basePriceMinor);
    }

    await createAuditLog({ actorId: actorUserId, action: "product.create", targetType: "product", targetId: created.id });
    return shapeProduct(created);
  } catch (error) {
    console.error("createDashboardCatalogProduct error:", error);
    throw error;
  }
}

export async function updateDashboardCatalogProduct(id: string, input: unknown, actorUserId?: string) {
  const existing = await getAdminProductById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Product not found");
  const parsed = adminProductUpdateSchema.parse(input);
  if (parsed.slug && (await getAdminProductBySlug(parsed.slug, id))) throw new AppError("CONFLICT", "Product slug already exists");
  const updated = await updateAdminProduct(id, {
    name: parsed.name,
    slug: parsed.slug,
    primaryCategoryId: parsed.categoryId,
    brandId: parsed.brandId,
    shortDescription: parsed.shortDescription,
    description: parsed.description,
    basePriceMinor: parsed.basePriceMinor,
    compareAtPriceMinor: parsed.compareAtPriceMinor,
    status: parsed.status,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    isFeatured: parsed.isFeatured,
    promoLabel: parsed.promoLabel,
  });
  if (!updated) throw new AppError("CONFLICT", "Product changed during update");
  if (parsed.images) await syncProductImages(id, parsed.images);
  if (parsed.optionGroups) {
    await upsertProductOptionGroups(id, parsed.optionGroups);
    const updatedVariantRows = await buildVariantRowsFromOptionGroups(
      parsed.name ?? existing.name,
      parsed.slug ?? existing.slug,
      parsed.optionGroups
    );
    console.log(`♻️ RE-INDEXING VARIANT MATRIX FOR PRODUCT ${id}: Generated ${updatedVariantRows.length} total rows.`);
    await upsertProductVariants(id, updatedVariantRows, parsed.basePriceMinor ?? updated.basePriceMinor);
  } else if (parsed.variantRows) {
    await upsertProductVariants(id, parsed.variantRows, parsed.basePriceMinor ?? updated.basePriceMinor);
  }
  if (parsed.accordions) {
    if (parsed.accordionsBullets || parsed.accordionsParagraphs) {
      await upsertProductAccordionsDetailed(id, parsed.accordions, parsed.accordionsBullets ?? {}, parsed.accordionsParagraphs ?? {});
    } else {
      await syncProductAccordions(id, parsed.accordions);
    }
  }
  await createAuditLog({ actorId: actorUserId, action: "product.update", targetType: "product", targetId: updated.id });
  return shapeProduct(updated);
}

export async function archiveDashboardCatalogProduct(id: string, actorUserId?: string) {
  const updated = await updateAdminProduct(id, { status: "archived", archivedAt: new Date() });
  if (!updated) throw new AppError("NOT_FOUND", "Product not found");
  await createAuditLog({ actorId: actorUserId, action: "product.archive", targetType: "product", targetId: updated.id });
  return shapeProduct(updated);
}

export const listDashboardCategories = () => listAdminCategories();
export const listDashboardDistinctGroupSlugs = () => listDistinctGroupSlugs();

export async function getDashboardCategory(id: string) {
  const category = await getAdminCategoryById(id);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  return shapeCategory(category);
}

export async function createDashboardCategory(input: unknown, actorUserId?: string) {
  const parsed = adminCategoryCreateSchema.parse(input);
  const groupSlug = parsed.groupSlug ?? "default";
  const fullSlug = `${groupSlug}/${parsed.slug}`;
  if (await getAdminCategoryBySlug(groupSlug, parsed.slug)) throw new AppError("CONFLICT", "Category with this group+slug already exists");
  const created = await createAdminCategory({
    name: parsed.name,
    slug: parsed.slug,
    groupSlug,
    fullSlug,
    parentId: parsed.parentId ?? null,
    description: parsed.description ?? null,
    status: parsed.status,
    sortOrder: parsed.sortOrder ?? 0,
  });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create category");
  if (parsed.title || parsed.description || parsed.heroImage || parsed.fallbackHeroImage || parsed.seoTitle || parsed.seoDescription) {
    await createAdminCategoryPageContent({
      categoryId: created.id,
      title: parsed.title ?? parsed.name,
      description: parsed.description ?? null,
      heroImage: parsed.heroImage ?? null,
      fallbackHeroImage: parsed.fallbackHeroImage ?? null,
      seoTitle: parsed.seoTitle ?? null,
      seoDescription: parsed.seoDescription ?? null,
    });
  }
  await createAuditLog({ actorId: actorUserId, action: "category.create", targetType: "category", targetId: created.id });
  return shapeCategory(await getAdminCategoryById(created.id));
}

export async function updateDashboardCategory(id: string, input: unknown, actorUserId?: string) {
  const existing = await getAdminCategoryById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Category not found");
  const parsed = adminCategoryUpdateSchema.parse(input);
  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.slug !== undefined || parsed.groupSlug !== undefined) {
    const groupSlug = parsed.groupSlug ?? existing.groupSlug;
    const slug = parsed.slug ?? existing.slug;
    const fullSlug = `${groupSlug}/${slug}`;
    if (await getAdminCategoryBySlug(groupSlug, slug, id)) throw new AppError("CONFLICT", "Category with this group+slug already exists");
    updateData.groupSlug = groupSlug;
    updateData.slug = slug;
    updateData.fullSlug = fullSlug;
  }
  if (parsed.parentId !== undefined) updateData.parentId = parsed.parentId;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.status !== undefined) updateData.status = parsed.status;
  if (parsed.sortOrder !== undefined) updateData.sortOrder = parsed.sortOrder;
  if (Object.keys(updateData).length > 0) {
    const updated = await updateAdminCategory(id, updateData);
    if (!updated) throw new AppError("NOT_FOUND", "Category not found");
  }
  if (parsed.title !== undefined || parsed.description !== undefined || parsed.heroImage !== undefined || parsed.fallbackHeroImage !== undefined || parsed.seoTitle !== undefined || parsed.seoDescription !== undefined) {
    await upsertAdminCategoryPageContent(id, {
      title: parsed.title ?? existing.name,
      description: parsed.description ?? null,
      heroImage: parsed.heroImage ?? null,
      fallbackHeroImage: parsed.fallbackHeroImage ?? null,
      seoTitle: parsed.seoTitle ?? null,
      seoDescription: parsed.seoDescription ?? null,
    });
  }
  await createAuditLog({ actorId: actorUserId, action: "category.update", targetType: "category", targetId: id });
  return shapeCategory(await getAdminCategoryById(id));
}

export async function archiveDashboardCategory(id: string, actorUserId?: string) {
  const existing = await getAdminCategoryById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Category not found");
  const updated = await updateAdminCategory(id, { status: "inactive", updatedAt: new Date() });
  if (!updated) throw new AppError("NOT_FOUND", "Category not found");
  await createAuditLog({ actorId: actorUserId, action: "category.archive", targetType: "category", targetId: id });
  return shapeCategory(await getAdminCategoryById(id));
}

export async function listDashboardCategoryFilters(categoryId: string) {
  const category = await getAdminCategoryById(categoryId);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  return listAdminCategoryFilters(categoryId);
}

export async function getDashboardCategoryFiltersWithOptions(categoryId: string) {
  const category = await getAdminCategoryById(categoryId);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  return listAdminCategoryFiltersWithOptions(categoryId);
}

export async function getDashboardCategoryFilter(filterId: string) {
  const [filter] = await db.select().from(categoryFilters).where(eq(categoryFilters.id, filterId));
  if (!filter) throw new AppError("NOT_FOUND", "Filter not found");
  const options = await listAdminCategoryFilterOptions(filterId);
  return { ...filter, options };
}

export async function createDashboardCategoryFilter(categoryId: string, input: unknown, actorUserId?: string) {
  const category = await getAdminCategoryById(categoryId);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  const parsed = adminCategoryFilterCreateSchema.parse(input);
  const created = await createAdminCategoryFilter({
    categoryId,
    label: parsed.label,
    slug: parsed.slug,
    sourceType: parsed.sourceType ?? "attribute",
    sourceKey: parsed.sourceKey ?? null,
    sortOrder: parsed.sortOrder ?? 0,
    isActive: parsed.isActive ?? true,
  });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create filter");
  await createAuditLog({ actorId: actorUserId, action: "category_filter.create", targetType: "category_filter", targetId: created.id });
  return created;
}

export async function updateDashboardCategoryFilter(categoryId: string, filterId: string, input: unknown, actorUserId?: string) {
  const category = await getAdminCategoryById(categoryId);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  const parsed = adminCategoryFilterUpdateSchema.parse(input);
  const updated = await updateAdminCategoryFilter(filterId, { ...parsed, updatedAt: new Date() });
  if (!updated) throw new AppError("NOT_FOUND", "Filter not found");
  await createAuditLog({ actorId: actorUserId, action: "category_filter.update", targetType: "category_filter", targetId: filterId });
  return updated;
}

export async function deleteDashboardCategoryFilter(categoryId: string, filterId: string, actorUserId?: string) {
  const category = await getAdminCategoryById(categoryId);
  if (!category) throw new AppError("NOT_FOUND", "Category not found");
  await deleteAdminCategoryFilter(filterId);
  await createAuditLog({ actorId: actorUserId, action: "category_filter.delete", targetType: "category_filter", targetId: filterId });
}

export async function createDashboardCategoryFilterOption(categoryId: string, filterId: string, input: unknown, actorUserId?: string) {
  const [filter] = await db.select().from(categoryFilters).where(eq(categoryFilters.id, filterId));
  if (!filter) throw new AppError("NOT_FOUND", "Filter not found");
  if (filter.categoryId !== categoryId) throw new AppError("NOT_FOUND", "Filter not found in this category");
  const parsed = adminCategoryFilterOptionCreateSchema.parse(input);
  const created = await createAdminCategoryFilterOption({
    filterId,
    label: parsed.label,
    value: parsed.value,
    sortOrder: parsed.sortOrder ?? 0,
    isActive: parsed.isActive ?? true,
  });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create filter option");
  await createAuditLog({ actorId: actorUserId, action: "category_filter_option.create", targetType: "category_filter_option", targetId: created.id });
  return created;
}

export async function updateDashboardCategoryFilterOption(categoryId: string, filterId: string, optionId: string, input: unknown, actorUserId?: string) {
  const [filter] = await db.select().from(categoryFilters).where(eq(categoryFilters.id, filterId));
  if (!filter) throw new AppError("NOT_FOUND", "Filter not found");
  if (filter.categoryId !== categoryId) throw new AppError("NOT_FOUND", "Filter not found in this category");
  const parsed = adminCategoryFilterOptionUpdateSchema.parse(input);
  const updated = await updateAdminCategoryFilterOption(optionId, parsed);
  if (!updated) throw new AppError("NOT_FOUND", "Filter option not found");
  await createAuditLog({ actorId: actorUserId, action: "category_filter_option.update", targetType: "category_filter_option", targetId: optionId });
  return updated;
}

export async function deleteDashboardCategoryFilterOption(categoryId: string, filterId: string, optionId: string, actorUserId?: string) {
  const [filter] = await db.select().from(categoryFilters).where(eq(categoryFilters.id, filterId));
  if (!filter) throw new AppError("NOT_FOUND", "Filter not found");
  if (filter.categoryId !== categoryId) throw new AppError("NOT_FOUND", "Filter not found in this category");
  await deleteAdminCategoryFilterOption(optionId);
  await createAuditLog({ actorId: actorUserId, action: "category_filter_option.delete", targetType: "category_filter_option", targetId: optionId });
}

export const listDashboardCategoryFilterOptions = (filterId: string) => listAdminCategoryFilterOptions(filterId);

export const listDashboardBrands = () => listAdminBrands();
export async function createDashboardBrand(input: unknown) {
  const parsed = adminBrandCreateSchema.parse(input);
  if (await getAdminBrandBySlug(parsed.slug)) throw new AppError("CONFLICT", "Brand slug already exists");
  const created = await createAdminBrand(parsed);
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create brand");
  return created;
}
export async function updateDashboardBrand(id: string, input: unknown) {
  const parsed = adminBrandUpdateSchema.parse(input);
  if (parsed.slug && (await getAdminBrandBySlug(parsed.slug, id))) throw new AppError("CONFLICT", "Brand slug already exists");
  const updated = await updateAdminBrand(id, parsed);
  if (!updated) throw new AppError("NOT_FOUND", "Brand not found");
  return updated;
}

async function createAdminCategoryPageContent(values: {
  categoryId: string;
  title: string;
  description: string | null;
  heroImage: string | null;
  fallbackHeroImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  const { upsertCategoryPageContent } = await import("./category.repo");
  return upsertCategoryPageContent(values.categoryId, {
    title: values.title,
    description: values.description,
    heroImageUrl: values.heroImage,
    fallbackHeroImageUrl: values.fallbackHeroImage,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  });
}

async function upsertAdminCategoryPageContent(categoryId: string, values: {
  title: string;
  description: string | null;
  heroImage: string | null;
  fallbackHeroImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}) {
  const { upsertCategoryPageContent } = await import("./category.repo");
  return upsertCategoryPageContent(categoryId, {
    title: values.title,
    description: values.description,
    heroImageUrl: values.heroImage,
    fallbackHeroImageUrl: values.fallbackHeroImage,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  });
}