export type StockMovementType = "in" | "out" | "adjustment";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  note: string | null;
  source: string | null;
  createdAt: Date;
};

export type CreateMovementInput = {
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
  source?: string;
};

export type InsertMovementInput = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  note: string | null;
  source: string | null;
};
