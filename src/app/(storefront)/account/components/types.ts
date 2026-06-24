export type AccountData = {
  user: { id: string; email: string; accountStatus: string };
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    phone: string | null;
  } | null;
  orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    grandTotalMinor: number;
    currencyCode: string;
    paymentMethod: string;
  }>;
  addresses: Array<{
    id: string;
    type: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string | null;
    province: string | null;
    postalCode: string | null;
    countryCode: string;
    isDefaultShipping: boolean;
    isDefaultBilling: boolean;
  }>;
  defaultShipping: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    district: string | null;
    province: string | null;
    postalCode: string | null;
    countryCode: string;
  } | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  grandTotalMinor: number;
  subtotalMinor: number;
  taxTotalMinor: number;
  shippingTotalMinor: number;
  discountTotalMinor: number;
  currencyCode: string;
  paymentMethod: string;
  billingDetailsSnapshot: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productNameSnapshot: string;
    variantTitleSnapshot: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    imageSrc: string | null;
  }>;
};

export function formatPrice(minor: number, currency: string) {
  return `${currency} ${(minor / 100).toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "completed":
      return "text-green-600";
    case "pending_payment":
    case "pending":
      return "text-yellow-600";
    case "failed":
    case "cancelled":
      return "text-red-600";
    default:
      return "text-[#777777]";
  }
}

export function getPaymentLabel(method: string) {
  switch (method) {
    case "card":
      return "Credit Card";
    case "cash":
      return "Cash on Delivery";
    case "bank_transfer":
      return "Bank Transfer";
    default:
      return method?.toUpperCase() || "N/A";
  }
}

export function getPaymentBadgeColor(method: string) {
  switch (method) {
    case "card":
      return "bg-blue-100 text-blue-700";
    case "cash":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
