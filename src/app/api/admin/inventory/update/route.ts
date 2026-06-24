import { AppError } from "@/core/http/errors";
import { ok, fail } from "@/core/http/responses";
import { requireAdminInventoryAdjust } from "@/app/api/admin/authz";
import { patchAdminInventoryItem } from "@/modules/inventory/admin-inventory.service";
import { API_ERROR_CODES } from "@/lib/constants";

function toError(error: unknown) {
  console.error("Inventory PUT Error:", error);
  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), {
      status: error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION_ERROR" ? 400 : 500,
    });
  }
  return Response.json(fail("INTERNAL_ERROR", error instanceof Error ? error.message : "Internal server error"), { status: 500 });
}

export async function PUT(request: Request) {
  const access = await requireAdminInventoryAdjust();
  if (access.denied) return access.denied;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return Response.json(fail(API_ERROR_CODES.VALIDATION_ERROR, "Invalid request body"), { status: 400 });
    }
    const variantId = body.variantId as string | undefined;
    const quantityOnHand = body.quantityOnHand as number | undefined;
    const priceMinor = typeof body.priceMinor === "number" ? body.priceMinor : null;
    const compareAtPriceMinor = typeof body.compareAtPriceMinor === "number" ? body.compareAtPriceMinor : null;
    if (!variantId || typeof quantityOnHand !== "number" || quantityOnHand < 0) {
      return Response.json(fail(API_ERROR_CODES.VALIDATION_ERROR, "variantId and quantityOnHand are required"), { status: 400 });
    }
    await patchAdminInventoryItem({ variantId, quantityOnHand, priceMinor, compareAtPriceMinor });
    return Response.json(ok({ success: true, updatedVariantId: variantId }));
  } catch (error) {
    return toError(error);
  }
}
