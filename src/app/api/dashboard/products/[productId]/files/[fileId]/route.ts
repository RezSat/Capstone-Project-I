import { ok } from "@/core/http/responses";
import { API_ERROR_CODES } from "@/lib/constants";
import { fail } from "@/core/http/responses";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";
import { deleteProductFileMetadata } from "@/modules/product-files/product-file.service";
import { productFilesErrorResponse } from "../route-errors";

/** DELETE /api/dashboard/products/[productId]/files/[fileId]
 *  Soft-deletes product file metadata.
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ productId: string; fileId: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { fileId } = await context.params;
    await deleteProductFileMetadata(fileId);
    return Response.json(ok({ success: true }));
  } catch (error) {
    return productFilesErrorResponse(error);
  }
}