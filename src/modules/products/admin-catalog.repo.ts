import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../../core/db/client";
import { brands, categories, categoryFilters, categoryFilterOptions, files, inventoryItems, productMedia, productContentSections, productVariants, products, stockLocations, productOptionGroups, productOptionValues } from "../../core/db/schema";

export async function listAdminCategoryFiltersWithOptions(categoryId: string) {
  const rows = await db
    .select({
      id: categoryFilters.id,
      label: categoryFilters.label,
      slug: categoryFilters.slug,
      sourceKey: categoryFilters.sourceKey,
      sortOrder: categoryFilters.sortOrder,
      isActive: categoryFilters.isActive,
      optionId: categoryFilterOptions.id,
      optionLabel: categoryFilterOptions.label,
      optionValue: categoryFilterOptions.value,
      optionSortOrder: categoryFilterOptions.sortOrder,
      optionIsActive: categoryFilterOptions.isActive,
    })
    .from(categoryFilters)
    .leftJoin(categoryFilterOptions, eq(categoryFilters.id, categoryFilterOptions.filterId))
    .where(eq(categoryFilters.categoryId, categoryId))
    .orderBy(asc(categoryFilters.sortOrder), asc(categoryFilterOptions.sortOrder));

  const filterMap = new Map<string, { id: string; label: string; slug: string; sourceKey: string | null; sortOrder: number; isActive: boolean; options: { id: string; label: string; value: string; sortOrder: number; isActive: boolean }[] }>();
  for (const row of rows) {
    if (!filterMap.has(row.id)) {
      filterMap.set(row.id, { id: row.id, label: row.label, slug: row.slug, sourceKey: row.sourceKey ?? null, sortOrder: row.sortOrder, isActive: row.isActive, options: [] });
    }
    if (row.optionId && row.optionLabel && row.optionValue && row.optionSortOrder !== null && row.optionSortOrder !== undefined && row.optionIsActive !== null && row.optionIsActive !== undefined) {
      filterMap.get(row.id)!.options.push({ id: row.optionId, label: row.optionLabel, value: row.optionValue, sortOrder: row.optionSortOrder, isActive: row.optionIsActive });
    }
  }
  return Array.from(filterMap.values());
}

export const listAdminProducts = () =>
  db.select().from(products).orderBy(asc(products.createdAt));

export const getAdminProductById = (id: string) =>
  db.query.products.findFirst({ where: eq(products.id, id) });

export const getAdminProductBySlug = (slug: string, excludeId?: string) =>
  db.query.products.findFirst({ where: excludeId ? and(eq(products.slug, slug), ne(products.id, excludeId)) : eq(products.slug, slug) });

export async function createAdminProduct(values: typeof products.$inferInsert) {
  const [created] = await db.insert(products).values(values).returning();
  return created ?? null;
}

export async function createDefaultVariant(productId: string, name: string, priceMinor: number) {
  const [created] = await db.insert(productVariants).values({
    productId,
    sku: `default-${productId.slice(0, 8)}`,
    title: `${name} Default`,
    optionSignature: "default",
    isDefault: true,
    priceMinor,
  }).returning();
  if (created) {
    await upsertInventoryForVariant(created.id, 0);
  }
  return created ?? null;
}

export function getDefaultStockLocation() {
  return db.query.stockLocations.findFirst({ where: eq(stockLocations.isDefault, true) });
}

export function findInventoryByVariantId(variantId: string) {
  return db.query.inventoryItems.findFirst({ where: eq(inventoryItems.variantId, variantId) });
}

type CreateInventoryInput = {
  variantId: string;
  locationId: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  lowStockThreshold?: number;
};

export async function createInventoryForVariant(input: CreateInventoryInput) {
  const [created] = await db.insert(inventoryItems).values({
    variantId: input.variantId,
    locationId: input.locationId,
    quantityOnHand: input.quantityOnHand ?? 0,
    quantityReserved: input.quantityReserved ?? 0,
    lowStockThreshold: input.lowStockThreshold ?? 0,
  }).returning();
  return created ?? null;
}

export async function updateAdminProduct(id: string, values: Partial<typeof products.$inferInsert>) {
  const [updated] = await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, id)).returning();
  return updated ?? null;
}

export const listAdminCategories = () => db.select().from(categories).orderBy(asc(categories.fullSlug));

export async function listDistinctGroupSlugs() {
  const rows = await db.selectDistinct({ groupSlug: categories.groupSlug }).from(categories);
  return rows.map((r) => r.groupSlug).filter(Boolean).sort();
}
export const getAdminCategoryBySlug = (groupSlug: string, slug: string, excludeId?: string) =>
  db.query.categories.findFirst({ where: excludeId ? and(eq(categories.groupSlug, groupSlug), eq(categories.slug, slug), ne(categories.id, excludeId)) : and(eq(categories.groupSlug, groupSlug), eq(categories.slug, slug)) });

export async function createAdminCategory(values: typeof categories.$inferInsert) {
  const [created] = await db.insert(categories).values(values).returning();
  return created ?? null;
}

export async function updateAdminCategory(id: string, values: Partial<typeof categories.$inferInsert>) {
  const [updated] = await db.update(categories).set({ ...values, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
  return updated ?? null;
}

export const getAdminCategoryById = (id: string) =>
  db.query.categories.findFirst({ where: eq(categories.id, id), with: { pageContent: true } });

export const listAdminCategoryFilters = (categoryId: string) =>
  db.select().from(categoryFilters).where(eq(categoryFilters.categoryId, categoryId)).orderBy(asc(categoryFilters.sortOrder));

export async function createAdminCategoryFilter(values: typeof categoryFilters.$inferInsert) {
  const [created] = await db.insert(categoryFilters).values(values).returning();
  return created ?? null;
}

export async function updateAdminCategoryFilter(id: string, values: Partial<typeof categoryFilters.$inferInsert>) {
  const [updated] = await db.update(categoryFilters).set(values).where(eq(categoryFilters.id, id)).returning();
  return updated ?? null;
}

export async function deleteAdminCategoryFilter(id: string) {
  await db.delete(categoryFilters).where(eq(categoryFilters.id, id));
}

export async function createAdminCategoryFilterOption(values: typeof categoryFilterOptions.$inferInsert) {
  const [created] = await db.insert(categoryFilterOptions).values(values).returning();
  return created ?? null;
}

export async function updateAdminCategoryFilterOption(id: string, values: Partial<typeof categoryFilterOptions.$inferInsert>) {
  const [updated] = await db.update(categoryFilterOptions).set(values).where(eq(categoryFilterOptions.id, id)).returning();
  return updated ?? null;
}

export async function deleteAdminCategoryFilterOption(id: string) {
  await db.delete(categoryFilterOptions).where(eq(categoryFilterOptions.id, id));
}

export const listAdminCategoryFilterOptions = (filterId: string) =>
  db.select().from(categoryFilterOptions).where(eq(categoryFilterOptions.filterId, filterId)).orderBy(asc(categoryFilterOptions.sortOrder));

export const listAdminBrands = () => db.select().from(brands).orderBy(asc(brands.name));
export const getAdminBrandBySlug = (slug: string, excludeId?: string) =>
  db.query.brands.findFirst({ where: excludeId ? and(eq(brands.slug, slug), ne(brands.id, excludeId)) : eq(brands.slug, slug) });
export async function createAdminBrand(values: typeof brands.$inferInsert) {
  const [created] = await db.insert(brands).values(values).returning();
  return created ?? null;
}
export async function updateAdminBrand(id: string, values: Partial<typeof brands.$inferInsert>) {
  const [updated] = await db.update(brands).set({ ...values, updatedAt: new Date() }).where(eq(brands.id, id)).returning();
  return updated ?? null;
}

export async function syncProductImages(productId: string, images: Array<{ src: string; alt?: string | null; orientation?: string }>) {
  await db.delete(productMedia).where(eq(productMedia.productId, productId));
  if (images.length === 0) return;

  for (let idx = 0; idx < images.length; idx++) {
    const img = images[idx];
    let fileId = img.src;

    if (!img.src.startsWith("http") && !img.src.includes("://")) {
      const [file] = await db.select({ id: files.id }).from(files).where(eq(files.publicUrl, img.src)).limit(1);
      if (file) fileId = file.id;
    }

    await db.insert(productMedia).values({
      productId,
      fileId,
      role: "gallery",
      altText: img.alt ?? null,
      isPrimary: idx === 0,
      sortOrder: idx,
    });
  }
}

export async function syncProductAccordions(productId: string, accordions: Array<{ id?: string; title: string; contentType: string; bullets?: string[]; paragraphs?: string[] }>) {
  await db.delete(productContentSections).where(eq(productContentSections.productId, productId));
  if (accordions.length === 0) return;
  const values = accordions.map((acc, idx) => ({
    productId,
    key: acc.id ?? `section-${idx}`,
    title: acc.title,
    contentType: acc.contentType,
    contentJson: acc.contentType === "bullets"
      ? { body: (acc.bullets ?? []).join("\n"), defaultOpen: true }
      : { body: (acc.paragraphs ?? []).join("\n"), defaultOpen: true },
    sortOrder: idx,
    defaultOpen: true,
  }));
  await db.insert(productContentSections).values(values as typeof productContentSections.$inferInsert[]);
}

export async function upsertProductOptionGroups(productId: string, optionGroups: Array<{
  id?: string;
  name: string;
  slug: string;
  displayType: string;
  isVariantAttribute?: boolean;
  isRequired?: boolean;
  sortOrder?: number;
  values?: Array<{ id?: string; label: string; value: string; color?: string; available?: boolean }>;
}>) {
  await db.delete(productOptionGroups).where(eq(productOptionGroups.productId, productId));
  if (optionGroups.length === 0) return;

  for (let gIdx = 0; gIdx < optionGroups.length; gIdx++) {
    const group = optionGroups[gIdx];
    const [created] = await db.insert(productOptionGroups).values({
      productId,
      label: group.name,
      selectedLabel: group.name,
      type: group.displayType,
      sortOrder: group.sortOrder ?? gIdx,
    }).returning();
    if (!created) continue;

    if (group.values) {
      for (let vIdx = 0; vIdx < group.values.length; vIdx++) {
        const val = group.values[vIdx];
        await db.insert(productOptionValues).values({
          groupId: created.id,
          label: val.label,
          value: val.value,
          color: val.color ?? null,
          available: val.available ?? true,
          sortOrder: vIdx,
        });
      }
    }
  }
}

export async function upsertProductAccordionsDetailed(productId: string, accordions: Array<{
  id?: string;
  title: string;
  contentType: string;
  bullets?: string[];
  paragraphs?: string[];
}>, bulletsMap: Record<string, string[]>, paragraphsMap: Record<string, string[]>) {
  await db.delete(productContentSections).where(eq(productContentSections.productId, productId));
  if (accordions.length === 0) return;

  for (let idx = 0; idx < accordions.length; idx++) {
    const acc = accordions[idx];
    const accKey = acc.id ?? `section-${idx}`;
    const bullets = bulletsMap[accKey] ?? acc.bullets ?? [];
    const paragraphs = paragraphsMap[accKey] ?? acc.paragraphs ?? [];

    const contentJson = acc.contentType === "bullets"
      ? { body: bullets.join("\n"), bullets, defaultOpen: true }
      : { body: paragraphs.join("\n"), paragraphs, defaultOpen: true };

    await db.insert(productContentSections).values({
      productId,
      key: accKey,
      title: acc.title,
      contentType: acc.contentType as "bullets" | "paragraphs",
      contentJson: contentJson as typeof productContentSections.$inferInsert.contentJson,
      sortOrder: idx,
      defaultOpen: true,
    });
  }
}

type VariantRowForUpsert = {
  id?: string;
  sku: string;
  title: string;
  priceOverride?: number;
  optionSignature: string;
  initialStock?: number;
};

export async function buildVariantRowsFromOptionGroups(
  productName: string,
  productSlug: string,
  optionGroups: Array<{
    name: string;
    values?: Array<{ label: string; value: string }>;
  }>
): Promise<VariantRowForUpsert[]> {
  if (optionGroups.length === 0) {
    return [];
  }
  const groupArrays = optionGroups.map((g) => g.values ?? []);
  const allGroupsPopulated = groupArrays.every((arr) => arr.length > 0);
  if (!allGroupsPopulated || groupArrays.length === 0) {
    return [];
  }

  const rows: VariantRowForUpsert[] = [];

  if (groupArrays.length === 1) {
    for (const val of groupArrays[0]) {
      const sig = val.label;
      rows.push({
        sku: `${productSlug}-${val.value}`.toLowerCase(),
        title: `${productName} ${sig}`,
        optionSignature: sig,
      });
    }
  } else if (groupArrays.length === 2) {
    for (const v1 of groupArrays[0]) {
      for (const v2 of groupArrays[1]) {
        const sig = `${v1.label} / ${v2.label}`;
        rows.push({
          sku: `${productSlug}-${v1.value}-${v2.value}`.toLowerCase(),
          title: `${productName} ${sig}`,
          optionSignature: sig,
        });
      }
    }
  } else {
    function cartesian<T>(arrays: T[][]): T[][] {
      if (arrays.length === 0) return [[]];
      return arrays.reduce<T[][]>((acc, arr) => {
        const next: T[][] = [];
        for (const combo of acc) {
          for (const item of arr) {
            next.push([...combo, item]);
          }
        }
        return next;
      }, [[]]);
    }
    const combos = cartesian(groupArrays);
    for (const combo of combos) {
      const labels = combo.map((v) => (v as { label: string }).label);
      const values = combo.map((v) => (v as { value: string }).value);
      const sig = labels.join(" / ");
      rows.push({
        sku: `${productSlug}-${values.join("-")}`.toLowerCase(),
        title: `${productName} ${sig}`,
        optionSignature: sig,
      });
    }
  }

  return rows;
}

export async function upsertProductVariants(productId: string, variants: Array<{
  id?: string;
  sku: string;
  title: string;
  priceOverride?: number;
  optionSignature: string;
  initialStock?: number;
}>, basePriceMinor: number) {
  const existing = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  const existingMap = new Map(existing.map(v => [v.optionSignature, v]));

  for (const variant of variants) {
    const price = variant.priceOverride ?? basePriceMinor;
    if (existingMap.has(variant.optionSignature)) {
      const [updated] = await db.update(productVariants)
        .set({ sku: variant.sku, title: variant.title, priceMinor: price, optionSignature: variant.optionSignature })
        .where(eq(productVariants.id, existingMap.get(variant.optionSignature)!.id))
        .returning();
      if (updated && variant.initialStock !== undefined) {
        await upsertInventoryForVariant(updated.id, variant.initialStock);
      }
    } else {
      const [created] = await db.insert(productVariants).values({
        productId,
        sku: variant.sku,
        title: variant.title,
        optionSignature: variant.optionSignature,
        priceMinor: price,
        isDefault: variants.length === 1,
      }).returning();
      if (created) {
        await upsertInventoryForVariant(created.id, variant.initialStock ?? 0);
      }
    }
  }

  const currentSigs = new Set(variants.map((v) => v.optionSignature));
  const toArchive = existing.filter((e) => !currentSigs.has(e.optionSignature) && e.status === "active");
  for (const orphan of toArchive) {
    const inv = await db.query.inventoryItems.findFirst({ where: eq(inventoryItems.variantId, orphan.id) });
    if (!inv || (inv.quantityOnHand === 0 && inv.quantityReserved === 0)) {
      await db.update(productVariants).set({ status: "archived", archivedAt: new Date() }).where(eq(productVariants.id, orphan.id));
    }
  }
}

async function upsertInventoryForVariant(variantId: string, quantityOnHand: number) {
  const location = await getDefaultStockLocation();
  if (!location) return;
  const existing = await db.query.inventoryItems.findFirst({ where: eq(inventoryItems.variantId, variantId) });
  if (existing) {
    await db.update(inventoryItems).set({ quantityOnHand }).where(eq(inventoryItems.id, existing.id));
  } else {
    await db.insert(inventoryItems).values({
      variantId,
      locationId: location.id,
      quantityOnHand,
      quantityReserved: 0,
      lowStockThreshold: 0,
    });
  }
}
