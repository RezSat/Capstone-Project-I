"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { AccountData } from "./components/types";
import { PasswordSetupBanner } from "./components/PasswordSetupBanner";
import { OrderHistorySection } from "./components/OrderHistorySection";
import { AccountDetailsSection } from "./components/AccountDetailsSection";

export default function CustomerAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        let res = await fetch("/api/account/details");
        let json = await res.json();

        if (!res.ok || !json.success) {
          const lastOrderNumber = localStorage.getItem("lastOrderNumber");
          const savedSession = localStorage.getItem("savedSession");

          if (lastOrderNumber) {
            try {
              const autoLoginRes = await fetch("/api/storefront/checkout/auto-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber: lastOrderNumber }),
              });
              const autoLoginJson = await autoLoginRes.json();
              if (autoLoginRes.ok && autoLoginJson.success) {
                res = await fetch("/api/account/details");
                json = await res.json();
                if (res.ok && json.success) {
                  setData(json.data);
                  setLoading(false);
                  localStorage.removeItem("lastOrderNumber");
                  return;
                }
              }
            } catch {}
          }

          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              const mapped: AccountData = {
                user: { id: parsed.userId || "", email: parsed.email || "", accountStatus: parsed.accountStatus || "incomplete" },
                profile: parsed.firstName ? { id: parsed.customerId || "", firstName: parsed.firstName || null, lastName: parsed.lastName || null, displayName: parsed.displayName || null, phone: parsed.phone || null } : null,
                orders: [],
                addresses: parsed.address ? [{ id: "", type: "shipping", fullName: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim(), phone: parsed.phone || "", addressLine1: parsed.address || "", addressLine2: parsed.apartment || null, city: parsed.city || "", district: null, province: null, postalCode: parsed.postalCode || null, countryCode: "LK", isDefaultShipping: true, isDefaultBilling: true }] : [],
                defaultShipping: parsed.address ? { id: "", fullName: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim(), phone: parsed.phone || "", addressLine1: parsed.address || "", addressLine2: parsed.apartment || null, city: parsed.city || "", district: null, province: null, postalCode: parsed.postalCode || null, countryCode: "LK" } : null,
              };
              setData(mapped);
              setLoading(false);
              return;
            } catch {}
          }

          setError("session_expired");
        } else {
          setData(json.data);
          localStorage.setItem("savedSession", JSON.stringify(json.data));
        }
      } catch {
        setError("Failed to load account");
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("savedSession");
    localStorage.removeItem("lastOrderNumber");
    localStorage.removeItem("savedOrder");
    fetch("/api/storefront/auth/logout", { method: "POST" }).finally(() => { window.location.href = "/"; });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#f97316] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {error === "session_expired" ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#191A1C] mb-3" style={{ fontFamily: "var(--font-oswald-next)" }}>
                Complete Your Account Setup
              </h2>
              <p className="text-[#777777] font-open-sans mb-6 text-sm sm:text-base">
                You have a guest account from your recent purchase. Set up your password to access your account and track orders.
              </p>
              <button onClick={() => router.push("/setup-account")} className="mt-4 px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">
                Set Up My Account
              </button>
            </>
          ) : (
            <>
              <p className="text-[#191A1C] font-open-sans">{error || "Failed to load account"}</p>
              <button onClick={() => router.push("/")} className="mt-4 px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">Go Home</button>
            </>
          )}
        </div>
      </div>
    );
  }

  function handleAddressUpdate(updated: NonNullable<AccountData["defaultShipping"]>) {
    setData((prev) => prev ? { ...prev, defaultShipping: updated } : prev);
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[#E5E5E5]">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#191A1C]" style={{ fontFamily: "var(--font-oswald-next)" }}>
            MY ACCOUNT
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-open-sans text-[#777777] hover:text-[#191A1C] transition-colors">
            <LogOut size={16} />
            <span className="hidden sm:inline">LOGOUT</span>
            <span className="sm:hidden">EXIT</span>
          </button>
        </div>

        {data.user.accountStatus === "incomplete" && (
          <PasswordSetupBanner onVerified={() => setData((prev) => prev ? { ...prev, user: { ...prev.user, accountStatus: "active" } } : prev)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <OrderHistorySection orders={data.orders} />
          <AccountDetailsSection data={data} onUpdateAddress={handleAddressUpdate} />
        </div>
      </div>
    </main>
  );
}
