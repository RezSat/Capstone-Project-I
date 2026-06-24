import { AppError } from "../../core/http/errors";
import { createId } from "../../core/utils/ids";
import { API_ERROR_CODES } from "../../lib/constants";
import { findProductById } from "../products/product.repo";
import {
  clearPrimaryImageForProduct,
  findActiveProductFileById,
  insertFileRecord,
  insertProductFile,
  listProductFilesByProductId,
  softDeleteProductFileById,
} from "./product-file.repo";
import { createProductFileSchema, listProductFilesSchema, uploadIntentSchema } from "./product-file.schema";
import type { CreateProductFileInput, UploadIntentInput } from "./product-file.types";
import { toProductFileListing } from "./product-file.mapper";

export function validateUploadIntent(input: unknown) {
  return uploadIntentSchema.parse(input);
}

function sanitizeFileName(originalName: string): string {
  const name = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const hash = createId().slice(0, 8);
  const ext = name.split(".").pop() ?? "";
  const base = name.replace(`.${ext}`, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${hash}.${ext}`;
}

export function createUploadIntent(input: UploadIntentInput) {
  const parsedInput = validateUploadIntent(input);

  const safeName = sanitizeFileName(parsedInput.fileName);
  const folder = parsedInput.kind === "image" ? "images" : "documents";
  const storageKey = `uploads/products/${parsedInput.productId}/${folder}/${safeName}`;

  return {
    storageKey,
    bucket: "local",
  };
}

export function validateCreateProductFile(input: unknown) {
  return createProductFileSchema.parse(input);
}

export function validateListProductFiles(input: unknown) {
  return listProductFilesSchema.parse(input);
}

function generatePublicUrl(storageKey: string): string {
  return `/${storageKey}`;
}

export async function createProductFileMetadata(input: CreateProductFileInput) {
  const parsedInput = validateCreateProductFile(input);

  const product = await findProductById(parsedInput.productId);
  if (!product) throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product not found");

  const publicUrl = parsedInput.access === "public"
    ? (parsedInput.publicUrl ?? generatePublicUrl(parsedInput.storageKey))
    : null;

  const fileRecord = await insertFileRecord({
    kind: parsedInput.kind,
    access: parsedInput.access,
    originalName: parsedInput.originalName,
    mimeType: parsedInput.mimeType,
    sizeBytes: parsedInput.sizeBytes,
    bucket: parsedInput.bucket,
    storageKey: parsedInput.storageKey,
    publicUrl: publicUrl as string | null,
  });

  if (!fileRecord) throw new AppError(API_ERROR_CODES.CONFLICT, "File record could not be created");

  if (parsedInput.isPrimary) {
    await clearPrimaryImageForProduct(parsedInput.productId);
  }

  const productFile = await insertProductFile({
    productId: parsedInput.productId,
    fileId: fileRecord.id,
    role: parsedInput.kind === "image" ? "gallery" : parsedInput.kind,
    isPrimary: parsedInput.isPrimary,
    sortOrder: parsedInput.sortOrder ?? 0,
  });

  if (!productFile) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Product file could not be created");
  }

  return productFile;
}

export function getProductFiles(input: { productId: string; includeDeleted?: boolean }) {
  return listProductFilesByProductId(input.productId);
}

export async function getProductFileListing(productId: string) {
  const rows = await listProductFilesByProductId(productId);
  return toProductFileListing(rows as Array<{
    pm: { id: string; productId: string; fileId: string; role: string; altText: string | null; isPrimary: boolean; sortOrder: number; createdAt: Date };
    f: { id: string; kind: string; access: string; originalName: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; publicUrl: string | null; deletedAt: Date | null; createdAt: Date };
  }>);
}

export { getPrivateFileAccessUrl } from "./product-file.access.service";

export async function deleteProductFileMetadata(fileId: string) {
  const existingFile = await findActiveProductFileById(fileId);

  if (!existingFile) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product file not found");
  }

  const deletedFile = await softDeleteProductFileById(fileId);

  if (!deletedFile) {
    throw new AppError(API_ERROR_CODES.CONFLICT, "Product file changed during delete");
  }

  return deletedFile;
}
