import { ok } from "@/core/http/responses";
import { API_ERROR_CODES } from "@/lib/constants";
import { fail } from "@/core/http/responses";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";
import { listProductImages } from "@/modules/product-files/product-image.service";

function imageErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const status = error.code === API_ERROR_CODES.NOT_FOUND ? 404 : error.code === API_ERROR_CODES.INVALID_INPUT ? 400 : 500;
    return Response.json(fail(error.code, error.message), { status });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

import { AppError } from "@/core/http/errors";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { id: productId } = await context.params;
    const url = new URL(request.url);
    const variantId = url.searchParams.get("variantId") ?? undefined;
    const listing = await listProductImages({ productId, variantId });
    return Response.json(ok(listing));
  } catch (error) {
    return imageErrorResponse(error);
  }
}