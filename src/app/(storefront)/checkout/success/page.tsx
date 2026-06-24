"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";
import { RegistrationModal } from "@/components/storefront/checkout/registration-modal";
import { PasswordSetupModal } from "@/components/storefront/checkout/password-setup-modal";

function formatPrice(minor: number) {
  return `LKR ${(minor / 100).toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    customerEmail: string | null;
    accountExists: boolean;
    hasPassword: boolean;
    paymentStatus: string;
    grandTotalMinor: number;
    currencyCode: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/storefront/orders/lookup?ref=${encodeURIComponent(ref)}`);
        const json = await res.json();

        if (!isMounted) return;

        if (json.success) {
          setOrderData(json.data);
          if (json.data.orderNumber) {
            localStorage.setItem("lastOrderNumber", json.data.orderNumber);
          }

          if (json.data.customerEmail) {
            try {
              const autoLoginRes = await fetch("/api/storefront/checkout/auto-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber: ref }),
              });
              const autoLoginJson = await autoLoginRes.json();

              if (autoLoginJson.success && autoLoginJson.data?.hasPassword === false) {
                setShowPasswordSetup(true);
              } else if (!json.data.accountExists) {
                setTimeout(() => {
                  if (isMounted) setShowModal(true);
                }, 800);
              }
            } catch {
              if (!json.data.accountExists) {
                setTimeout(() => {
                  if (isMounted) setShowModal(true);
                }, 800);
              }
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();
    return () => { isMounted = false; };
  }, [ref]);

  const isPaid = orderData?.paymentStatus === "paid";
  const shouldShowRegister = !orderData?.accountExists && !!orderData?.customerEmail;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#f97316] border-t-transparent animate-spin" />
        <p className="font-open-sans text-sm text-[#777777]">Verifying your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-open-sans">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mb-8 flex justify-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 ${isPaid ? "bg-green-100 animate-bounce-in" : "bg-gray-100"}`}>
            {isPaid ? (
              <CheckCircle className="h-10 w-10 text-green-600 animate-pop-in" />
            ) : (
              <Package className="h-10 w-10 text-gray-400" />
            )}
          </div>
        </div>

        <h1
          className="text-3xl font-bold uppercase tracking-tight text-[#191A1C] mb-3"
          style={{ fontFamily: "var(--font-oswald-next)" }}
        >
          {isPaid ? "Payment Successful!" : "Order Confirmed!"}
        </h1>
        <p className="font-open-sans text-sm text-[#777777] mb-2">
          {isPaid
            ? "Your payment has been received and your order is being processed."
            : "Thank you for your purchase. Your order has been received and is being processed."}
        </p>

        {orderData ? (
          <div className="bg-[#F9F9F9] rounded-lg p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#777777]">Order Number</span>
              <span className="font-mono font-semibold text-[#191A1C]">{orderData.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#777777]">Payment Status</span>
              <span className={`font-semibold uppercase text-xs tracking-wider ${isPaid ? "text-green-600" : "text-yellow-600"}`}>
                {orderData.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#777777]">Total</span>
              <span className="font-semibold text-[#191A1C]">{formatPrice(orderData.grandTotalMinor)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#777777]">Confirmation sent to</span>
              <span className="text-[#191A1C]">{orderData.customerEmail ?? "—"}</span>
            </div>
          </div>
        ) : ref ? (
          <div className="bg-[#F9F9F9] rounded-lg p-6 text-left">
            <p className="font-open-sans text-sm text-[#777777]">
              Your order is confirmed. You will receive a confirmation email shortly.
            </p>
          </div>
        ) : null}

        {shouldShowRegister && (
          <div className="mt-4 rounded-md border border-dashed border-[#f97316] bg-orange-50 px-4 py-3">
            <p className="text-sm text-[#191A1C] mb-2">
              Create your account to track this order and save your delivery details.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-sm font-semibold text-[#f97316] hover:underline"
            >
              Click here to claim your account &rarr;
            </button>
          </div>
        )}

        <div className="mt-10 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-md bg-[#f97316] py-4 font-oswald text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-[#ea580c] text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="block w-full rounded-md border border-[#D9D9D9] py-3 font-oswald text-sm font-medium tracking-wider text-[#191A1C] uppercase transition-colors hover:bg-gray-50 text-center"
          >
            View My Account
          </Link>
        </div>
      </div>

      {orderData && (
        <RegistrationModal
          email={orderData.customerEmail ?? ""}
          orderNumber={orderData.orderNumber}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {orderData && (
        <PasswordSetupModal
          email={orderData.customerEmail ?? ""}
          orderNumber={orderData.orderNumber}
          isOpen={showPasswordSetup}
          onClose={() => setShowPasswordSetup(false)}
          onSuccess={() => setShowPasswordSetup(false)}
        />
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#f97316] border-t-transparent animate-spin" />
        <p className="font-open-sans text-sm text-[#777777]">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
