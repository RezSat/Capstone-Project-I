import { and, eq, asc, sql } from "drizzle-orm";
import { db } from "@/core/db/client";
import { products, productMedia, files, categories, brands, productContentSections, productVariants, inventoryItems, productOptionGroups, productOptionValues } from "@/core/db/schema";

export type PublicProductData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  currencyCode: string;
  status: string;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  group: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  brandName: string | null;
  images: Array<{ id: string; src: string; alt: string | null; isPrimary: boolean; sortOrder: number }>;
  optionGroups: Array<{ id: string; label: string; type: string; values: Array<{ id: string; label: string; value: string; color?: string; available: boolean; hex?: string | null }> }>;
  paymentPromos: Array<{ text: string }>;
  accordions: Array<{ id: string; title: string; contentType: string; contentJson: Record<string, unknown>; defaultOpen: boolean }>;
  variants: Array<{ id: string; title: string; priceMinor: number; compareAtPriceMinor: number | null; optionSignature: string; availableStock: number }>;
};

export async function getStorefrontProductBySlug(slug: string): Promise<PublicProductData | null> {
  try {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        basePriceMinor: products.basePriceMinor,
        compareAtPriceMinor: products.compareAtPriceMinor,
        currencyCode: products.currencyCode,
        status: products.status,
        isFeatured: products.isFeatured,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        group: products.group,
        categorySlug: products.categorySlug,
        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.primaryCategoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.slug, slug), eq(products.status, "active")))
      .limit(1);

    if (!product[0]) return null;

    const [imageRows, contentRows, variantRows, optionGroupRows] = await Promise.all([
      db.select({
        id: productMedia.id,
        src: files.publicUrl,
        altText: productMedia.altText,
        isPrimary: productMedia.isPrimary,
        sortOrder: productMedia.sortOrder,
      }).from(productMedia).leftJoin(files, eq(productMedia.fileId, files.id)).where(eq(productMedia.productId, product[0].id)).orderBy(productMedia.sortOrder),
      db.select({
        id: productContentSections.id,
        title: productContentSections.title,
        contentType: productContentSections.contentType,
        contentJson: productContentSections.contentJson,
        defaultOpen: productContentSections.defaultOpen,
      }).from(productContentSections).where(eq(productContentSections.productId, product[0].id)).orderBy(asc(productContentSections.sortOrder)),
      db.select({
        id: productVariants.id,
        title: productVariants.title,
        priceMinor: productVariants.priceMinor,
        compareAtPriceMinor: productVariants.compareAtPriceMinor,
        optionSignature: productVariants.optionSignature,
      }).from(productVariants).where(eq(productVariants.productId, product[0].id)),
      db.select().from(productOptionGroups).where(eq(productOptionGroups.productId, product[0].id)).orderBy(asc(productOptionGroups.sortOrder)),
    ]);

    const images = imageRows.map((row) => ({
      id: row.id,
      src: row.src ?? "",
      alt: row.altText,
      isPrimary: row.isPrimary,
      sortOrder: row.sortOrder,
    }));

    const accordions = contentRows.map((row) => ({
      id: row.id,
      title: row.title,
      contentType: row.contentType,
      contentJson: row.contentJson,
      defaultOpen: row.defaultOpen,
    }));

    const optionGroupIds = optionGroupRows.map(g => g.id);
    const optionValueRows = optionGroupIds.length > 0
      ? await db.select().from(productOptionValues).where(sql`${productOptionValues.groupId} in ${optionGroupIds}`).orderBy(asc(productOptionValues.sortOrder))
      : [];

    const variantIds = variantRows.map(v => v.id);
    const inventoryRows = variantIds.length > 0
      ? await db.select().from(inventoryItems).where(sql`${inventoryItems.variantId} in ${variantIds}`)
      : [];

    const variantInventoryMap = new Map<string, number>();
    for (const inv of inventoryRows) {
      const existing = variantInventoryMap.get(inv.variantId) ?? 0;
      variantInventoryMap.set(inv.variantId, existing + inv.quantityOnHand - inv.quantityReserved);
    }

    function isOptionValueAvailable(optionValueId: string): boolean {
      const matchingVariants = variantRows.filter(v => {
        const signatureParts = v.optionSignature.split(" / ");
        return signatureParts.some(part => part.trim() === optionValueId);
      });
      if (matchingVariants.length === 0) return true;
      return matchingVariants.some(v => (variantInventoryMap.get(v.id) ?? 0) > 0);
    }

    const variantStockMap = new Map<string, number>();
    for (const inv of inventoryRows) {
      variantStockMap.set(inv.variantId, inv.quantityOnHand - inv.quantityReserved);
    }

    const enrichedVariants = variantRows.map(v => ({
      id: v.id,
      title: v.title,
      priceMinor: v.priceMinor,
      compareAtPriceMinor: v.compareAtPriceMinor ?? null,
      optionSignature: v.optionSignature,
      availableStock: variantStockMap.get(v.id) ?? 0,
    }));

    const optionGroups = optionGroupRows.map(group => {
      const values = optionValueRows
        .filter(v => v.groupId === group.id)
        .map(v => ({
          id: v.id,
          label: v.label,
          value: v.value,
          color: v.color ?? undefined,
          hex: v.color ?? null,
          available: isOptionValueAvailable(v.id),
        }));
      return {
        id: group.id,
        label: group.label,
        type: group.type,
        values,
      };
    });

    return {
      ...product[0],
      images,
      optionGroups,
      paymentPromos: [],
      accordions,
      variants: enrichedVariants,
    };
  } catch (error) {
    console.error("❌ STOREFRONT FETCH AGGREGATION FAILED:", error);
    return null;
  }
}