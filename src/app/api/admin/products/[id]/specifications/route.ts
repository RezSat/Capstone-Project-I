import { ok } from "@/core/http/responses";
import { createProductSpecification, listProductSpecifications } from "@/modules/products/admin-product-details.service";
import { requireAdminProductsManage, requireAdminProductsView } from "../../../authz";
import { adminProductsErrorResponse } from "../../error-response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await listProductSpecifications((await context.params).id)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await createProductSpecification((await context.params).id, await request.json(), access.actorUserId)), { status: 201 });
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
