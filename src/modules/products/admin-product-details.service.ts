import { AppError } from "../../core/http/errors";
import { createAuditLog } from "../audit/audit.service";
import { createProductContentSectionSchema, createProductSpecificationSchema, updateProductContentSectionSchema, updateProductSpecificationSchema } from "./admin-product-details.schema";
import { createContentSection, createSpecification, deleteContentSection, deleteSpecification, getContentSectionById, getContentSectionByKey, getProductById, getSpecificationById, listContentSectionsByProduct, listSpecificationsByProduct, updateContentSection, updateSpecification } from "./admin-product-details.repo";

async function requireProduct(productId: string) {
  const product = await getProductById(productId);
  if (!product) throw new AppError("NOT_FOUND", "Product not found");
  return product;
}

const normalize = (value: string) => value.trim().toLowerCase();

export async function listProductSpecifications(productId: string) {
  await requireProduct(productId);
  return listSpecificationsByProduct(productId);
}

export async function createProductSpecification(productId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  const parsed = createProductSpecificationSchema.parse(input);
  const created = await createSpecification({ ...parsed, productId, groupName: parsed.groupName ?? null, valueNormalized: normalize(parsed.value) });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create specification");
  await createAuditLog({ actorId: actorUserId, action: "product.specification.create", targetType: "product_specification", targetId: created.id });
  return created;
}

export async function updateProductSpecification(productId: string, specificationId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  if (!(await getSpecificationById(productId, specificationId))) throw new AppError("NOT_FOUND", "Specification not found");
  const parsed = updateProductSpecificationSchema.parse(input);
  const updated = await updateSpecification(specificationId, { ...parsed, valueNormalized: parsed.value ? normalize(parsed.value) : undefined });
  if (!updated) throw new AppError("CONFLICT", "Specification changed during update");
  await createAuditLog({ actorId: actorUserId, action: "product.specification.update", targetType: "product_specification", targetId: updated.id });
  return updated;
}

export async function removeProductSpecification(productId: string, specificationId: string, actorUserId?: string) {
  await requireProduct(productId);
  if (!(await getSpecificationById(productId, specificationId))) throw new AppError("NOT_FOUND", "Specification not found");
  const removed = await deleteSpecification(specificationId);
  if (!removed) throw new AppError("CONFLICT", "Specification changed during deletion");
  await createAuditLog({ actorId: actorUserId, action: "product.specification.delete", targetType: "product_specification", targetId: removed.id });
  return removed;
}

export async function listProductContentSections(productId: string) {
  await requireProduct(productId);
  return listContentSectionsByProduct(productId);
}

export async function createProductContentSection(productId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  const parsed = createProductContentSectionSchema.parse(input);
  if (await getContentSectionByKey(productId, parsed.key)) throw new AppError("CONFLICT", "Content section key already exists");
  const created = await createContentSection({ ...parsed, productId, contentJson: { body: parsed.contentBody }, defaultOpen: false });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create content section");
  await createAuditLog({ actorId: actorUserId, action: "product.content_section.create", targetType: "product_content_section", targetId: created.id });
  return created;
}

export async function updateProductContentSection(productId: string, sectionId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  if (!(await getContentSectionById(productId, sectionId))) throw new AppError("NOT_FOUND", "Content section not found");
  const parsed = updateProductContentSectionSchema.parse(input);
  if (parsed.key && (await getContentSectionByKey(productId, parsed.key, sectionId))) throw new AppError("CONFLICT", "Content section key already exists");
  const updated = await updateContentSection(sectionId, { ...parsed, contentJson: parsed.contentBody ? { body: parsed.contentBody } : undefined });
  if (!updated) throw new AppError("CONFLICT", "Content section changed during update");
  await createAuditLog({ actorId: actorUserId, action: "product.content_section.update", targetType: "product_content_section", targetId: updated.id });
  return updated;
}

export async function removeProductContentSection(productId: string, sectionId: string, actorUserId?: string) {
  await requireProduct(productId);
  if (!(await getContentSectionById(productId, sectionId))) throw new AppError("NOT_FOUND", "Content section not found");
  const removed = await deleteContentSection(sectionId);
  if (!removed) throw new AppError("CONFLICT", "Content section changed during deletion");
  await createAuditLog({ actorId: actorUserId, action: "product.content_section.delete", targetType: "product_content_section", targetId: removed.id });
  return removed;
}
