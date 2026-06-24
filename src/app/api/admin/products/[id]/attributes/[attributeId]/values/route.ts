import { ok } from "../../../../../../../../core/http/responses";
import { listProductAttributeValues } from "../../../../../../../../modules/products/admin-attribute-values-read.service";
import { createProductAttributeValue } from "../../../../../../../../modules/products/admin-variants.service";
import { requireAdminProductsManage, requireAdminProductsView } from "../../../../../authz";
import { adminProductsErrorResponse } from "../../../../error-response";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string; attributeId: string }> }
) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    const { id, attributeId } = await context.params;
    return Response.json(ok(await listProductAttributeValues(id, attributeId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; attributeId: string }> }
) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, attributeId } = await context.params;
    return Response.json(ok(await createProductAttributeValue(id, attributeId, await request.json(), access.actorUserId)), { status: 201 });
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
