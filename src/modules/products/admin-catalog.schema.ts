import { z } from "zod";

const statusEnum = z.enum(["draft", "active", "inactive", "archived"]);
const slugField = z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const imageEntrySchema = z.object({
  src: z.string(),
  alt: z.string().nullable().optional(),
  orientation: z.enum(["portrait", "landscape", "square"]).optional(),
});

const accordionEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  contentType: z.enum(["bullets", "paragraphs"]),
  bullets: z.array(z.string()).optional(),
  paragraphs: z.array(z.string()).optional(),
});

const optionGroupEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  slug: z.string(),
  displayType: z.enum(["button", "color", "dropdown", "text", "swatch"]),
  isVariantAttribute: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  values: z.array(z.object({
    id: z.string().optional(),
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
    color: z.string().optional(),
    available: z.boolean().optional(),
  })).optional(),
});

const variantRowSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1),
  title: z.string().trim().min(1),
  priceOverride: z.number().int().min(0).optional(),
  optionSignature: z.string(),
  initialStock: z.number().int().min(0).optional(),
});

export const adminProductCreateSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugField,
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  basePriceMinor: z.number().int().min(0).max(2000000000),
  compareAtPriceMinor: z.number().int().min(0).max(2000000000).nullable().optional(),
  status: statusEnum,
  seoTitle: z.string().trim().max(120).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  isFeatured: z.boolean().default(false),
  promoLabel: z.enum(["none", "new_arrival", "best_seller"]).default("none"),
  images: z.array(imageEntrySchema).optional(),
  accordions: z.array(accordionEntrySchema).optional(),
  accordionsBullets: z.record(z.string(), z.array(z.string())).optional(),
  accordionsParagraphs: z.record(z.string(), z.array(z.string())).optional(),
  optionGroups: z.array(optionGroupEntrySchema).optional(),
  variantRows: z.array(variantRowSchema).optional(),
});

export const adminProductUpdateSchema = adminProductCreateSchema.partial();

export const adminCategoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  groupSlug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  slug: slugField,
  parentId: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  heroImage: z.string().nullable().optional(),
  fallbackHeroImage: z.string().nullable().optional(),
  seoTitle: z.string().trim().max(120).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
  status: z.enum(["active", "inactive", "hidden"]).default("active"),
  sortOrder: z.number().int().default(0),
});

export const adminCategoryUpdateSchema = adminCategoryCreateSchema.partial();

export const adminCategoryFilterCreateSchema = z.object({
  label: z.string().trim().min(1),
  slug: slugField,
  sourceType: z.string().trim().default("attribute"),
  sourceKey: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const adminCategoryFilterUpdateSchema = adminCategoryFilterCreateSchema.partial();

export const adminCategoryFilterOptionCreateSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const adminCategoryFilterOptionUpdateSchema = adminCategoryFilterOptionCreateSchema.partial();

export const adminBrandCreateSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugField,
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const adminBrandUpdateSchema = adminBrandCreateSchema.partial();