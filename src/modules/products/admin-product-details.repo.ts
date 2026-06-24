import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../../core/db/client";
import { productContentSections, productSpecifications, products } from "../../core/db/schema";

export const getProductById = (productId: string) => db.query.products.findFirst({ where: eq(products.id, productId) });
export const listSpecificationsByProduct = (productId: string) => db.select().from(productSpecifications).where(eq(productSpecifications.productId, productId)).orderBy(asc(productSpecifications.sortOrder), asc(productSpecifications.name));
export const getSpecificationById = (productId: string, specificationId: string) => db.query.productSpecifications.findFirst({ where: and(eq(productSpecifications.productId, productId), eq(productSpecifications.id, specificationId)) });
export async function createSpecification(values: typeof productSpecifications.$inferInsert) {
  const [created] = await db.insert(productSpecifications).values(values).returning();
  return created ?? null;
}
export async function updateSpecification(specificationId: string, values: Partial<typeof productSpecifications.$inferInsert>) {
  const [updated] = await db.update(productSpecifications).set(values).where(eq(productSpecifications.id, specificationId)).returning();
  return updated ?? null;
}
export async function deleteSpecification(specificationId: string) {
  const [deleted] = await db.delete(productSpecifications).where(eq(productSpecifications.id, specificationId)).returning();
  return deleted ?? null;
}

export const listContentSectionsByProduct = (productId: string) => db.select().from(productContentSections).where(eq(productContentSections.productId, productId)).orderBy(asc(productContentSections.sortOrder), asc(productContentSections.title));
export const getContentSectionById = (productId: string, sectionId: string) => db.query.productContentSections.findFirst({ where: and(eq(productContentSections.productId, productId), eq(productContentSections.id, sectionId)) });
export const getContentSectionByKey = (productId: string, key: string, excludeId?: string) => db.query.productContentSections.findFirst({ where: and(eq(productContentSections.productId, productId), eq(productContentSections.key, key), excludeId ? ne(productContentSections.id, excludeId) : undefined) });
export async function createContentSection(values: typeof productContentSections.$inferInsert) {
  const [created] = await db.insert(productContentSections).values(values).returning();
  return created ?? null;
}
export async function updateContentSection(sectionId: string, values: Partial<typeof productContentSections.$inferInsert>) {
  const [updated] = await db.update(productContentSections).set({ ...values, updatedAt: new Date() }).where(eq(productContentSections.id, sectionId)).returning();
  return updated ?? null;
}
export async function deleteContentSection(sectionId: string) {
  const [deleted] = await db.delete(productContentSections).where(eq(productContentSections.id, sectionId)).returning();
  return deleted ?? null;
}
