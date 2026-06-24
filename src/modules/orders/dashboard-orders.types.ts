export type BillingDetailsSnapshot = {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  district?: string;
  province?: string;
  postalCode?: string;
  phone: string;
};

export type DashboardOrderItem = {
  id: string;
  productNameSnapshot: string;
  variantTitleSnapshot: string | null;
  skuSnapshot: string | null;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
};

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  grandTotalMinor: number;
  subtotalMinor?: number;
  discountTotalMinor?: number;
  taxTotalMinor?: number;
  shippingTotalMinor?: number;
  currencyCode: string;
  customerEmailSnapshot: string | null;
  customerPhoneSnapshot: string | null;
  billingDetailsSnapshot: BillingDetailsSnapshot;
  createdAt: Date;
  placedAt: Date | null;
  items: DashboardOrderItem[];
};

export type DashboardOrdersListData = {
  items: DashboardOrder[];
  status: "ready" | "error";
  isEmpty: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};