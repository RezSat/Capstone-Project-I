export type DashboardStockMovementItem = {
  id: string;
  variantId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note: string | null;
  createdAt: Date;
};

export type DashboardStockMovementsListData = {
  items: DashboardStockMovementItem[];
  status: "loading" | "ready" | "error";
  isEmpty: boolean;
};