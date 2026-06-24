import { ok } from "@/core/http/responses";
import { adminProductsErrorResponse } from "@/app/api/admin/products/error-response";
import { requireAdminProductsView, requireAdminProductsManage } from "@/app/api/admin/authz";
import { listVariantImages, createVariantImage } from "@/modules/product-files/product-image.service";
import { getVariantById } from "@/modules/products/admin-variants.repo";
import { AppError } from "@/core/http/errors";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;

  try {
    const { variantId } = await context.params;
    const listing = await listVariantImages({ variantId });
    return Response.json(ok(listing));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

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
    const created = await createVariantImage({ ...body, variantId });
    return Response.json(ok(created), { status: 201 });
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}