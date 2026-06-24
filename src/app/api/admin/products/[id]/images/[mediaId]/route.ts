import { ok } from "@/core/http/responses";
import { API_ERROR_CODES } from "@/lib/constants";
import { fail } from "@/core/http/responses";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";
import { updateProductImage } from "@/modules/product-files/product-image.service";

function imageErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const status = error.code === API_ERROR_CODES.NOT_FOUND ? 404 : error.code === API_ERROR_CODES.INVALID_INPUT ? 400 : 500;
    return Response.json(fail(error.code, error.message), { status });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

import { AppError } from "@/core/http/errors";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; mediaId: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { mediaId } = await context.params;
    const body = await request.json();
    const updated = await updateProductImage(mediaId, body);
    return Response.json(ok(updated));
  } catch (error) {
    return imageErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; mediaId: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { mediaId } = await context.params;
    const { deleteProductImage } = await import("@/modules/product-files/product-image.service");
    await deleteProductImage(mediaId);
    return Response.json(ok({ success: true }));
  } catch (error) {
    return imageErrorResponse(error);
  }
}