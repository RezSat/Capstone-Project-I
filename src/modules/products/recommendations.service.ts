import { AppError } from "../../core/http/errors";
import { createAuditLog } from "../audit/audit.service";
import * as repo from "./recommendations.repo";
import { findProductById } from "./product.repo";

export const listProductRecommendations = (productId: string) => repo.listProductRecommendations(productId);

export async function addProductRecommendation(productId: string, recommendedProductId: string, actorUserId?: string, source: "manual" | "same_category" | "same_brand" | "answers" | "history" | "bestseller" = "manual") {
  const product = await findProductById(productId);
  if (!product) throw new AppError("NOT_FOUND", "Product not found");
  const recommended = await findProductById(recommendedProductId);
  if (!recommended) throw new AppError("NOT_FOUND", "Recommended product not found");
  const existing = await repo.addProductRecommendation(productId, recommendedProductId, source);
  if (!existing) throw new AppError("INTERNAL_ERROR", "Failed to add recommendation");
  await createAuditLog({ actorId: actorUserId, action: "product_recommendation.add", targetType: "product", targetId: productId, metadata: { recommendedProductId } });
  return existing;
}

export async function updateProductRecommendation(id: string, sortOrder: number, isActive?: boolean) {
  const updated = await repo.updateProductRecommendation(id, sortOrder, isActive);
  if (!updated) throw new AppError("NOT_FOUND", "Recommendation not found");
  return updated;
}

export async function removeProductRecommendation(id: string, actorUserId?: string) {
  const deleted = await repo.removeProductRecommendation(id);
  if (!deleted) throw new AppError("NOT_FOUND", "Recommendation not found");
  await createAuditLog({ actorId: actorUserId, action: "product_recommendation.remove", targetType: "product", targetId: deleted.productId });
}