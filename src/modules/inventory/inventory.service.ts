import { AppError } from "../../core/http/errors";
import { API_ERROR_CODES } from "../../lib/constants";
import {
  findInventoryByVariantId,
  findInventoryByVariantIdInTransaction,
  searchInventoryPaginated,
  listInventory,
  listInventoryStockLevels,
  updateInventoryQuantity,
  withInventoryTransaction,
  type InventorySearchParams,
} from "./inventory.repo";
import type {
  AdjustInventoryInput,
  InventoryAdjustmentType,
  InventoryStockLevelItem,
} from "./inventory.types";

export function validateAdjustInventory(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "Invalid input");
  }
  const parsed = input as AdjustInventoryInput;
  if (!parsed.variantId) {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "variantId is required");
  }
  if (!parsed.type) {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "type is required");
  }
  if (typeof parsed.quantity !== "number" || parsed.quantity <= 0) {
    throw new AppError(API_ERROR_CODES.VALIDATION_ERROR, "quantity must be a positive number");
  }
  return parsed;
}

export function isLowStockItem(item: InventoryStockLevelItem) {
  return item.quantityOnHand <= item.lowStockThreshold;
}

export function isOutOfStockItem(item: InventoryStockLevelItem) {
  return item.quantityOnHand === 0;
}

function getNextQuantity(currentQuantity: number, type: InventoryAdjustmentType, quantity: number) {
  if (type === "adjustment") {
    return quantity;
  }
  if (type === "out") {
    return currentQuantity - quantity;
  }
  return currentQuantity + quantity;
}

export async function adjustInventory(input: AdjustInventoryInput) {
  const parsedInput = validateAdjustInventory(input);
  const inventory = await findInventoryByVariantId(parsedInput.variantId);

  if (!inventory) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Inventory item not found");
  }

  const nextQuantity = getNextQuantity(inventory.quantityOnHand, parsedInput.type, parsedInput.quantity);

  if (nextQuantity < 0) {
    throw new AppError(
      API_ERROR_CODES.INSUFFICIENT_STOCK,
      "Insufficient stock for this operation"
    );
  }

  return withInventoryTransaction(async (tx) => {
    const lockedInventory = await findInventoryByVariantIdInTransaction(
      tx,
      parsedInput.variantId
    );

    if (!lockedInventory) {
      throw new AppError(API_ERROR_CODES.NOT_FOUND, "Inventory item not found");
    }

    const lockedNextQuantity = getNextQuantity(
      lockedInventory.quantityOnHand,
      parsedInput.type,
      parsedInput.quantity
    );

    if (lockedNextQuantity < 0) {
      throw new AppError(
        API_ERROR_CODES.INSUFFICIENT_STOCK,
        "Insufficient stock for this operation"
      );
    }

    const updatedInventory = await updateInventoryQuantity(tx, {
      inventoryId: lockedInventory.id,
      variantId: lockedInventory.variantId,
      currentQuantity: lockedInventory.quantityOnHand,
      nextQuantity: lockedNextQuantity,
    });

    if (!updatedInventory) {
      throw new AppError(
        API_ERROR_CODES.INSUFFICIENT_STOCK,
        "Insufficient stock for this operation"
      );
    }

    return updatedInventory;
  });
}

export async function listLowStockItems() {
  const items = await listInventoryStockLevels();
  return items.filter(isLowStockItem);
}

export async function listOutOfStockItems() {
  const items = await listInventoryStockLevels();
  return items.filter(isOutOfStockItem);
}

export async function getInventoryStockSummary() {
  const items = await listInventoryStockLevels();

  return {
    lowStockCount: items.filter(isLowStockItem).length,
    outOfStockCount: items.filter(isOutOfStockItem).length,
  };
}

export async function getInventoryItems() {
  return listInventory();
}

export async function findInventoryPaginated(params: InventorySearchParams) {
  return searchInventoryPaginated(params);
}