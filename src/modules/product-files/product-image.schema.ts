import { z } from "zod";

const PRODUCT_IMAGE_ROLES = ["gallery", "thumbnail", "hover", "banner", "other"] as const;

export const createProductImageSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
  fileId: z.string().trim().min(1),
  role: z.enum(PRODUCT_IMAGE_ROLES).default("gallery"),
  altText: z.string().trim().max(500).optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductImageSchema = z.object({
  altText: z.string().trim().max(500).nullable().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const listProductImagesSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).optional(),
});

export const setPrimaryImageSchema = z.object({
  mediaId: z.string().trim().min(1),
  productId: z.string().trim().min(1).optional(),
  variantId: z.string().trim().min(1).optional(),
});

export const createVariantImageSchema = z.object({
  variantId: z.string().trim().min(1),
  fileId: z.string().trim().min(1),
  role: z.enum(PRODUCT_IMAGE_ROLES).default("gallery"),
  altText: z.string().trim().max(500).optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateVariantImageSchema = z.object({
  altText: z.string().trim().max(500).nullable().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const listVariantImagesSchema = z.object({
  variantId: z.string().trim().min(1),
});

export const setVariantPrimaryImageSchema = z.object({
  mediaId: z.string().trim().min(1),
  variantId: z.string().trim().min(1),
});

export type CreateVariantImageSchema = z.infer<typeof createVariantImageSchema>;
export type UpdateVariantImageSchema = z.infer<typeof updateVariantImageSchema>;
export type ListVariantImagesSchema = z.infer<typeof listVariantImagesSchema>;
export type SetVariantPrimaryImageSchema = z.infer<typeof setVariantPrimaryImageSchema>;
export type CreateProductImageSchema = z.infer<typeof createProductImageSchema>;
export type UpdateProductImageSchema = z.infer<typeof updateProductImageSchema>;
export type ListProductImagesSchema = z.infer<typeof listProductImagesSchema>;
export type SetPrimaryImageSchema = z.infer<typeof setPrimaryImageSchema>;