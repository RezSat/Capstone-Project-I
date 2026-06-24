"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

type RegistrationModalProps = {
  email: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
};

export function RegistrationModal({ email, orderNumber, isOpen, onClose }: RegistrationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please create a password for your account.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/storefront/register-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, orderNumber }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Account creation failed. Please try again.");
        return;
      }
      toast.success("Account created! Your order has been linked.");
      window.location.href = "/account";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <h2
            className="text-2xl font-bold uppercase tracking-tight text-[#191A1C] mb-1"
            style={{ fontFamily: "var(--font-oswald-next)" }}
          >
            CLAIM YOUR ACCOUNT
          </h2>
          <p className="font-open-sans text-xs text-[#777777] mb-1">
            Save your delivery specifications, localized maps, and secure tracking information instantly for future orders.
          </p>
          <p className="font-mono text-xs text-gray-400">Order #{orderNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full rounded-md border border-[#D9D9D9] bg-gray-50 px-4 py-3 font-open-sans text-sm text-[#777777] cursor-not-allowed"
            />
          </div>

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

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[#f97316] py-4 font-oswald text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-[#ea580c] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "CREATE ACCOUNT & LINK ORDER"}
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center font-open-sans text-xs text-[#777777] hover:text-[#191A1C] transition-colors"
        >
          No thanks, continue as guest
        </button>
      </div>
    </div>
  );
}
