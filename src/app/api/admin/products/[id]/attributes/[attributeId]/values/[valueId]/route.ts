import { ok } from "../../../../../../../../../core/http/responses";
import { updateProductAttributeValue } from "../../../../../../../../../modules/products/admin-variants.service";
import { requireAdminProductsManage } from "../../../../../../authz";
import { adminProductsErrorResponse } from "../../../../../error-response";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; attributeId: string; valueId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, attributeId, valueId } = await context.params;
    return Response.json(ok(await updateProductAttributeValue(id, attributeId, valueId, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
