import { z } from "zod";

const displayType = z.enum(["button", "dropdown", "color"]);
const variantStatus = z.enum(["active", "inactive", "archived"]);
const slugField = z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createAttributeSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugField,
  displayType,
  isVariantAttribute: z.boolean().default(true),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});
export const updateAttributeSchema = createAttributeSchema.partial().extend({ isActive: z.boolean().optional() });

export const createAttributeValueSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  colorHex: z.string().trim().regex(/^#?[0-9a-fA-F]{3,8}$/).nullable().optional(),
  imageFileId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export const updateAttributeValueSchema = createAttributeValueSchema.partial();

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1),
  barcode: z.string().trim().min(1).nullable().optional(),
  title: z.string().trim().min(1),
  optionSignature: z.string().trim().min(1),
  priceMinor: z.number().int().min(0),
  compareAtPriceMinor: z.number().int().min(0).nullable().optional(),
  costPriceMinor: z.number().int().min(0).nullable().optional(),
  status: variantStatus.default("active"),
  isDefault: z.boolean().default(false),
  attributeValueIds: z.array(z.string().uuid()).default([]),
  initialStockQuantity: z.number().int().min(0).optional(),
  initialStockNote: z.string().trim().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});
export const updateVariantSchema = createVariantSchema.partial();

export const generateVariantsSchema = z.object({
  attributes: z.array(z.object({ attributeId: z.string().uuid(), valueIds: z.array(z.string().uuid()).min(1) })).min(1),
  basePriceMinor: z.number().int().min(0).optional(),
});
