"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AccountData } from "./types";

type Props = {
  defaultShipping: AccountData["defaultShipping"];
  onUpdate: (updated: NonNullable<AccountData["defaultShipping"]>) => void;
};

export function AddressSection({ defaultShipping, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: defaultShipping?.fullName || "",
    phone: defaultShipping?.phone || "",
    addressLine1: defaultShipping?.addressLine1 || "",
    addressLine2: defaultShipping?.addressLine2 || "",
    city: defaultShipping?.city || "",
    postalCode: "",
  });

  function startEdit() {
    setForm({
      fullName: defaultShipping?.fullName || "",
      phone: defaultShipping?.phone || "",
      addressLine1: defaultShipping?.addressLine1 || "",
      addressLine2: defaultShipping?.addressLine2 || "",
      city: defaultShipping?.city || "",
      postalCode: "",
    });
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!defaultShipping?.id) { toast.error("No address to update."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: defaultShipping.id,
          fullName: form.fullName,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || null,
          city: form.city,
          postalCode: form.postalCode || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || "Failed to update address."); return; }
      onUpdate({
        ...defaultShipping,
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || null,
        city: form.city,
        postalCode: form.postalCode || null,
      });
      setEditing(false);
      toast.success("Address updated!");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-md border border-[#D9D9D9] px-3 py-2 font-open-sans text-sm text-[#191A1C] focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

  return (
    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#E5E5E5]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-[#191A1C]" style={{ fontFamily: "var(--font-oswald-next)" }}>
          Default Shipping Address
        </h3>
        {!editing && (
          <button onClick={startEdit}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-[#D9D9D9] text-[#191A1C] font-open-sans text-xs uppercase tracking-wider rounded-md hover:bg-gray-50 transition-colors">
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <input type="text" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Full name" required className={input} />
          <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" required className={input} />
          <input type="text" value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} placeholder="Address line 1" required className={input} />
          <input type="text" value={form.addressLine2} onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))} placeholder="Address line 2 (optional)" className={input} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="City" required className={input} />
            <input type="text" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} placeholder="Postal code" className={input} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="rounded-md bg-[#f97316] px-4 py-2 font-oswald text-xs font-medium tracking-wider text-white uppercase hover:bg-[#ea580c] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="rounded-md border border-[#D9D9D9] px-4 py-2 font-oswald text-xs font-medium tracking-wider text-[#191A1C] uppercase hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : defaultShipping ? (
        <div className="font-open-sans text-sm text-[#191A1C] space-y-1">
          <p className="font-semibold">{defaultShipping.fullName}</p>
          <p>{defaultShipping.addressLine1}</p>
          {defaultShipping.addressLine2 && <p>{defaultShipping.addressLine2}</p>}
          <p>
            {[defaultShipping.city, defaultShipping.district, defaultShipping.province].filter(Boolean).join(", ")}
            {defaultShipping.postalCode && ` ${defaultShipping.postalCode}`}
          </p>
          <p>{defaultShipping.phone}</p>
        </div>
      ) : null}
    </div>
  );
}
