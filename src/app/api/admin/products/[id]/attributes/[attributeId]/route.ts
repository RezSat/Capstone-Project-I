import { ok } from "../../../../../../../core/http/responses";
import { deleteProductAttribute, updateProductAttribute } from "../../../../../../../modules/products/admin-variants.service";
import { requireAdminProductsManage } from "../../../../authz";
import { adminProductsErrorResponse } from "../../../error-response";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; attributeId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, attributeId } = await context.params;
    return Response.json(ok(await updateProductAttribute(id, attributeId, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string; attributeId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, attributeId } = await context.params;
    return Response.json(ok(await deleteProductAttribute(id, attributeId, access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
