import { ok } from "@/core/http/responses";
import { removeProductSpecification, updateProductSpecification } from "@/modules/products/admin-product-details.service";
import { requireAdminProductsManage } from "../../../../authz";
import { adminProductsErrorResponse } from "../../../error-response";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; specificationId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const params = await context.params;
    return Response.json(ok(await updateProductSpecification(params.id, params.specificationId, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; specificationId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const params = await context.params;
    return Response.json(ok(await removeProductSpecification(params.id, params.specificationId, access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
