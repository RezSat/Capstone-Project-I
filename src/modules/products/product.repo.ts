import { eq, like, sql, and, inArray } from "drizzle-orm";
import { db } from "../../core/db/client";
import { products, productVariants, inventoryItems, stockLocations, productMedia, files, productOptionGroups, productOptionValues, categories } from "../../core/db/schema";
import type { InsertProductInput, ProductActivityFilter, UpdateProductRecordInput } from "./product.types";

export async function insertProductWithInventory(
  input: InsertProductInput,
  variantId: string,
  locationId: string
) {
  return db.transaction(async (tx) => {
    const [product] = await tx.insert(products).values({
      name: input.name,
      slug: input.name.toLowerCase().replace(/\s+/g, "-"),
    }).returning();

    await tx.insert(productVariants).values({
      id: variantId,
      productId: product.id,
      sku: input.sku || `${product.id.slice(0, 8)}`,
      title: input.name,
      optionSignature: "default",
      priceMinor: input.priceMinor || 0,
    });

    const defaultLocation = await tx.select().from(stockLocations).where(eq(stockLocations.isDefault, true)).limit(1);
    const locId = defaultLocation[0]?.id ?? locationId;

    if (locId) {
      await tx.insert(inventoryItems).values({
        id: variantId,
        variantId: variantId,
        locationId: locId,
        quantityOnHand: 0,
        quantityReserved: 0,
      });
    }

    return product ?? null;
  });
}

export function findProductById(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
  });
}

export function getVariantById(variantId: string) {
  return db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
}

export function findProductBySku(sku: string) {
  return db.query.productVariants.findFirst({
    where: eq(productVariants.sku, sku),
  });
}

export function findProductsBySkuPrefix(prefix: string) {
  return db.select().from(productVariants).where(like(productVariants.sku, `${prefix}%`));
}

export function listProducts(activityFilter: ProductActivityFilter = "all") {
  if (activityFilter === "all") {
    return db.select().from(products);
  }
  return db
    .select()
    .from(products)
    .where(eq(products.status, activityFilter === "active" ? "active" : "inactive"));
}

export async function updateProductById(id: string, input: UpdateProductRecordInput) {
  const [product] = await db
    .update(products)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return product ?? null;
}

export async function bulkUpdateProductActiveState(productIds: string[], isActive: boolean) {
  if (productIds.length === 0) return [];

  const statusValue = isActive ? "active" : "inactive";
  const results = [];
  for (const id of productIds) {
    const [updated] = await db
      .update(products)
      .set({ status: statusValue, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    if (updated) results.push(updated);
  }
  return results;
}

export type PaginatedProducts<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductSearchParams = {
  query?: string;
  activityFilter?: ProductActivityFilter;
  sort?: string;
  page?: number;
  pageSize?: number;
  promoLabel?: "none" | "new_arrival" | "best_seller";
};

type OptValue = { name: string; value: string; hex: string | null };
type OptGroup = Map<string, OptValue>;
type VarOption = { name: string; value: string; hex: string | null };
type VarData = { id: string; optionSignature: string; metadata?: Record<string, unknown>; options: VarOption[] };

async function countProductsDb(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(products);
  return result[0]?.count ?? 0;
}

export async function searchProductsPaginated(params: ProductSearchParams) {
  const { page = 1, pageSize = 20, promoLabel } = params;
  const conditions = [];

  if (params.activityFilter === "active") {
    conditions.push(eq(products.status, "active"));
  } else if (params.activityFilter === "inactive") {
    conditions.push(eq(products.status, "inactive"));
  }

  if (promoLabel) {
    conditions.push(eq(products.promoLabel, promoLabel));
  }

  const total = await countProductsDb();
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
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
    .where(whereClause)
    .orderBy(sql`${products.createdAt} DESC`)
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

  const imagesMap = new Map<string, { publicUrl: string; isPrimary: boolean }[]>();
  for (const img of imageRows) {
    if (!img.publicUrl) continue;
    if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
    imagesMap.get(img.productId)!.push({ publicUrl: img.publicUrl, isPrimary: img.isPrimary });
  }

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

  const optionValuesMap = new Map<string, OptGroup>();
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

  const variantsMap = new Map<string, VarData[]>();
  for (const v of variantRows) {
    if (!variantsMap.has(v.productId)) variantsMap.set(v.productId, []);
    const ovMap = optionValuesMap.get(v.productId) ?? new Map();
    const opts: VarOption[] = [];
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

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.shortDescription,
    basePriceMinor: r.basePriceMinor,
    compareAtPriceMinor: r.compareAtPriceMinor,
    status: r.status,
    categoryName: r.categoryName ?? null,
    thumbnailUrl: r.thumbnailUrl,
    images: imagesMap.get(r.id) ?? [],
    variants: variantsMap.get(r.id) ?? [],
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function findProductsByIds(productIds: string[]) {
  if (productIds.length === 0) return [];

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
    .where(inArray(products.id, productIds));

  const imageRows = productIds.length > 0
    ? await db
        .select({ productId: productMedia.productId, publicUrl: files.publicUrl, isPrimary: productMedia.isPrimary })
        .from(productMedia)
        .innerJoin(files, eq(files.id, productMedia.fileId))
        .where(sql`${productMedia.productId} in ${productIds}`)
    : [];

  const imagesMap = new Map<string, { publicUrl: string; isPrimary: boolean }[]>();
  for (const img of imageRows) {
    if (!img.publicUrl) continue;
    if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
    imagesMap.get(img.productId)!.push({ publicUrl: img.publicUrl, isPrimary: img.isPrimary });
  }

  const variantRows = productIds.length > 0
    ? await db
        .select({ id: productVariants.id, productId: productVariants.productId, optionSignature: productVariants.optionSignature, metadata: productVariants.metadata })
        .from(productVariants)
        .where(and(inArray(productVariants.productId, productIds), eq(productVariants.status, "active")))
    : [];

  const optionValueRows = productIds.length > 0
    ? await db
        .select({ groupProductId: productOptionGroups.productId, groupLabel: productOptionGroups.label, ovLabel: productOptionValues.label, colorHex: productOptionValues.color })
        .from(productOptionValues)
        .innerJoin(productOptionGroups, eq(productOptionGroups.id, productOptionValues.groupId))
        .where(inArray(productOptionGroups.productId, productIds))
    : [];

  type OptGroup = Map<string, { name: string; value: string; hex: string | null }>;
  const optionValuesMap = new Map<string, OptGroup>();
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

  type VarOption = { name: string; value: string; hex: string | null };
  type VarData = { id: string; optionSignature: string; metadata?: Record<string, unknown>; options: VarOption[] };
  const variantsMap = new Map<string, VarData[]>();
  for (const v of variantRows) {
    if (!variantsMap.has(v.productId)) variantsMap.set(v.productId, []);
    const ovMap = optionValuesMap.get(v.productId) ?? new Map();
    const opts: VarOption[] = [];
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

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.shortDescription,
    basePriceMinor: r.basePriceMinor,
    compareAtPriceMinor: r.compareAtPriceMinor,
    status: r.status,
    categoryName: r.categoryName ?? null,
    thumbnailUrl: r.thumbnailUrl,
    images: imagesMap.get(r.id) ?? [],
    variants: variantsMap.get(r.id) ?? [],
  }));
}
