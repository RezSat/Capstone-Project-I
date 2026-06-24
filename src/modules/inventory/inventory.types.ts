export type InventoryItem = {
  id: string;
  variantId: string;
  locationId: string;
  quantityOnHand: number;
  quantityReserved: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryStockLevelItem = {
  inventoryId: string;
  variantId: string;
  quantityOnHand: number;
  lowStockThreshold: number;
};

export type InventoryAdjustmentType = "in" | "out" | "adjustment";

export type AdjustInventoryInput = {
  variantId: string;
  type: InventoryAdjustmentType;
  quantity: number;
  note?: string;
  source?: string;
};

export type UpdateInventoryQuantityInput = {
  inventoryId: string;
  variantId: string;
  currentQuantity: number;
  nextQuantity: number;
};

export type AdjustmentMovementInput = {
  type: InventoryAdjustmentType;
  quantity: number;
  movementId: string;
  note: string | null;
  source: string | null;
};