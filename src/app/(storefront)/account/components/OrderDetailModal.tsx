"use client";

import { useState, useEffect } from "react";
import { Package, X } from "lucide-react";
import type { OrderDetail } from "./types";
import { formatPrice, formatDateTime, getStatusColor, getPaymentLabel, getPaymentBadgeColor } from "./types";

type Props = {
  orderId: string;
  onClose: () => void;
};

export function OrderDetailModal({ orderId, onClose }: Props) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/account/orders/${orderId}`);
        const json = await res.json();
        if (!cancelled && res.ok && json.success) setDetail(json.data);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E5E5E5]">
          <div>
            <h3 className="font-bold text-[#191A1C] text-base sm:text-lg" style={{ fontFamily: "var(--font-oswald-next)" }}>
              Order Details
            </h3>
            {detail && <p className="font-mono text-xs text-[#777777]">{detail.orderNumber}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            <X size={18} className="text-[#777777]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-3 border-[#f97316] border-t-transparent animate-spin" />
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#777777] uppercase tracking-wider mb-1">Date</p>
                  <p className="text-[#191A1C] font-open-sans">{formatDateTime(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#777777] uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-open-sans font-semibold uppercase text-xs tracking-wider ${getStatusColor(detail.status)}`}>
                    {detail.status.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#777777] uppercase tracking-wider mb-1">Payment</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getPaymentBadgeColor(detail.paymentMethod)}`}>
                    {getPaymentLabel(detail.paymentMethod)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#777777] uppercase tracking-wider mb-1">Payment Status</p>
                  <p className={`font-open-sans font-semibold uppercase text-xs tracking-wider ${getStatusColor(detail.paymentStatus)}`}>
                    {detail.paymentStatus.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-[#777777] uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-3">
                  {detail.items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-gray-100 border border-[#E5E5E5] overflow-hidden flex-shrink-0">
                        {item.imageSrc ? (
                          <img src={item.imageSrc} alt={item.productNameSnapshot} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-open-sans text-sm font-semibold text-[#191A1C] truncate">{item.productNameSnapshot}</p>
                        <p className="font-open-sans text-xs text-[#777777]">{item.variantTitleSnapshot}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-open-sans text-xs text-[#777777]">Qty: {item.quantity}</span>
                          <span className="font-open-sans text-sm font-semibold text-[#191A1C]">{formatPrice(item.lineTotalMinor, detail.currencyCode)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-[#E5E5E5] pt-3 space-y-2 text-sm">
                <div className="flex justify-between font-open-sans text-[#777777]">
                  <span>Subtotal</span>
                  <span>{formatPrice(detail.subtotalMinor, detail.currencyCode)}</span>
                </div>
                {detail.discountTotalMinor > 0 && (
                  <div className="flex justify-between font-open-sans text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(detail.discountTotalMinor, detail.currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between font-open-sans text-[#777777]">
                  <span>Tax</span>
                  <span>{formatPrice(detail.taxTotalMinor, detail.currencyCode)}</span>
                </div>
                <div className="flex justify-between font-open-sans text-[#777777]">
                  <span>Shipping</span>
                  <span>{formatPrice(detail.shippingTotalMinor, detail.currencyCode)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#191A1C] text-base pt-2 border-t border-[#E5E5E5]">
                  <span>Total</span>
                  <span>{formatPrice(detail.grandTotalMinor, detail.currencyCode)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-[#777777] py-12 font-open-sans">Order not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
