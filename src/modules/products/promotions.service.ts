import { z } from "zod";
import { AppError } from "../../core/http/errors";
import { createAuditLog } from "../audit/audit.service";
import * as repo from "./promotions.repo";

const promotionSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().optional(),
  promoType: z.enum(["payment", "product", "category", "order", "shipping"]),
  discountType: z.enum(["percent", "fixed_amount", "free_shipping", "message_only"]).default("message_only"),
  discountValue: z.number().int().optional(),
  providerKey: z.string().trim().optional(),
  badgeFileId: z.string().uuid().optional(),
  badgeAlt: z.string().trim().optional(),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const listPromotions = () => repo.listPromotions();

export async function getPromotion(id: string) {
  const promo = await repo.getPromotionById(id);
  if (!promo) throw new AppError("NOT_FOUND", "Promotion not found");
  return promo;
}

export async function createPromotion(input: unknown, actorUserId?: string) {
  const parsed = promotionSchema.parse(input);
  if (await repo.getPromotionBySlug(parsed.slug)) throw new AppError("CONFLICT", "Promotion slug already exists");
  const created = await repo.createPromotion({ ...parsed, badgeFileId: parsed.badgeFileId ?? null, badgeAlt: parsed.badgeAlt ?? null });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create promotion");
  await createAuditLog({ actorId: actorUserId, action: "promotion.create", targetType: "promotion", targetId: created.id });
  return created;
}

export async function updatePromotion(id: string, input: unknown, actorUserId?: string) {
  const existing = await repo.getPromotionById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Promotion not found");
  const parsed = promotionSchema.partial().parse(input);
  if (parsed.slug && await repo.getPromotionBySlug(parsed.slug, id)) throw new AppError("CONFLICT", "Promotion slug already exists");
  const updated = await repo.updatePromotion(id, parsed);
  if (!updated) throw new AppError("CONFLICT", "Promotion changed during update");
  await createAuditLog({ actorId: actorUserId, action: "promotion.update", targetType: "promotion", targetId: updated.id });
  return updated;
}

export async function deletePromotion(id: string, actorUserId?: string) {
  const existing = await repo.getPromotionById(id);
  if (!existing) throw new AppError("NOT_FOUND", "Promotion not found");
  await repo.deletePromotion(id);
  await createAuditLog({ actorId: actorUserId, action: "promotion.delete", targetType: "promotion", targetId: id });
}

export const listProductPromotions = (productId: string) => repo.listProductPromotions(productId);

export async function addProductPromotion(productId: string, promotionId: string, sortOrder = 0, actorUserId?: string) {
  const promo = await repo.getPromotionById(promotionId);
  if (!promo) throw new AppError("NOT_FOUND", "Promotion not found");
  await repo.addProductPromotion(productId, promotionId, sortOrder);
  await createAuditLog({ actorId: actorUserId, action: "product_promotion.add", targetType: "product", targetId: productId, metadata: { promotionId } });
}

export async function removeProductPromotion(productId: string, promotionId: string, actorUserId?: string) {
  await repo.removeProductPromotion(productId, promotionId);
  await createAuditLog({ actorId: actorUserId, action: "product_promotion.remove", targetType: "product", targetId: productId, metadata: { promotionId } });
}