import { eq } from "drizzle-orm";
import { AppError } from "../../core/http/errors";
import { API_ERROR_CODES } from "../../lib/constants";
import { db } from "../../core/db/client";
import { productMedia, productVariantMedia } from "../../core/db/schema/products";
import { findProductById, getVariantById } from "../products/product.repo";
import {
  clearPrimaryImageForProduct,
  clearPrimaryImageForVariant,
  findActiveProductMediaById,
  findActiveProductFileById,
  findProductFileByProductAndFileId,
  listProductImagesByProductId,
  listProductImagesByVariantId,
  updateProductMediaImage,
  updateProductVariantMediaImage,
} from "./product-file.repo";
import {
  createProductImageSchema,
  listProductImagesSchema,
  updateProductImageSchema,
  createVariantImageSchema,
  updateVariantImageSchema,
  listVariantImagesSchema,
  setVariantPrimaryImageSchema,
} from "./product-image.schema";
import type {
  CreateProductImageInput,
  ProductImageListing,
  ProductImageSummary,
  UpdateProductImageInput,
  VariantImageSummary,
  VariantImageListing,
  CreateVariantImageInput,
} from "./product-image.types";

export function validateCreateProductImage(input: unknown) {
  return createProductImageSchema.parse(input);
}

export function validateListProductImages(input: unknown) {
  return listProductImagesSchema.parse(input);
}

export function validateUpdateProductImage(input: unknown) {
  return updateProductImageSchema.parse(input);
}

function toProductImageSummary(row: {
  pm: { id: string; productId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
  f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
}): ProductImageSummary {
  return {
    id: row.pm.id,
    mediaId: row.pm.id,
    productId: row.pm.productId,
    variantId: null,
    role: row.pm.role,
    altText: row.pm.altText,
    isPrimary: row.pm.isPrimary,
    sortOrder: row.pm.sortOrder,
    fileId: row.f.id,
    kind: row.f.kind,
    access: row.f.access,
    originalName: row.f.originalName,
    mimeType: row.f.mimeType,
    sizeBytes: row.f.sizeBytes,
    width: row.f.width,
    height: row.f.height,
    publicUrl: row.f.publicUrl,
    createdAt: row.f.createdAt,
  };
}

function toProductImageListing(rows: Array<{
  pm: { id: string; productId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
  f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
}>): ProductImageListing {
  const activeRows = rows.filter(
    (r) => r.f.deletedAt === null && (r.pm.role === "gallery" || r.pm.role === "image")
  );
  const images = activeRows.map(toProductImageSummary);
  const primaryImage = images.find((img) => img.isPrimary) ?? null;
  return { images, primaryImage, imageCount: images.length };
}

export async function listProductImages(input: unknown) {
  const parsed = validateListProductImages(input);
  const product = await findProductById(parsed.productId);
  if (!product) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product not found");
  }
  const rows = await listProductImagesByProductId(parsed.productId);
  return toProductImageListing(rows as Array<{
    pm: { id: string; productId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
    f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
  }>);
}

export async function createProductImage(input: CreateProductImageInput) {
  const parsed = validateCreateProductImage(input);
  const product = await findProductById(parsed.productId);
  if (!product) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product not found");
  }
  if (parsed.isPrimary) {
    await clearPrimaryImageForProduct(parsed.productId);
  }
  const [created] = await db.insert(productMedia).values({
    productId: parsed.productId,
    fileId: parsed.fileId,
    role: parsed.role,
    altText: parsed.altText ?? null,
    isPrimary: parsed.isPrimary ?? false,
    sortOrder: parsed.sortOrder ?? 0,
  }).returning();
  return created ?? null;
}

export async function updateProductImage(mediaId: string, input: unknown) {
  const parsed = validateUpdateProductImage(input);
  const media = await findActiveProductMediaById(mediaId);
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product image not found");
  }
  if (parsed.isPrimary) {
    await clearPrimaryImageForProduct(media.productId);
  }
  const updated = await updateProductMediaImage(mediaId, parsed as UpdateProductImageInput);
  if (!updated) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Product image changed during update");
  }
  return updated;
}

export async function setProductPrimaryImage(mediaId: string) {
  const media = await findActiveProductMediaById(mediaId);
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product image not found");
  }
  await clearPrimaryImageForProduct(media.productId);
  const updated = await updateProductMediaImage(mediaId, { isPrimary: true });
  if (!updated) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Could not set primary image");
  }
  return updated;
}

export async function deleteProductImage(mediaId: string) {
  const media = await findActiveProductMediaById(mediaId);
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product image not found");
  }
  const [deleted] = await db.delete(productMedia).where(eq(productMedia.id, mediaId)).returning();
  return deleted ?? null;
}

function toVariantImageSummary(row: {
  pvm: { id: string; variantId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
  f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
}): VariantImageSummary {
  return {
    id: row.pvm.id,
    mediaId: row.pvm.id,
    variantId: row.pvm.variantId,
    role: row.pvm.role,
    altText: row.pvm.altText,
    isPrimary: row.pvm.isPrimary,
    sortOrder: row.pvm.sortOrder,
    fileId: row.f.id,
    kind: row.f.kind,
    access: row.f.access,
    originalName: row.f.originalName,
    mimeType: row.f.mimeType,
    sizeBytes: row.f.sizeBytes,
    width: row.f.width,
    height: row.f.height,
    publicUrl: row.f.publicUrl,
    createdAt: row.f.createdAt,
  };
}

function toVariantImageListing(rows: Array<{
  pvm: { id: string; variantId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
  f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
}>): VariantImageListing {
  const activeRows = rows.filter(
    (r) => r.f.deletedAt === null && (r.pvm.role === "gallery" || r.pvm.role === "image")
  );
  const images = activeRows.map(toVariantImageSummary);
  const primaryImage = images.find((img) => img.isPrimary) ?? null;
  return { images, primaryImage, imageCount: images.length };
}

export function validateListVariantImages(input: unknown) {
  return listVariantImagesSchema.parse(input);
}

export function validateCreateVariantImage(input: unknown) {
  return createVariantImageSchema.parse(input);
}

export function validateUpdateVariantImage(input: unknown) {
  return updateVariantImageSchema.parse(input);
}

export function validateSetVariantPrimaryImage(input: unknown) {
  return setVariantPrimaryImageSchema.parse(input);
}

export async function listVariantImages(input: unknown) {
  const parsed = validateListVariantImages(input);
  const variant = await getVariantById(parsed.variantId);
  if (!variant) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Variant not found");
  }
  const rows = await listProductImagesByVariantId(parsed.variantId);
  return toVariantImageListing(rows as Array<{
    pvm: { id: string; variantId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
    f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
  }>);
}

export async function createVariantImage(input: CreateVariantImageInput) {
  const parsed = validateCreateVariantImage(input);
  console.log("[createVariantImage] Input:", { variantId: parsed.variantId, fileId: parsed.fileId, isPrimary: parsed.isPrimary });
  
  const variant = await getVariantById(parsed.variantId);
  if (!variant) {
    console.error("[createVariantImage] Variant not found:", parsed.variantId);
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Variant not found");
  }
  console.log("[createVariantImage] Found variant:", variant.id, "productId:", variant.productId);
  
  const file = await findActiveProductFileById(parsed.fileId);
  if (!file) {
    console.error("[createVariantImage] File not found in files table. fileId:", parsed.fileId);
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "File not found or has been deleted");
  }
  console.log("[createVariantImage] Found file:", file.id, "originalName:", file.originalName);
  
  const productFile = await findProductFileByProductAndFileId(variant.productId, parsed.fileId);
  console.log("[createVariantImage] Product file lookup:", { productId: variant.productId, fileId: parsed.fileId, found: !!productFile });
  
  if (!productFile) {
    console.error("[createVariantImage] File exists but not linked to product. fileId:", parsed.fileId, "variantProductId:", variant.productId);
    console.error("[createVariantImage] Checking what product_media records exist for this file...");
    const allMediaForFile = await db.select().from(productMedia).where(eq(productMedia.fileId, parsed.fileId));
    console.log("[createVariantImage] All product_media records for this file:", allMediaForFile);
    
    throw new AppError(API_ERROR_CODES.INVALID_INPUT, "File does not belong to this product");
  }
  
  if (parsed.isPrimary) {
    await clearPrimaryImageForVariant(parsed.variantId);
  }
  const [created] = await db.insert(productVariantMedia).values({
    variantId: parsed.variantId,
    fileId: parsed.fileId,
    role: parsed.role ?? "gallery",
    altText: parsed.altText ?? null,
    isPrimary: parsed.isPrimary ?? false,
    sortOrder: parsed.sortOrder ?? 0,
  }).returning();
  console.log("[createVariantImage] Created variant image:", created?.id, "for variant:", parsed.variantId);
  return created ?? null;
}

export async function updateVariantImage(mediaId: string, input: unknown) {
  const parsed = validateUpdateVariantImage(input);
  const media = await db.query.productVariantMedia.findFirst({ where: eq(productVariantMedia.id, mediaId) });
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Variant image not found");
  }
  if (parsed.isPrimary) {
    await clearPrimaryImageForVariant(media.variantId);
  }
  const updated = await updateProductVariantMediaImage(mediaId, parsed as UpdateProductImageInput);
  if (!updated) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Variant image changed during update");
  }
  return updated;
}

export async function setVariantPrimaryImage(mediaId: string, variantId: string) {
  const media = await db.query.productVariantMedia.findFirst({ where: eq(productVariantMedia.id, mediaId) });
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Variant image not found");
  }
  if (media.variantId !== variantId) {
    throw new AppError(API_ERROR_CODES.INVALID_INPUT, "Media does not belong to this variant");
  }
  await clearPrimaryImageForVariant(variantId);
  const updated = await updateProductVariantMediaImage(mediaId, { isPrimary: true });
  if (!updated) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Could not set primary image");
  }
  return updated;
}

export async function deleteVariantImage(mediaId: string) {
  const media = await db.query.productVariantMedia.findFirst({ where: eq(productVariantMedia.id, mediaId) });
  if (!media) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Variant image not found");
  }
  const [deleted] = await db.delete(productVariantMedia).where(eq(productVariantMedia.id, mediaId)).returning();
  return deleted ?? null;
}
