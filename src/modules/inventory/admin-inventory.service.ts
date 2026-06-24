import { AppError } from "@/core/http/errors";
import { API_ERROR_CODES } from "@/lib/constants";
import {
  listAdminInventoryCatalog,
  updateAdminInventoryItem,
  type AdminInventoryProduct,
  type AdminInventoryUpdateInput,
} from "./admin-inventory.repo";

export type { AdminInventoryProduct, AdminInventoryUpdateInput };

export async function getAdminInventoryCatalog(): Promise<AdminInventoryProduct[]> {
  return listAdminInventoryCatalog();
}

export async function patchAdminInventoryItem(input: AdminInventoryUpdateInput) {
  if (!input.variantId) {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "variantId is required");
  }
  if (typeof input.quantityOnHand !== "number" || input.quantityOnHand < 0) {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "quantityOnHand must be a non-negative number");
  }

  const updated = await updateAdminInventoryItem({
    variantId: input.variantId,
    quantityOnHand: input.quantityOnHand,
    priceMinor: input.priceMinor,
    compareAtPriceMinor: input.compareAtPriceMinor,
  });

  if (!updated) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Inventory item not found for variant");
  }

  return updated;
}