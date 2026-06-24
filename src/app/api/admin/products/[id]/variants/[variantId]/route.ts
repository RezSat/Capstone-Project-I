import { ok } from "../../../../../../../core/http/responses";
import { deleteProductVariant, updateProductVariant } from "../../../../../../../modules/products/admin-variants.service";
import { requireAdminProductsManage } from "../../../../authz";
import { adminProductsErrorResponse } from "../../../error-response";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, variantId } = await context.params;
    return Response.json(ok(await updateProductVariant(id, variantId, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, variantId } = await context.params;
    return Response.json(ok(await deleteProductVariant(id, variantId, access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
