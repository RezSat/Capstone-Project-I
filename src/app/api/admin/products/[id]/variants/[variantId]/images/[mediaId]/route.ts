import { ok } from "@/core/http/responses";
import { adminProductsErrorResponse } from "@/app/api/admin/products/error-response";
import { requireAdminProductsManage } from "@/app/api/admin/authz";
import { updateVariantImage, deleteVariantImage } from "@/modules/product-files/product-image.service";
import { getVariantById } from "@/modules/products/admin-variants.repo";
import { AppError } from "@/core/http/errors";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; variantId: string; mediaId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const { id: productId, variantId, mediaId } = await context.params;
    const variant = await getVariantById(productId, variantId);
    if (!variant) {
      throw new AppError("NOT_FOUND", "Variant not found");
    }
    const body = await request.json();
    const updated = await updateVariantImage(mediaId, body);
    return Response.json(ok(updated));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string; variantId: string; mediaId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const { id: productId, variantId, mediaId } = await context.params;
    const variant = await getVariantById(productId, variantId);
    if (!variant) {
      throw new AppError("NOT_FOUND", "Variant not found");
    }
    await deleteVariantImage(mediaId);
    return Response.json(ok({ success: true }));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}