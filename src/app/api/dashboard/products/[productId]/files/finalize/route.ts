import { ok } from "../../../../../../../core/http/responses";
import { API_ERROR_CODES } from "../../../../../../../lib/constants";
import { fail } from "../../../../../../../core/http/responses";
import { getDashboardAuth } from "../../../../../../../modules/auth/dashboard-auth.service";
import { createProductFileMetadata } from "../../../../../../../modules/product-files/product-file.service";

function toError(error: unknown) {
  console.error("Product files finalize error:", error);
  if (error instanceof Error) return Response.json(fail(API_ERROR_CODES.INTERNAL_ERROR, error.message), { status: 500 });
  return Response.json(fail(API_ERROR_CODES.INTERNAL_ERROR, "Internal error"), { status: 500 });
}

/** POST /api/dashboard/products/[productId]/files/finalize
 *  Saves product file metadata after a local file upload.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { productId } = await context.params;
    const body = await request.json();
    const productFile = await createProductFileMetadata({ productId, ...body });
    return Response.json(ok(productFile));
  } catch (error) {
    return toError(error);
  }
}
