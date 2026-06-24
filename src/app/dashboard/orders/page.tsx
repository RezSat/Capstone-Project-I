"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Package, Phone, MapPin, Loader2 } from "lucide-react";
import type { DashboardOrder, DashboardOrderItem } from "@/modules/orders/dashboard-orders.types";
import { DashboardMetricCard, DashboardPageHeader } from "@/components/dashboard/dashboard-ui";

type OrderDetail = DashboardOrder & { items: DashboardOrderItem[] };

const statusConfig: Record<string, string> = {
  staged: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  pending_payment: "bg-gray-100 text-gray-800",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatPrice(minor: number) {
  return `LKR ${(minor / 100).toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
}

function OrderDetailDrawer({
  order,
  onClose,
  onRefresh,
}: {
  order: OrderDetail;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const billing = order.billingDetailsSnapshot ?? {
    firstName: "Unknown",
    lastName: "Customer",
    address: "",
    city: "",
    phone: "",
  };
  const items = order.items;
  const [confirming, setConfirming] = useState(false);
  const [voiding, setVoiding] = useState(false);

  async function handleConfirm() {
    if (order.status !== "staged") {
      toast.error("Order cannot be confirmed — not in staged status");
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch("/api/dashboard/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Order confirmed — inventory committed");
        onClose();
        onRefresh();
      } else {
        toast.error(json.error ?? "Confirm failed");
      }
    } catch {
      toast.error("Network error during confirmation");
    } finally {
      setConfirming(false);
    }
  }

  async function handleVoid() {
    if (!window.confirm("Void this order? This action cannot be undone.")) return;
    setVoiding(true);
    try {
      const res = await fetch(`/api/dashboard/orders/delete?id=${order.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Order voided");
        onClose();
        onRefresh();
      } else {
        toast.error(json.error ?? "Void failed");
      }
    } catch {
      toast.error("Network error during void");
    } finally {
      setVoiding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <div>
            <h2 className="font-oswald text-xl font-semibold uppercase text-[#191A1C]">Order Details</h2>
            <p className="mt-1 font-mono text-xs text-gray-400">{order.orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Phone size={14} />
              Contact &amp; Phone
            </div>
            <div className="text-sm text-gray-600">{billing.firstName} {billing.lastName}</div>
            <div className="text-sm text-gray-600">{order.customerEmailSnapshot ?? billing.phone}</div>
            <div className="text-sm text-gray-600">{billing.phone}</div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin size={14} />
              Delivery Address
            </div>
            <div className="text-sm text-gray-600">
              {billing.address}
              {billing.apartment ? `, ${billing.apartment}` : ""}
            </div>
            <div className="text-sm text-gray-600">
              {billing.city}
              {billing.postalCode ? `, ${billing.postalCode}` : ""}
            </div>
          </div>

          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <Package size={14} />
              Purchased Items ({items.length})
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-3 text-center">No item records available.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 text-left font-medium">Product</th>
                    <th className="pb-2 text-center font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-left">
                        <div className="font-medium text-gray-900">{item.productNameSnapshot}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.variantTitleSnapshot}</div>
                      </td>
                      <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        {formatPrice(item.unitPriceMinor * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-lg border border-[#e5e7eb] p-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(order.subtotalMinor || order.grandTotalMinor)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">Shipping</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(order.shippingTotalMinor || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <span className="font-oswald text-base font-semibold text-[#191A1C]">Total</span>
              <span className="font-oswald text-base font-bold text-[#191A1C]">
                {formatPrice(order.grandTotalMinor)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={confirming || voiding || order.status !== "staged"}
              onClick={handleConfirm}
              className="w-full rounded-md bg-[#f97316] py-3 text-sm font-oswald font-medium tracking-wider uppercase text-white transition-colors hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {confirming ? <Loader2 size={14} className="animate-spin" /> : null}
              {confirming ? "Committing..." : "CONFIRM ORDER & COMMIT INVENTORY"}
            </button>

            <button
              type="button"
              disabled={confirming || voiding || order.status === "cancelled" || order.status === "completed"}
              onClick={handleVoid}
              className="w-full rounded-md border border-red-200 text-red-600 hover:bg-red-50 py-3 text-sm font-oswald font-medium tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {voiding ? <Loader2 size={14} className="animate-spin" /> : null}
              {voiding ? "Voiding..." : "VOID / DELETE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/orders?page=${page}&pageSize=${PAGE_SIZE}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success) {
            setOrders(json.data);
            setTotalPages(json.pagination?.totalPages ?? 1);
          } else {
            toast.error(json.error ?? "Failed to load orders");
          }
        }
      } catch {
        if (isMounted) toast.error("Network communication failure loading orders");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrders();
    return () => { isMounted = false; };
  }, [page]);

  function handleRefresh() {
    fetch(`/api/dashboard/orders?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setOrders(json.data);
          setTotalPages(json.pagination?.totalPages ?? 1);
        }
      });
  }

  return (
    <main className="space-y-6">
      <DashboardPageHeader
        eyebrow="Commerce operations"
        title="Orders"
        description="Review staged and completed transactions, inspect billing snapshots, and commit staged inventory."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard label="Loaded orders" value={orders.length} tone="orange" />
        <DashboardMetricCard label="Current page" value={page} />
        <DashboardMetricCard label="Total pages" value={totalPages} />
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-8 text-center text-sm text-[#64748b] animate-pulse">Loading orders matrix...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-[#e5e7eb] bg-white py-12 text-center text-sm italic text-[#94a3b8]">No historical transactions logged.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
          <table className="w-full text-left font-ui text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-xs font-bold uppercase tracking-wider text-[#64748b]">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer Email</th>
                <th className="px-4 py-3">Billing Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const billing = order.billingDetailsSnapshot;
                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-[#eef2f7] transition-colors hover:bg-[#fff7ed]/45"
                    onClick={() => setActiveOrder(order)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.orderNumber.slice(0, 12)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.customerEmailSnapshot ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{billing?.firstName ?? "—"} {billing?.lastName ?? ""}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(order.grandTotalMinor)}</td>
                    <td className="px-4 py-3">
                      {order.paymentStatus === "paid" ? (
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-700 rounded tracking-wide">
                          PAID
                        </span>
                      ) : (
                        <span className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wide ${statusConfig[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeOrder && (
        <OrderDetailDrawer
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
          onRefresh={handleRefresh}
        />
      )}
    </main>
  );
}
