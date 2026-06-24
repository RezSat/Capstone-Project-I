import { ok } from "@/core/http/responses";
import { removeProductContentSection, updateProductContentSection } from "@/modules/products/admin-product-details.service";
import { requireAdminProductsManage } from "../../../../authz";
import { adminProductsErrorResponse } from "../../../error-response";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; sectionId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const params = await context.params;
    return Response.json(ok(await updateProductContentSection(params.id, params.sectionId, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; sectionId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const params = await context.params;
    return Response.json(ok(await removeProductContentSection(params.id, params.sectionId, access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
