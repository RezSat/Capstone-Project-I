import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../../core/db/client";
import { promotions, productPromotions } from "../../core/db/schema";

export const listPromotions = () => 
  db.select().from(promotions).orderBy(asc(promotions.createdAt));

export const getPromotionById = (id: string) =>
  db.query.promotions.findFirst({ where: eq(promotions.id, id) });

export const getPromotionBySlug = (slug: string, excludeId?: string) =>
  db.query.promotions.findFirst({ 
    where: excludeId ? and(eq(promotions.slug, slug), ne(promotions.id, excludeId)) : eq(promotions.slug, slug) 
  });

export async function createPromotion(values: typeof promotions.$inferInsert) {
  const [created] = await db.insert(promotions).values(values).returning();
  return created ?? null;
}

export async function updatePromotion(id: string, values: Partial<typeof promotions.$inferInsert>) {
  const [updated] = await db.update(promotions).set({ ...values, updatedAt: new Date() }).where(eq(promotions.id, id)).returning();
  return updated ?? null;
}

export async function deletePromotion(id: string) {
  const [deleted] = await db.delete(promotions).where(eq(promotions.id, id)).returning();
  return deleted ?? null;
}

export const listProductPromotions = (productId: string) =>
  db.select({ p: promotions, sortOrder: productPromotions.sortOrder })
    .from(productPromotions)
    .innerJoin(promotions, eq(productPromotions.promotionId, promotions.id))
    .where(eq(productPromotions.productId, productId))
    .orderBy(asc(productPromotions.sortOrder));

export async function addProductPromotion(productId: string, promotionId: string, sortOrder = 0) {
  const [created] = await db.insert(productPromotions).values({ productId, promotionId, sortOrder }).returning();
  return created ?? null;
}

export async function removeProductPromotion(productId: string, promotionId: string) {
  await db.delete(productPromotions).where(
    and(eq(productPromotions.productId, productId), eq(productPromotions.promotionId, promotionId))
  );
}

export async function updateProductPromotionSort(productId: string, promotionId: string, sortOrder: number) {
  await db.update(productPromotions).set({ sortOrder }).where(
    and(eq(productPromotions.productId, productId), eq(productPromotions.promotionId, promotionId))
  );
}