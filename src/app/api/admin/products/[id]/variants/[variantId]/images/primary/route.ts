import { ok } from "@/core/http/responses";
import { adminProductsErrorResponse } from "@/app/api/admin/products/error-response";
import { requireAdminProductsManage } from "@/app/api/admin/authz";
import { setVariantPrimaryImage } from "@/modules/product-files/product-image.service";
import { getVariantById } from "@/modules/products/admin-variants.repo";
import { AppError } from "@/core/http/errors";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const { id: productId, variantId } = await context.params;
    const variant = await getVariantById(productId, variantId);
    if (!variant) {
      throw new AppError("NOT_FOUND", "Variant not found");
    }
    const body = await request.json();
    const { mediaId } = body;
    if (!mediaId) {
      throw new AppError("INVALID_INPUT", "mediaId is required");
    }
    const updated = await setVariantPrimaryImage(mediaId, variantId);
    return Response.json(ok(updated));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}