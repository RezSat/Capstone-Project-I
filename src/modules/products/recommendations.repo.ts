import { asc, eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { products, productRecommendations } from "../../core/db/schema";

type RecommendationSource = "manual" | "same_category" | "same_brand" | "answers" | "history" | "bestseller";

export const listProductRecommendations = (productId: string) =>
  db.select({
    id: productRecommendations.id,
    recommendedProductId: productRecommendations.recommendedProductId,
    recommendedProductName: products.name,
    recommendedProductSlug: products.slug,
    source: productRecommendations.source,
    score: productRecommendations.score,
    sortOrder: productRecommendations.sortOrder,
    isActive: productRecommendations.isActive,
  })
  .from(productRecommendations)
  .innerJoin(products, eq(productRecommendations.recommendedProductId, products.id))
  .where(eq(productRecommendations.productId, productId))
  .orderBy(asc(productRecommendations.sortOrder));

export async function addProductRecommendation(productId: string, recommendedProductId: string, source: RecommendationSource = "manual", score = 0, sortOrder = 0) {
  const [created] = await db.insert(productRecommendations).values({
    productId,
    recommendedProductId,
    source,
    score,
    sortOrder,
    isActive: true,
  }).returning();
  return created ?? null;
}

export async function updateProductRecommendation(id: string, sortOrder: number, isActive?: boolean) {
  const updateData: Record<string, unknown> = { sortOrder };
  if (isActive !== undefined) updateData.isActive = isActive;
  const [updated] = await db.update(productRecommendations).set(updateData).where(eq(productRecommendations.id, id)).returning();
  return updated ?? null;
}

export async function removeProductRecommendation(id: string) {
  const [deleted] = await db.delete(productRecommendations).where(eq(productRecommendations.id, id)).returning();
  return deleted ?? null;
}