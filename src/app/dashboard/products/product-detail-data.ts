import { db } from "@/core/db/client";
import { products, productVariants, inventoryItems, productAttributes, productAttributeValues, categories, brands, auditLogs, files, productVariantMedia, productMedia, productContentSections, productPromotions, promotions, productRecommendations } from "@/core/db/schema";
import { eq, sql, asc } from "drizzle-orm";

export type ProductDetailImage = {
  id: string;
  fileId: string;
  role: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  publicUrl: string | null;
};

export type ProductDetailVariantImage = {
  id: string;
  fileId: string;
  role: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  publicUrl: string | null;
};

export type ProductDetailVariant = {
  id: string;
  sku: string;
  title: string;
  priceMinor: number;
  compareAtPriceMinor: number | null;
  status: string;
  optionSignature: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  images: ProductDetailVariantImage[];
};

export type ProductDetailAttribute = {
  id: string;
  name: string;
  slug: string;
  displayType: string;
  values: { id: string; value: string; colorHex: string | null }[];
};

export type ProductDetailContentSection = {
  id: string;
  title: string;
  contentType: string;
  contentJson: Record<string, unknown>;
  defaultOpen: boolean;
  sortOrder: number;
};

export type ProductDetailPromotion = {
  id: string;
  title: string;
  promoType: string;
  isActive: boolean;
};

export type ProductDetailRecommendation = {
  id: string;
  recommendedProductId: string;
  recommendedProductName: string;
  recommendedProductSlug: string;
};

export type ProductDetailItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  productType: string | null;
  shortDescription: string | null;
  description: string | null;
  basePriceMinor: number;
  compareAtPriceMinor: number | null;
  currencyCode: string;
  isFeatured: boolean;
  allowBackorder: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDetailData = {
  product: ProductDetailItem;
  images: ProductDetailImage[];
  variants: ProductDetailVariant[];
  attributes: ProductDetailAttribute[];
  contentSections: ProductDetailContentSection[];
  promotions: ProductDetailPromotion[];
  recommendations: ProductDetailRecommendation[];
  recentAudit: { id: string; action: string; targetType: string; createdAt: Date }[];
  status: "ready" | "error";
};

export async function getProductDetailData(productId: string): Promise<ProductDetailData> {
  try {
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        productType: products.productType,
        shortDescription: products.shortDescription,
        description: products.description,
        basePriceMinor: products.basePriceMinor,
        compareAtPriceMinor: products.compareAtPriceMinor,
        currencyCode: products.currencyCode,
        isFeatured: products.isFeatured,
        allowBackorder: products.allowBackorder,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        publishedAt: products.publishedAt,
        categoryId: products.primaryCategoryId,
        categoryName: categories.name,
        brandId: products.brandId,
        brandName: brands.name,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.primaryCategoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (!product[0]) {
      return {
        product: {} as ProductDetailItem,
        images: [],
        variants: [],
        attributes: [],
        contentSections: [],
        promotions: [],
        recommendations: [],
        recentAudit: [],
        status: "error",
      };
    }

    const productData = product[0] as ProductDetailItem;

    const variantRows = await db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        title: productVariants.title,
        priceMinor: productVariants.priceMinor,
        compareAtPriceMinor: productVariants.compareAtPriceMinor,
        status: productVariants.status,
        optionSignature: productVariants.optionSignature,
        quantityOnHand: inventoryItems.quantityOnHand,
        lowStockThreshold: inventoryItems.lowStockThreshold,
      })
      .from(productVariants)
      .leftJoin(inventoryItems, eq(productVariants.id, inventoryItems.variantId))
      .where(eq(productVariants.productId, productId));

    const variants: ProductDetailVariant[] = variantRows.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      priceMinor: v.priceMinor,
      compareAtPriceMinor: v.compareAtPriceMinor,
      status: v.status,
      optionSignature: v.optionSignature,
      quantityOnHand: v.quantityOnHand ?? 0,
      lowStockThreshold: v.lowStockThreshold ?? 0,
      images: [],
    }));

    const variantImageRows = await db
      .select({
        variantId: productVariantMedia.variantId,
        id: productVariantMedia.id,
        fileId: productVariantMedia.fileId,
        role: productVariantMedia.role,
        altText: productVariantMedia.altText,
        isPrimary: productVariantMedia.isPrimary,
        sortOrder: productVariantMedia.sortOrder,
        publicUrl: files.publicUrl,
      })
      .from(productVariantMedia)
      .innerJoin(files, eq(productVariantMedia.fileId, files.id))
      .where(sql`${productVariantMedia.variantId} IN (${sql.join(variantRows.map((v) => sql`${v.id}`), sql`, `)})`)
      .orderBy(asc(productVariantMedia.sortOrder));

    const variantImagesMap = new Map<string, ProductDetailVariantImage[]>();
    for (const row of variantImageRows) {
      const image: ProductDetailVariantImage = {
        id: row.id,
        fileId: row.fileId,
        role: row.role,
        altText: row.altText,
        isPrimary: row.isPrimary,
        sortOrder: row.sortOrder,
        publicUrl: row.publicUrl,
      };
      const existing = variantImagesMap.get(row.variantId) ?? [];
      existing.push(image);
      variantImagesMap.set(row.variantId, existing);
    }

    for (const variant of variants) {
      variant.images = variantImagesMap.get(variant.id) ?? [];
    }

    const attrRows = await db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, productId));

    const attributes: ProductDetailAttribute[] = await Promise.all(
      attrRows.map(async (attr) => {
        const values = await db
          .select()
          .from(productAttributeValues)
          .where(eq(productAttributeValues.attributeId, attr.id));
        return {
          id: attr.id,
          name: attr.name,
          slug: attr.slug,
          displayType: attr.displayType,
          values: values.map((v) => ({
            id: v.id,
            value: v.value,
            colorHex: v.colorHex,
          })),
        };
      })
    );

    const auditRows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetType: auditLogs.targetType,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(sql`${auditLogs.targetId} = ${productId} OR ${auditLogs.metadata}->>'productId' = ${productId}`)
      .orderBy(sql`${auditLogs.createdAt} desc`)
      .limit(10);

    const recentAudit = auditRows.map((a) => ({
      id: a.id,
      action: a.action,
      targetType: a.targetType,
      createdAt: a.createdAt,
    }));

    const imageRows = await db
      .select({
        id: productMedia.id,
        fileId: productMedia.fileId,
        role: productMedia.role,
        altText: productMedia.altText,
        isPrimary: productMedia.isPrimary,
        sortOrder: productMedia.sortOrder,
        publicUrl: files.publicUrl,
      })
      .from(productMedia)
      .innerJoin(files, eq(productMedia.fileId, files.id))
      .where(eq(productMedia.productId, productId))
      .orderBy(asc(productMedia.sortOrder));

    const images: ProductDetailImage[] = imageRows.map((row) => ({
      id: row.id,
      fileId: row.fileId,
      role: row.role,
      altText: row.altText,
      isPrimary: row.isPrimary,
      sortOrder: row.sortOrder,
      publicUrl: row.publicUrl,
    }));

    const contentRows = await db
      .select()
      .from(productContentSections)
      .where(eq(productContentSections.productId, productId))
      .orderBy(asc(productContentSections.sortOrder));

    const contentSections: ProductDetailContentSection[] = contentRows.map((row) => {
      const body = (row.contentJson as Record<string, unknown>)?.body as string | undefined;
      const lines = body ? body.split('\n').filter(line => line.trim()) : [];
      
      return {
        id: row.id,
        title: row.title,
        contentType: row.contentType,
        contentJson: row.contentType === 'bullets' 
          ? { bullets: lines, defaultOpen: row.defaultOpen }
          : { paragraphs: lines, defaultOpen: row.defaultOpen },
        defaultOpen: row.defaultOpen,
        sortOrder: row.sortOrder,
      };
    });

    const promoRows = await db
      .select({
        id: promotions.id,
        title: promotions.title,
        promoType: promotions.promoType,
        isActive: promotions.isActive,
      })
      .from(productPromotions)
      .innerJoin(promotions, eq(productPromotions.promotionId, promotions.id))
      .where(eq(productPromotions.productId, productId));

    const promotions_list: ProductDetailPromotion[] = promoRows.map((row) => ({
      id: row.id,
      title: row.title,
      promoType: row.promoType,
      isActive: row.isActive,
    }));

    const recRows = await db
      .select({
        id: productRecommendations.id,
        recommendedProductId: productRecommendations.recommendedProductId,
        recommendedProductName: products.name,
        recommendedProductSlug: products.slug,
      })
      .from(productRecommendations)
      .innerJoin(products, eq(productRecommendations.recommendedProductId, products.id))
      .where(eq(productRecommendations.productId, productId));

    const recommendations: ProductDetailRecommendation[] = recRows.map((row) => ({
      id: row.id,
      recommendedProductId: row.recommendedProductId,
      recommendedProductName: row.recommendedProductName,
      recommendedProductSlug: row.recommendedProductSlug,
    }));

    return {
      product: productData,
      images,
      variants,
      attributes,
      contentSections,
      promotions: promotions_list,
      recommendations,
      recentAudit,
      status: "ready",
    };
  } catch {
    return {
      product: {} as ProductDetailItem,
      images: [],
      variants: [],
      attributes: [],
      contentSections: [],
      promotions: [],
      recommendations: [],
      recentAudit: [],
      status: "error",
    };
  }
}