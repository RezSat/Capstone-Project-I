import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "./product-file.validation";

const PRODUCT_FILE_KINDS = ["image", "document", "video", "other"] as const;
const PRODUCT_FILE_ACCESS_MODES = ["public", "private"] as const;

function validateMimeTypeForKind(kind: string, mimeType: string): boolean {
  if (kind === "image") return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_MIME_TYPES[number]);
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as typeof ALLOWED_DOCUMENT_MIME_TYPES[number]);
}

function getMaxSizeForKind(kind: string): number {
  return kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
}

export const createProductFileSchema = z
  .object({
    productId: z.string().trim().min(1),
    kind: z.enum(PRODUCT_FILE_KINDS),
    access: z.enum(PRODUCT_FILE_ACCESS_MODES).default("private"),
    originalName: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    sizeBytes: z.number().int().positive(),
    bucket: z.string().trim().min(1),
    storageKey: z.string().trim().min(1),
    publicUrl: z.url().optional(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })
  .superRefine((data, context) => {
    if (data.access === "public" && data.kind !== "image") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only image files can use public access",
        path: ["access"],
      });
    }

    if (data.isPrimary && data.kind !== "image") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only image files can be primary",
        path: ["isPrimary"],
      });
    }

    if (!validateMimeTypeForKind(data.kind, data.mimeType)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid MIME type for ${data.kind}`,
        path: ["mimeType"],
      });
    }

    if (data.sizeBytes > getMaxSizeForKind(data.kind)) {
      const maxMB = Math.round(getMaxSizeForKind(data.kind) / (1024 * 1024));
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File size exceeds maximum (${maxMB}MB)`,
        path: ["sizeBytes"],
      });
    }
  });

export const listProductFilesSchema = z.object({
  productId: z.string().trim().min(1),
  includeDeleted: z.boolean().default(false),
});

export const uploadIntentSchema = z
  .object({
    productId: z.string().trim().min(1),
    kind: z.enum(PRODUCT_FILE_KINDS),
    fileName: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    sizeBytes: z.number().int().positive(),
  })
  .superRefine((data, context) => {
    if (!validateMimeTypeForKind(data.kind, data.mimeType)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid MIME type for ${data.kind}`,
        path: ["mimeType"],
      });
    }

    if (data.sizeBytes > getMaxSizeForKind(data.kind)) {
      const maxMB = Math.round(getMaxSizeForKind(data.kind) / (1024 * 1024));
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File size exceeds maximum (${maxMB}MB)`,
        path: ["sizeBytes"],
      });
    }
  });

export type UploadIntentSchema = z.infer<typeof uploadIntentSchema>;
export type CreateProductFileSchema = z.infer<typeof createProductFileSchema>;
export type ListProductFilesSchema = z.infer<typeof listProductFilesSchema>;