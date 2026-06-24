import { ok } from "../../../../../../../core/http/responses";
import { generateProductVariants } from "../../../../../../../modules/products/admin-variants.service";
import { requireAdminProductsManage } from "../../../../authz";
import { adminProductsErrorResponse } from "../../../error-response";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await generateProductVariants((await context.params).id, await request.json(), access.actorUserId)));
  } catch (error) {
    return adminProductsErrorResponse(error);
  }
}
