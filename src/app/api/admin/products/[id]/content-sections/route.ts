import { ok } from "@/core/http/responses";
import { createProductContentSection, listProductContentSections } from "@/modules/products/admin-product-details.service";
import { requireAdminProductsManage, requireAdminProductsView } from "../../../authz";
import { adminProductsErrorResponse } from "../../error-response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await listProductContentSections((await context.params).id)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await createProductContentSection((await context.params).id, await request.json(), access.actorUserId)), { status: 201 });
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
