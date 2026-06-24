"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onVerified: () => void;
};

export function PasswordSetupBanner({ onVerified }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [setting, setSetting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setSetting(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error ?? "Failed to set password."); return; }
      toast.success("Password set! Refreshing...");
      onVerified();
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSetting(false);
    }
  }

  return (
    <div className="mb-6 sm:mb-8 bg-orange-50 border border-[#f97316]/20 rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <Lock size={20} className="text-[#f97316]" />
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#191A1C]" style={{ fontFamily: "var(--font-oswald-next)" }}>
          Secure Your Account
        </h2>
      </div>
      <p className="font-open-sans text-xs sm:text-sm text-[#777777] mb-3 sm:mb-4">
        Set a password to access your account and track orders anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 chars)" required minLength={8}
          className="flex-1 rounded-md border border-[#D9D9D9] px-4 py-2.5 font-open-sans text-sm text-[#191A1C] focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required minLength={8}
          className="flex-1 rounded-md border border-[#D9D9D9] px-4 py-2.5 font-open-sans text-sm text-[#191A1C] focus:border-black focus:outline-none focus:ring-1 focus:ring-black" />
        <button type="submit" disabled={setting}
          className="rounded-md bg-[#f97316] px-6 py-2.5 font-oswald text-sm font-medium tracking-wider text-white uppercase hover:bg-[#ea580c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
          {setting ? "Setting..." : "Set Password"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
