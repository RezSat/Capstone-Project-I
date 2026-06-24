import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { inventoryItems, productVariants, products, stockLocations } from "@/core/db/schema";

export type AdminInventoryVariant = {
  variantId: string;
  sku: string;
  optionSignature: string;
  quantityOnHand: number;
  quantityReserved: number;
  priceMinor: number;
  compareAtPriceMinor: number | null;
};

export type AdminInventoryProduct = {
  productId: string;
  title: string;
  slug: string;
  variants: AdminInventoryVariant[];
};

export async function listAdminInventoryCatalog(): Promise<AdminInventoryProduct[]> {
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      variantId: productVariants.id,
      variantSku: productVariants.sku,
      variantOptionSignature: productVariants.optionSignature,
      quantityOnHand: inventoryItems.quantityOnHand,
      quantityReserved: inventoryItems.quantityReserved,
      priceMinor: productVariants.priceMinor,
      compareAtPriceMinor: productVariants.compareAtPriceMinor,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
    .where(eq(productVariants.status, "active"))
    .orderBy(products.name, productVariants.sku);

  const productMap = new Map<string, AdminInventoryProduct>();

  for (const row of rows) {
    if (!productMap.has(row.productId)) {
      productMap.set(row.productId, {
        productId: row.productId,
        title: row.productName,
        slug: row.productSlug,
        variants: [],
      });
    }
    productMap.get(row.productId)!.variants.push({
      variantId: row.variantId,
      sku: row.variantSku,
      optionSignature: row.variantOptionSignature,
      quantityOnHand: row.quantityOnHand ?? 0,
      quantityReserved: row.quantityReserved ?? 0,
      priceMinor: row.priceMinor ?? 0,
      compareAtPriceMinor: row.compareAtPriceMinor ?? null,
    });
  }

  return Array.from(productMap.values());
}

export type AdminInventoryUpdateInput = {
  variantId: string;
  quantityOnHand: number;
  priceMinor?: number | null;
  compareAtPriceMinor?: number | null;
};

export async function updateAdminInventoryItem(input: AdminInventoryUpdateInput) {
  let location = await db.query.stockLocations.findFirst({
    where: eq(stockLocations.isActive, true),
  });

  if (!location) {
    const [newLocation] = await db.insert(stockLocations).values({
      name: "Main Warehouse",
      code: "MAIN-WH",
      type: "warehouse",
      isActive: true,
      isDefault: true,
    }).returning();
    location = newLocation;
    console.log("📦 SYSTEM SEEDED REGISTRATION HOOK: 'Main Warehouse' built successfully.");
  }

  const [updatedItem] = await db.insert(inventoryItems)
    .values({
      variantId: input.variantId,
      locationId: location.id,
      quantityOnHand: input.quantityOnHand,
      quantityReserved: 0,
      lowStockThreshold: 0,
    })
    .onConflictDoUpdate({
      target: [inventoryItems.variantId, inventoryItems.locationId],
      set: {
        quantityOnHand: input.quantityOnHand,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (input.priceMinor !== undefined || input.compareAtPriceMinor !== undefined) {
    const variantRow = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, input.variantId),
      with: { product: true },
    });

    const fallbackPrice = variantRow?.product?.basePriceMinor ?? 0;
    const priceToSet = (input.priceMinor === null || input.priceMinor === undefined || input.priceMinor === 0)
      ? fallbackPrice
      : input.priceMinor;
    const compareToSet = input.compareAtPriceMinor === undefined ? null : input.compareAtPriceMinor;

    await db.update(productVariants)
      .set({ priceMinor: priceToSet, compareAtPriceMinor: compareToSet })
      .where(eq(productVariants.id, input.variantId));
  }

  return updatedItem ?? null;
}