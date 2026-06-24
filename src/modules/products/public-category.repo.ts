import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/core/db/client";
import { categories, categoryFilters, categoryFilterOptions, products, productMedia, files, productVariants, productOptionGroups, productOptionValues, productContentSections } from "@/core/db/schema";

export type PublicCategoryFilters = {
  id: string;
  label: string;
  slug: string;
  sourceKey: string | null;
  sortOrder: number;
  isActive: boolean;
  options: Array<{ id: string; label: string; value: string; sortOrder: number; isActive: boolean }>;
};

export type PublicCategoryProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  status: string;
  thumbnailUrl: string | null;
  categoryName?: string | null;
  images?: { publicUrl: string; isPrimary: boolean }[];
  variants?: {
    id: string;
    optionSignature: string;
    metadata?: Record<string, unknown>;
    options: { name: string; value: string; hex: string | null }[];
  }[];
};

export async function getPublicCategoryByGroupSlug(groupSlug: string, slug: string) {
  const category = await db.query.categories.findFirst({
    where: and(and(eq(categories.groupSlug, groupSlug), eq(categories.slug, slug)), eq(categories.status, "active")),
    with: {
      pageContent: true,
      filters: {
        where: eq(categoryFilters.isActive, true),
        with: { options: { where: eq(categoryFilterOptions.isActive, true), orderBy: asc(categoryFilterOptions.sortOrder) } },
        orderBy: asc(categoryFilters.sortOrder),
      },
    },
  });

  if (!category) return null;

  const filters: PublicCategoryFilters[] = category.filters.map((f) => ({
    id: f.id, label: f.label, slug: f.slug, sourceKey: f.sourceKey ?? null, sortOrder: f.sortOrder, isActive: f.isActive,
    options: f.options.map((o) => ({ id: o.id, label: o.label, value: o.value, sortOrder: o.sortOrder, isActive: o.isActive })),
  }));

  const page = category.pageContent;

  return {
    id: category.id,
    groupSlug: category.groupSlug,
    slug: category.slug,
    name: category.name,
    title: page?.title ?? category.name,
    description: page?.description ?? category.description ?? null,
    heroImageUrl: page?.heroImageUrl ?? null,
    fallbackHeroImageUrl: page?.fallbackHeroImageUrl ?? null,
    seoTitle: page?.seoTitle ?? null,
    seoDescription: page?.seoDescription ?? null,
    filters,
    products: [] as PublicCategoryProduct[],
    totalProducts: 0,
  };
}

export type FilteredProductsResult = {
  items: PublicCategoryProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function parseBulletKeyValues(bullets: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!Array.isArray(bullets)) return map;
  for (const line of bullets) {
    if (typeof line !== "string") continue;
    const match = line.match(/^(.+?)\s*:\s*(.+)$/);
    if (match) {
      map.set(match[1].trim().toLowerCase(), match[2].trim().toLowerCase());
    }
  }
  return map;
}

function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/-/g, " ").trim();
}

function matchesFilters(
  bulletMap: Map<string, string>,
  selectedFilters: Record<string, string[]>,
  filterLabels: Map<string, string>,
): boolean {
  for (const [filterSlug, selectedValues] of Object.entries(selectedFilters)) {
    if (selectedValues.length === 0) continue;
    const filterLabel = filterLabels.get(filterSlug);
    if (!filterLabel) return false;
    const bulletKey = normalizeKey(filterLabel);
    const bulletValue = bulletMap.get(bulletKey);
    if (!bulletValue) return false;
    const matched = selectedValues.some((v) => bulletValue === normalizeKey(v));
    if (!matched) return false;
  }
  return true;
}

export async function getPublicCategoryProducts(
  categoryId: string,
  page: number,
  pageSize: number,
  selectedFilters?: Record<string, string[]>,
  filterLabels?: Map<string, string>,
): Promise<FilteredProductsResult> {
  const offset = (page - 1) * pageSize;
  const whereClause = and(eq(products.primaryCategoryId, categoryId), eq(products.status, "active"));

  const hasFilters = selectedFilters && filterLabels &&
    Object.values(selectedFilters).some((vals) => vals.length > 0);

  let allowedProductIds: string[] | null = null;

  if (hasFilters) {
    const allProductRows = await db
      .select({ id: products.id })
      .from(products)
      .where(whereClause);

    const allIds = allProductRows.map((r) => r.id);

    if (allIds.length > 0) {
      const contentRows = await db
        .select({ productId: productContentSections.productId, contentJson: productContentSections.contentJson })
        .from(productContentSections)
        .where(
          and(
            inArray(productContentSections.productId, allIds),
            eq(productContentSections.contentType, "bullets"),
          ),
        );

      allowedProductIds = [];
      for (const row of contentRows) {
        const bullets = row.contentJson?.bullets
          ?? (typeof row.contentJson?.body === "string" ? row.contentJson.body.split("\n") : []);
        const bulletMap = parseBulletKeyValues(bullets);
        if (matchesFilters(bulletMap, selectedFilters!, filterLabels!)) {
          allowedProductIds.push(row.productId);
        }
      }

      if (allowedProductIds.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 0 };
      }
    }
  }

  const countWhere = allowedProductIds
    ? and(whereClause, inArray(products.id, allowedProductIds))
    : whereClause;

  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(countWhere);
  const total = totalResult[0]?.count ?? 0;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      basePriceMinor: products.basePriceMinor,
      compareAtPriceMinor: products.compareAtPriceMinor,
      status: products.status,
      categoryName: categories.name,
      thumbnailUrl: files.publicUrl,
    })
    .from(products)
    .leftJoin(productMedia, and(eq(productMedia.productId, products.id), eq(productMedia.isPrimary, true)))
    .leftJoin(files, eq(files.id, productMedia.fileId))
    .leftJoin(categories, eq(categories.id, products.primaryCategoryId))
    .where(countWhere)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset(offset);

  const productIds = rows.map((r) => r.id);

  const imageRows = productIds.length > 0
    ? await db
        .select({ productId: productMedia.productId, publicUrl: files.publicUrl, isPrimary: productMedia.isPrimary })
        .from(productMedia)
        .innerJoin(files, eq(files.id, productMedia.fileId))
        .where(sql`${productMedia.productId} in ${productIds}`)
    : [];

  const variantRows = productIds.length > 0
    ? await db
        .select({ id: productVariants.id, productId: productVariants.productId, optionSignature: productVariants.optionSignature, metadata: productVariants.metadata })
        .from(productVariants)
        .where(and(sql`${productVariants.productId} in ${productIds}`, eq(productVariants.status, "active")))
    : [];

  const optionValueRows = productIds.length > 0
    ? await db
        .select({ groupProductId: productOptionGroups.productId, groupLabel: productOptionGroups.label, ovLabel: productOptionValues.label, colorHex: productOptionValues.color })
        .from(productOptionValues)
        .innerJoin(productOptionGroups, eq(productOptionGroups.id, productOptionValues.groupId))
        .where(sql`${productOptionGroups.productId} in ${productIds}`)
    : [];

  const imagesMap = new Map<string, { publicUrl: string; isPrimary: boolean }[]>();
  for (const img of imageRows) {
    if (!img.publicUrl) continue
    if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
    imagesMap.get(img.productId)!.push({ publicUrl: img.publicUrl, isPrimary: img.isPrimary });
  }

  const optionValuesMap = new Map<string, Map<string, { name: string; value: string; hex: string | null }>>();
  for (const row of optionValueRows) {
    if (!optionValuesMap.has(row.groupProductId)) optionValuesMap.set(row.groupProductId, new Map());
    const existing = optionValuesMap.get(row.groupProductId)!.get(row.ovLabel);
    if (!existing) {
      optionValuesMap.get(row.groupProductId)!.set(row.ovLabel, {
        name: row.groupLabel,
        value: row.ovLabel,
        hex: row.colorHex ?? null,
      });
    }
  }

  const variantsMap = new Map<string, { id: string; optionSignature: string; metadata?: Record<string, unknown>; options: { name: string; value: string; hex: string | null }[] }[]>();
  for (const v of variantRows) {
    if (!variantsMap.has(v.productId)) variantsMap.set(v.productId, []);
    const ovMap = optionValuesMap.get(v.productId) ?? new Map();
    const opts: { name: string; value: string; hex: string | null }[] = [];
    const parts = v.optionSignature.split(" / ");
    for (const part of parts) {
      const trimmed = part.trim();
      const matched = ovMap.get(trimmed);
      opts.push({ name: trimmed, value: trimmed, hex: matched?.hex ?? null });
    }
    variantsMap.get(v.productId)!.push({
      id: v.id,
      optionSignature: v.optionSignature,
      metadata: (v.metadata ?? null) as Record<string, unknown> | undefined,
      options: opts,
    });
  }

  const items: PublicCategoryProduct[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.shortDescription,
    basePriceMinor: r.basePriceMinor,
    compareAtPriceMinor: r.compareAtPriceMinor,
    status: r.status,
    thumbnailUrl: r.thumbnailUrl,
    categoryName: r.categoryName ?? undefined,
    images: imagesMap.get(r.id) ?? [],
    variants: variantsMap.get(r.id) ?? [],
  }));

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}