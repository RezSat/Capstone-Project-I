import { db } from "@/core/db/client";
import { products, productMedia, productContentSections, files, productOptionGroups, productOptionValues, productVariants, inventoryItems, stockLocations } from "@/core/db/schema";
import { eq, asc } from "drizzle-orm";

export type EditImageEntry = {
  id: string;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape" | "square";
};

export type EditAccordionEntry = {
  id: string;
  title: string;
  contentType: "bullets" | "paragraphs";
  bullets: string[];
  paragraphs: string[];
};

export type EditOptionGroup = {
  id: string;
  name: string;
  slug: string;
  displayType: string;
  values: Array<{ id: string; label: string; value: string; color?: string | null }>;
};

export type EditVariantRow = {
  id: string;
  sku: string;
  title: string;
  priceOverride: number;
  optionSignature: string;
  initialStock: number;
};

export type ProductEditData = {
  id: string;
  name: string;
  slug: string;
  status: string;
  shortDescription: string | null;
  description: string | null;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  promoLabel: string;
  primaryCategoryId: string | null;
  brandId: string | null;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: EditImageEntry[];
  accordions: EditAccordionEntry[];
  optionGroups: EditOptionGroup[];
  variantRows: EditVariantRow[];
};

export async function getProductEditData(productId: string): Promise<ProductEditData | null> {
  try {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        shortDescription: products.shortDescription,
        description: products.description,
        basePriceMinor: products.basePriceMinor,
        compareAtPriceMinor: products.compareAtPriceMinor,
        promoLabel: products.promoLabel,
        primaryCategoryId: products.primaryCategoryId,
        brandId: products.brandId,
        isFeatured: products.isFeatured,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      console.error("❌ EDIT DATA LOADER CAPTURED EMPTY ROW FOR PARAMETER: productId =", productId);
      return null;
    }

  const imageRows = await db
    .select({
      id: productMedia.id,
      fileId: productMedia.fileId,
      altText: productMedia.altText,
      isPrimary: productMedia.isPrimary,
      sortOrder: productMedia.sortOrder,
      publicUrl: files.publicUrl,
    })
    .from(productMedia)
    .leftJoin(files, eq(productMedia.fileId, files.id))
    .where(eq(productMedia.productId, productId))
    .orderBy(asc(productMedia.sortOrder));

  const images: EditImageEntry[] = imageRows.map((row) => ({
    id: row.id,
    src: row.publicUrl ?? "",
    alt: row.altText ?? "",
    orientation: "square" as const,
  }));

  const accordionRows = await db
    .select()
    .from(productContentSections)
    .where(eq(productContentSections.productId, productId))
    .orderBy(asc(productContentSections.sortOrder));

  const accordions: EditAccordionEntry[] = accordionRows.map((row) => {
    const contentJson = (row.contentJson as Record<string, unknown>) ?? {};
    const body = (contentJson.body as string) ?? "";
    const lines = body ? body.split("\n").filter((l) => l.trim()) : [];
    return {
      id: row.id,
      title: row.title,
      contentType: row.contentType as "bullets" | "paragraphs",
      bullets: row.contentType === "bullets" ? lines : [],
      paragraphs: row.contentType === "paragraphs" ? lines : [],
    };
  });

  const optionGroupRows = await db
    .select()
    .from(productOptionGroups)
    .where(eq(productOptionGroups.productId, productId))
    .orderBy(asc(productOptionGroups.sortOrder));

  const optionGroups: EditOptionGroup[] = await Promise.all(
    optionGroupRows.map(async (group) => {
      const valueRows = await db
        .select()
        .from(productOptionValues)
        .where(eq(productOptionValues.groupId, group.id))
        .orderBy(asc(productOptionValues.sortOrder));
      return {
        id: group.id,
        name: group.label,
        slug: group.label.toLowerCase().replace(/\s+/g, "-"),
        displayType: group.type,
        values: valueRows.map((v) => ({
          id: v.id,
          label: v.label,
          value: v.value,
          color: v.color,
        })),
      };
    })
  );

  const variantRows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      title: productVariants.title,
      priceMinor: productVariants.priceMinor,
      optionSignature: productVariants.optionSignature,
      isDefault: productVariants.isDefault,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const defaultLocation = await db.query.stockLocations.findFirst({ where: eq(stockLocations.isDefault, true) });

  const variantRowsWithStock: EditVariantRow[] = await Promise.all(
    variantRows.map(async (v) => {
      let initialStock = 0;
      if (defaultLocation) {
        const inv = await db.query.inventoryItems.findFirst({
          where: eq(inventoryItems.variantId, v.id),
        });
        if (inv) initialStock = inv.quantityOnHand;
      }
      return {
        id: v.id,
        sku: v.sku,
        title: v.title,
        priceOverride: v.priceMinor,
        optionSignature: v.optionSignature,
        initialStock,
      };
    })
  );

  return {
    ...product,
    images,
    accordions,
    optionGroups,
    variantRows: variantRowsWithStock,
  };
  } catch (error) {
    console.error("❌ EDIT DATA LOADER FETCH FAILED:", error);
    return null;
  }
}