"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Package, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { AccountData } from "./types";
import { formatPrice, formatDate, getStatusColor, getPaymentLabel, getPaymentBadgeColor } from "./types";
import { OrderDetailModal } from "./OrderDetailModal";

const ORDERS_PER_PAGE = 8;

type Props = {
  orders: AccountData["orders"];
};

export function OrderHistorySection({ orders }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orders, page]);

  return (
    <>
      <section className="bg-white rounded-lg border border-[#E5E5E5] p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Package size={20} className="text-[#f97316]" />
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#191A1C]" style={{ fontFamily: "var(--font-oswald-next)" }}>
            Order History
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-open-sans text-sm text-[#777777]">No orders yet</p>
            <button onClick={() => router.push("/")} className="mt-4 px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">
              Start Shopping
            </button>
          </div>
        ) : (
          <div>
            <div className="max-h-[400px] sm:max-h-[480px] overflow-y-auto divide-y divide-[#E5E5E5]">
              {paginated.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 sm:py-4 px-1 group">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold text-[#191A1C] text-xs sm:text-sm truncate">{order.orderNumber}</p>
                    <p className="font-open-sans text-xs text-[#777777] mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold text-[#191A1C] text-xs sm:text-sm">{formatPrice(order.grandTotalMinor, order.currencyCode)}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                        <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-semibold leading-4 ${getPaymentBadgeColor(order.paymentMethod)}`}>
                          {getPaymentLabel(order.paymentMethod)}
                        </span>
                        <span className={`font-open-sans text-xs uppercase tracking-wider ${getStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedOrder(order.id)}
                      className="p-1.5 sm:p-2 rounded-md border border-[#D9D9D9] text-[#777777] hover:border-[#f97316] hover:text-[#f97316] transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="View order details">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E5E5E5]">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 sm:p-2 rounded border border-[#D9D9D9] text-[#777777] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-open-sans text-xs sm:text-sm text-[#777777]">
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 sm:p-2 rounded border border-[#D9D9D9] text-[#777777] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {selectedOrder && (
        <OrderDetailModal orderId={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
