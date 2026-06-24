import { insertStockMovement, listStockMovements, searchMovementsPaginated, type MovementSearchParams, type InsertMovementInput } from "./movement.repo";
import { createMovementSchema } from "./movement.schema";
import type { CreateMovementInput } from "./movement.types";

export function validateCreateMovement(input: unknown) {
  return createMovementSchema.parse(input);
}

export async function createMovement(input: CreateMovementInput) {
  const parsedInput = validateCreateMovement(input);

  const insertInput: InsertMovementInput = {
    variantId: parsedInput.productId,
    locationId: "",
    movementType: parsedInput.type,
    sourceType: "manual",
    quantityChange: parsedInput.quantity,
    quantityBefore: 0,
    quantityAfter: parsedInput.quantity,
  };

  return insertStockMovement(insertInput);
}

export function getStockMovements() {
  return listStockMovements();
}

export async function findMovementsPaginated(params: MovementSearchParams) {
  return searchMovementsPaginated(params);
}
