import { z } from "zod";

const contentTypeEnum = z.enum(["bullets", "paragraphs", "rich_text", "html", "json"]);

export const createProductSpecificationSchema = z.object({
  name: z.string().trim().min(1),
  value: z.string().trim().min(1),
  groupName: z.string().trim().max(80).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductSpecificationSchema = createProductSpecificationSchema.partial();

export const createProductContentSectionSchema = z.object({
  key: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  contentType: contentTypeEnum,
  contentBody: z.string().trim().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductContentSectionSchema = createProductContentSectionSchema.partial();
