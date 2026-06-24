import { and, asc, eq, ne, or } from "drizzle-orm";
import { db } from "../../core/db/client";
import { inventoryItems, productAttributes, productAttributeValues, productVariantOptions, productVariants, products, stockLocations } from "../../core/db/schema";

export const getProductById = (productId: string) => db.query.products.findFirst({ where: eq(products.id, productId) });

export const listAttributesByProduct = (productId: string) =>
  db.select().from(productAttributes).where(eq(productAttributes.productId, productId)).orderBy(asc(productAttributes.sortOrder));
export const getAttributeById = (productId: string, attributeId: string) =>
  db.query.productAttributes.findFirst({ where: and(eq(productAttributes.id, attributeId), eq(productAttributes.productId, productId)) });
export const getAttributeBySlug = (productId: string, slug: string, excludeId?: string) =>
  db.query.productAttributes.findFirst({ where: and(eq(productAttributes.productId, productId), eq(productAttributes.slug, slug), excludeId ? ne(productAttributes.id, excludeId) : undefined) });
export async function createAttribute(values: typeof productAttributes.$inferInsert) {
  const [created] = await db.insert(productAttributes).values(values).returning();
  return created ?? null;
}
export async function updateAttribute(attributeId: string, values: Partial<typeof productAttributes.$inferInsert>) {
  const [updated] = await db.update(productAttributes).set(values).where(eq(productAttributes.id, attributeId)).returning();
  return updated ?? null;
}

export async function deleteAttribute(attributeId: string) {
  const [deleted] = await db.delete(productAttributes).where(eq(productAttributes.id, attributeId)).returning();
  return deleted ?? null;
}

export const listVariantsByProduct = (productId: string) =>
  db.select().from(productVariants).where(eq(productVariants.productId, productId)).orderBy(asc(productVariants.createdAt));

export type VariantWithOptions = Awaited<ReturnType<typeof listVariantsByProductWithOptions>>[number];

export async function listVariantsByProductWithOptions(productId: string) {
  const variantList = await db.select().from(productVariants).where(eq(productVariants.productId, productId)).orderBy(asc(productVariants.createdAt));
  
  if (variantList.length === 0) return variantList;
  
  const variantIds = variantList.map((v) => v.id);
  
  const optionsWithValues = await db
    .select({
      variantId: productVariantOptions.variantId,
      attributeId: productVariantOptions.attributeId,
      attributeName: productAttributes.name,
      attributeValueId: productVariantOptions.attributeValueId,
      attributeValueLabel: productAttributeValues.label,
    })
    .from(productVariantOptions)
    .innerJoin(productAttributes, eq(productVariantOptions.attributeId, productAttributes.id))
    .innerJoin(productAttributeValues, eq(productVariantOptions.attributeValueId, productAttributeValues.id))
    .where(
      variantIds.length === 1 
        ? eq(productVariantOptions.variantId, variantIds[0])
        : or(...variantIds.map((id) => eq(productVariantOptions.variantId, id)))!
    );
  
  const optionsMap: Record<string, typeof optionsWithValues> = {};
  for (const opt of optionsWithValues) {
    if (!optionsMap[opt.variantId]) optionsMap[opt.variantId] = [];
    optionsMap[opt.variantId].push(opt);
  }
  
  return variantList.map((v) => ({
    ...v,
    options: optionsMap[v.id] ?? [],
  }));
}
export const getVariantById = (productId: string, variantId: string) =>
  db.query.productVariants.findFirst({ where: and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)) });
export const getVariantBySku = (sku: string, excludeId?: string) =>
  db.query.productVariants.findFirst({ where: and(eq(productVariants.sku, sku), excludeId ? ne(productVariants.id, excludeId) : undefined) });
export const getVariantBySignature = (productId: string, optionSignature: string) =>
  db.query.productVariants.findFirst({ where: and(eq(productVariants.productId, productId), eq(productVariants.optionSignature, optionSignature)) });
export async function createVariant(values: typeof productVariants.$inferInsert) {
  const [created] = await db.insert(productVariants).values(values).returning();
  return created ?? null;
}
export async function updateVariant(variantId: string, values: Partial<typeof productVariants.$inferInsert>) {
  const [updated] = await db.update(productVariants).set({ ...values, updatedAt: new Date() }).where(eq(productVariants.id, variantId)).returning();
  return updated ?? null;
}
export async function deleteVariant(variantId: string) {
  await db.delete(productVariantOptions).where(eq(productVariantOptions.variantId, variantId));
  const [deleted] = await db.delete(productVariants).where(eq(productVariants.id, variantId)).returning();
  return deleted ?? null;
}

export const listValuesByAttribute = (attributeId: string) =>
  db.select().from(productAttributeValues).where(eq(productAttributeValues.attributeId, attributeId)).orderBy(asc(productAttributeValues.sortOrder));
export const getValueById = (attributeId: string, valueId: string) =>
  db.query.productAttributeValues.findFirst({ where: and(eq(productAttributeValues.id, valueId), eq(productAttributeValues.attributeId, attributeId)) });
export const getValueByValue = (attributeId: string, value: string, excludeId?: string) =>
  db.query.productAttributeValues.findFirst({ where: and(eq(productAttributeValues.attributeId, attributeId), eq(productAttributeValues.value, value), excludeId ? ne(productAttributeValues.id, excludeId) : undefined) });
export async function createAttributeValue(values: typeof productAttributeValues.$inferInsert) {
  const [created] = await db.insert(productAttributeValues).values(values).returning();
  return created ?? null;
}
export async function updateAttributeValue(valueId: string, values: Partial<typeof productAttributeValues.$inferInsert>) {
  const [updated] = await db.update(productAttributeValues).set(values).where(eq(productAttributeValues.id, valueId)).returning();
  return updated ?? null;
}

export async function upsertVariantOptions(variantId: string, pairs: Array<{ attributeId: string; attributeValueId: string }>) {
  await db.delete(productVariantOptions).where(eq(productVariantOptions.variantId, variantId));
  if (pairs.length > 0) await db.insert(productVariantOptions).values(pairs.map((pair) => ({ ...pair, variantId })));
}

export function getDefaultStockLocation() {
  return db.query.stockLocations.findFirst({ where: eq(stockLocations.isDefault, true) });
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

export async function findInventoryByVariantId(variantId: string) {
  return db.query.inventoryItems.findFirst({ where: eq(inventoryItems.variantId, variantId) });
}
