"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

export default function SetupAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifySession() {
      try {
        let res = await fetch("/api/account/details");
        let json = await res.json();

        if (!res.ok || !json.success) {
          const lastOrderNumber = localStorage.getItem("lastOrderNumber");
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
                  localStorage.removeItem("lastOrderNumber");
                }
              }
            } catch {
              // auto-login recovery failed
            }
          }

          if (!res.ok || !json.success) {
            setError("session_expired");
            return;
          }
        }

        if (json.data.user.accountStatus === "active") {
          setError("already_active");
          return;
        }
      } catch {
        setError("network_error");
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to secure account. Please try again.");
        return;
      }

      toast.success("Account secured! Redirecting...");
      window.location.href = "/account";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <div className="w-12 h-12 rounded-full border-4 border-[#f97316] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-open-sans text-sm text-[#777777]">Verifying session...</p>
          <p className="font-mono text-xs text-gray-400 mt-2">Check browser console for [SETUP-ACCOUNT DEBUG] logs</p>
        </div>
      </div>
    );
  }

  if (error === "session_expired") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#191A1C] mb-3" style={{ fontFamily: "var(--font-oswald-next)" }}>
            No Active Session
          </h2>
          <p className="text-[#777777] font-open-sans mb-4 text-sm">
            Could not establish a session. Please complete a purchase first, then return here.
          </p>
          <p className="font-mono text-xs text-gray-400 mb-6">Check browser console for [SETUP-ACCOUNT DEBUG] logs</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error === "already_active") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold uppercase tracking-tight text-[#191A1C] mb-3" style={{ fontFamily: "var(--font-oswald-next)" }}>
            Account Already Active
          </h2>
          <p className="text-[#777777] font-open-sans mb-6 text-sm">
            Your account is already secured. You can access it directly.
          </p>
          <button onClick={() => router.push("/account")} className="px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">
            Go to Account
          </button>
        </div>
      </div>
    );
  }

  if (error === "network_error") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-[#191A1C] font-open-sans">Network error. Please check your connection and try again.</p>
          <p className="font-mono text-xs text-gray-400 mt-2">Check browser console for [SETUP-ACCOUNT DEBUG] logs</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-3 bg-[#f97316] text-white font-oswald text-sm uppercase tracking-wider rounded-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#777777] hover:text-[#191A1C] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Go back
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#E5E5E5]">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[#f97316]" />
            </div>
            <h1
              className="text-3xl font-bold uppercase tracking-tight text-[#191A1C] mb-2"
              style={{ fontFamily: "var(--font-oswald-next)" }}
            >
              SECURE YOUR ACCOUNT
            </h1>
            <p className="font-open-sans text-sm text-[#777777]">
              Create a password to access your account and track orders.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Create Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full rounded-md border border-[#D9D9D9] px-4 py-3 font-open-sans text-sm text-[#191A1C] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={8}
                className="w-full rounded-md border border-[#D9D9D9] px-4 py-3 font-open-sans text-sm text-[#191A1C] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-[#f97316] py-4 font-oswald text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-[#ea580c] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Securing Account..." : "SECURE ACCOUNT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}