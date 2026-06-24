"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  DashboardPageHeader,
  DashboardSection,
  dashboardButtonClass,
  dashboardInputClass,
} from "@/components/dashboard/dashboard-ui"

export default function DashboardSettingsPage() {
  const [threshold, setThreshold] = useState<number>(6500)
  const [shippingFee, setShippingFee] = useState<number>(350)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setThreshold(json.data.freeShippingThresholdMinor / 100)
          setShippingFee(json.data.baseShippingFeeMinor / 100)
        }
      })
      .catch(() => toast.error("Failed to load global logistics configurations"))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeShippingThresholdMinor: Math.round(threshold * 100),
          baseShippingFeeMinor: Math.round(shippingFee * 100),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Logistics and shipping rules updated successfully!")
      } else {
        toast.error(data.error ?? "Failed to save configuration updates")
      }
    } catch {
      toast.error("An operational network error occurred while writing settings changes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-8 font-ui text-sm font-medium text-[#64748b] animate-pulse">
        Loading operational store settings...
      </div>
    )
  }

  return (
    <main className="flex max-w-3xl flex-col gap-6">
      <DashboardPageHeader
        eyebrow="System configuration"
        title="Logistics Settings"
        description="Manage delivery parameters, flat rates, and automated checkout threshold values."
      />

      <DashboardSection title="Checkout delivery rules" description="Values are saved through the existing settings endpoint.">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-ui text-xs font-bold uppercase tracking-wider text-[#191A1C]">
            Base Standard Shipping Fee (LKR)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={shippingFee}
            onChange={(e) => setShippingFee(Number(e.target.value))}
            className={dashboardInputClass("w-full")}
            placeholder="e.g. 350"
          />
        </div>

        <div>
          <label className="mb-2 block font-ui text-xs font-bold uppercase tracking-wider text-[#191A1C]">
            Free Shipping Subtotal Threshold (LKR)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className={dashboardInputClass("w-full")}
            placeholder="e.g. 6500"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={dashboardButtonClass()}
        >
          {saving ? "Saving Changes..." : "Save Configuration Matrix"}
        </button>
      </div>
      </DashboardSection>
    </main>
  )
}
