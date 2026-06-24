import { and, asc, eq, isNull, or } from "drizzle-orm";
import { db } from "../../core/db/client";
import { files } from "../../core/db/schema";
import { productMedia, productVariantMedia } from "../../core/db/schema/products";

export type InsertProductFileInput = {
  productId: string;
  fileId: string;
  role: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type CreateFileInput = {
  kind: string;
  access: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  storageKey: string;
  publicUrl: string | null;
};

export async function insertFileRecord(input: CreateFileInput) {
  const [file] = await db.insert(files).values({
    kind: input.kind as "image" | "document" | "video" | "other",
    access: input.access as "public" | "private",
    originalName: input.originalName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    bucket: input.bucket,
    storageKey: input.storageKey,
    publicUrl: input.publicUrl,
  }).returning();
  return file ?? null;
}

export async function insertProductFile(input: InsertProductFileInput) {
  const [productFile] = await db.insert(productMedia).values({
    productId: input.productId,
    fileId: input.fileId,
    role: input.role,
    altText: input.altText ?? null,
    isPrimary: input.isPrimary ?? false,
    sortOrder: input.sortOrder ?? 0,
  }).returning();
  return productFile ?? null;
}

export function listProductImagesByProductId(productId: string) {
  return db
    .select({ pm: productMedia, f: files })
    .from(productMedia)
    .innerJoin(files, eq(files.id, productMedia.fileId))
    .where(eq(productMedia.productId, productId))
    .orderBy(asc(productMedia.sortOrder), asc(files.createdAt));
}

export { listProductImagesByProductId as listProductFilesByProductId };

export function listProductImagesByVariantId(variantId: string) {
  return db
    .select({ pvm: productVariantMedia, f: files })
    .from(productVariantMedia)
    .innerJoin(files, eq(files.id, productVariantMedia.fileId))
    .where(eq(productVariantMedia.variantId, variantId))
    .orderBy(asc(productVariantMedia.sortOrder), asc(files.createdAt));
}

export type UpdateImageInput = {
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

export async function updateProductMediaImage(mediaId: string, input: UpdateImageInput) {
  const [updated] = await db
    .update(productMedia)
    .set(input)
    .where(eq(productMedia.id, mediaId))
    .returning();
  return updated ?? null;
}

export async function updateProductVariantMediaImage(mediaId: string, input: UpdateImageInput) {
  const [updated] = await db
    .update(productVariantMedia)
    .set(input)
    .where(eq(productVariantMedia.id, mediaId))
    .returning();
  return updated ?? null;
}

export async function clearPrimaryImageForProduct(productId: string) {
  return db
    .update(productMedia)
    .set({ isPrimary: false })
    .where(
      and(
        eq(productMedia.productId, productId),
        eq(productMedia.isPrimary, true)
      )
    );
}

export async function clearPrimaryImageForVariant(variantId: string) {
  return db
    .update(productVariantMedia)
    .set({ isPrimary: false })
    .where(
      and(
        eq(productVariantMedia.variantId, variantId),
        eq(productVariantMedia.isPrimary, true)
      )
    );
}

export function findActiveProductMediaById(mediaId: string) {
  return db.query.productMedia.findFirst({
    where: eq(productMedia.id, mediaId),
  });
}

export function findActiveProductFileById(fileId: string) {
  return db.query.files.findFirst({
    where: and(eq(files.id, fileId), isNull(files.deletedAt)),
  });
}

export async function softDeleteProductFileById(fileId: string) {
  const [productFile] = await db
    .update(files)
    .set({ deletedAt: new Date() })
    .where(and(eq(files.id, fileId), isNull(files.deletedAt)))
    .returning();
  return productFile ?? null;
}

export type ProductImageSummaryRow = {
  id: string;
  publicUrl: string | null;
  isPrimary: boolean;
  imageCount: number;
};

export async function getProductImageSummaryForList(productId: string): Promise<ProductImageSummaryRow | null> {
  const images = await db
    .select()
    .from(files)
    .innerJoin(productMedia, eq(files.id, productMedia.fileId))
    .where(
      and(
        eq(productMedia.productId, productId),
        or(eq(productMedia.role, "gallery"), eq(productMedia.role, "image")),
        isNull(files.deletedAt)
      )
    );

  if (images.length === 0) {
    return { id: "", publicUrl: null, isPrimary: false, imageCount: 0 };
  }

  const primaryImage = images.find((img) => img.product_media.isPrimary) ?? images[0];
  return {
    id: primaryImage.files.id,
    publicUrl: primaryImage.files.publicUrl,
    isPrimary: primaryImage.product_media.isPrimary,
    imageCount: images.length,
  };
}

export async function findProductFileByProductAndFileId(productId: string, fileId: string) {
  return db.query.productMedia.findFirst({
    where: and(eq(productMedia.productId, productId), eq(productMedia.fileId, fileId)),
  });
}