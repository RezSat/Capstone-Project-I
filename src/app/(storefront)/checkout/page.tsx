"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { useAuthModal } from "@/context/auth-modal-context"
import { toast } from "sonner"
import { Loader2, CreditCard } from "lucide-react"

function formatPrice(minor: number): string {
  return `LKR ${(minor / 100).toLocaleString("en-LK", { minimumFractionDigits: 0 })}`
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

export default function CheckoutPage() {
  const { items, totalMinor } = useCart()
  const { openLoginModal } = useAuthModal()
  const [discountCode, setDiscountCode] = useState("")
  const [shippingConfig, setShippingConfig] = useState({ threshold: 650000, baseFee: 35000 })
  const [contact, setContact] = useState({ email: "", phone: "" })
  const [delivery, setDelivery] = useState({ firstName: "", lastName: "", address: "", apartment: "", city: "", postalCode: "" })
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/storefront/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setShippingConfig({
            threshold: json.data.freeShippingThresholdMinor,
            baseFee: json.data.baseShippingFeeMinor,
          })
        }
      })
  }, [])

  const subtotalMinor = totalMinor
  const isFreeShippingEligible = subtotalMinor >= shippingConfig.threshold
  const shippingMinor = isFreeShippingEligible ? 0 : shippingConfig.baseFee
  const discountMinor = 0
  const grandTotalMinor = subtotalMinor + shippingMinor - discountMinor

  async function handlePayNow() {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    if (!contact.email || !delivery.firstName || !delivery.lastName || !delivery.address || !delivery.city || !contact.phone) {
      toast.error("Please fill in all required contact and delivery fields")
      return
    }
    if (!card.number || !card.expiry || !card.cvv || !card.name) {
      toast.error("Please fill in all card details")
      return
    }

    setSubmitting(true)
    try {
      const saveGuestRes = await fetch("/api/storefront/auth/save-guest-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: delivery.firstName,
          lastName: delivery.lastName,
          email: contact.email,
          phone: contact.phone,
          address: delivery.address,
          apartment: delivery.apartment,
          city: delivery.city,
          postalCode: delivery.postalCode,
        }),
      })
      const saveGuestJson = await saveGuestRes.json()

      if (saveGuestJson.success) {
        localStorage.setItem("savedSession", JSON.stringify({
          userId: saveGuestJson.data.userId,
          customerId: saveGuestJson.data.customerId,
          email: contact.email,
          firstName: delivery.firstName,
          lastName: delivery.lastName,
          phone: contact.phone,
          address: delivery.address,
          apartment: delivery.apartment,
          city: delivery.city,
          postalCode: delivery.postalCode,
        }))
      }

      const res = await fetch("/api/storefront/checkout/card-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            priceMinor: i.priceMinor,
            name: i.name,
            optionSignature: i.optionSignature,
          })),
          grandTotalMinor,
          customerEmail: contact.email,
          billingDetails: {
            firstName: delivery.firstName,
            lastName: delivery.lastName,
            address: delivery.address,
            apartment: delivery.apartment,
            city: delivery.city,
            postalCode: delivery.postalCode,
            phone: contact.phone,
          },
          card: {
            number: card.number,
            expiry: card.expiry,
            cvv: card.cvv,
            name: card.name,
          },
        }),
      })
      const response = await res.json()

      if (!res.ok || !response.success) {
        toast.error(response.error ?? "Checkout failed")
        setSubmitting(false)
        return
      }

      window.location.href = `/checkout/success?ref=${response.orderRef}`
    } catch (err) {
      console.error("Checkout error:", err)
      toast.error("Failed to process payment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-open-sans">
      {submitting && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="h-12 w-12 text-[#f97316] animate-spin" />
            <p className="font-oswald text-lg uppercase tracking-wide text-[#191A1C]">
              Processing Payment...
            </p>
            <p className="text-sm text-[#777777]">Please do not close this window</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12">
        {/* Column 1: Contact & Delivery */}
        <div className="lg:col-span-4 p-6 md:p-8 lg:border-r lg:border-[#E5E5E5]">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-xl font-medium uppercase tracking-wide text-[#191A1C]">
                Contact
              </h2>
              <button type="button" onClick={openLoginModal} className="text-xs text-[#777777] underline hover:text-[#f97316]">
                Sign in
              </button>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              className="w-full rounded border border-[#D9D9D9] px-4 py-2.5 text-sm text-[#191A1C] focus:border-gray-500 focus:outline-none"
            />
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-oswald text-xl font-medium uppercase tracking-wide text-[#191A1C]">
              Delivery
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <select className="w-full appearance-none rounded border border-[#D9D9D9] bg-white px-4 py-2.5 text-sm text-[#191A1C] focus:border-gray-500 focus:outline-none">
                  <option value="LK">Sri Lanka</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#777777]">v</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="First Name" value={delivery.firstName} onChange={(e) => setDelivery((d) => ({ ...d, firstName: e.target.value }))} className="rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
                <input type="text" placeholder="Last Name" value={delivery.lastName} onChange={(e) => setDelivery((d) => ({ ...d, lastName: e.target.value }))} className="rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
              </div>
              <input type="text" placeholder="Address" value={delivery.address} onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))} className="w-full rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
              <input type="text" placeholder="Apartment, suite, etc. (optional)" value={delivery.apartment} onChange={(e) => setDelivery((d) => ({ ...d, apartment: e.target.value }))} className="w-full rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City" value={delivery.city} onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))} className="rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
                <input type="text" placeholder="Postal Code" value={delivery.postalCode} onChange={(e) => setDelivery((d) => ({ ...d, postalCode: e.target.value }))} className="rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
              </div>
              <input type="tel" placeholder="Phone" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className="w-full rounded border border-[#D9D9D9] px-4 py-2.5 text-sm focus:border-gray-500 focus:outline-none" />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-oswald text-xl font-medium uppercase tracking-wide text-[#191A1C]">
              Shipping Method
            </h2>
            <div className="rounded border border-[#E5E5E5] bg-[#F9F9F9] px-4 py-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#191A1C]">Standard</span>
                <span className="text-xs text-[#777777]">2-3 Business Days</span>
              </div>
              <span className={`text-sm font-semibold ${isFreeShippingEligible ? "text-green-600" : "text-[#191A1C]"}`}>
                {isFreeShippingEligible ? "FREE" : formatPrice(shippingConfig.baseFee)}
              </span>
            </div>
          </section>
        </div>

        {/* Column 2: Payment */}
        <div className="lg:col-span-4 p-6 md:p-8 lg:border-r lg:border-[#E5E5E5]">
          <section className="mb-6">
            <h2 className="font-oswald text-xl font-medium uppercase tracking-wide text-[#191A1C]">
              Payment
            </h2>
            <p className="text-xs text-[#777777] mb-4">All transactions are secure and encrypted.</p>

            <div className="rounded border border-[#D9D9D9] overflow-hidden bg-white">
              <div className="bg-[#FFF5F5] border-b border-[#D9D9D9]">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <CreditCard className="h-4 w-4 text-[#f97316]" />
                  <span className="flex-1 text-sm font-medium text-[#191A1C]">Credit Card</span>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className="text-[9px] font-bold text-blue-800 border border-blue-800 px-1 rounded-sm bg-white">VISA</span>
                    <span className="text-[9px] font-bold text-orange-600 border border-orange-600 px-1 rounded-sm bg-white">MC</span>
                    <span className="text-[9px] font-bold text-blue-500 border border-blue-500 px-1 rounded-sm bg-white">AMEX</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 space-y-3">
                <div>
                  <label className="text-xs text-[#777777] mb-1 block">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                    className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#777777] mb-1 block">Expiry Date</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                      className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#777777] mb-1 block">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="***"
                      value={card.cvv}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      maxLength={4}
                      className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#777777] mb-1 block">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    className="w-full rounded border border-[#D9D9D9] px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#777777] mt-4 leading-normal">
              This is a simulated payment for academic demonstration purposes. No real charges will be made.
            </p>
          </section>

          <button
            type="button"
            onClick={handlePayNow}
            disabled={submitting}
            className="w-full rounded bg-[#f97316] py-4 font-oswald text-base font-medium tracking-widest text-white transition-colors hover:bg-[#ea580c] focus:outline-none uppercase disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Pay Now"}
          </button>

          <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-[#777777] underline">
            <span className="cursor-pointer hover:text-black">Privacy Policy</span>
            <span className="cursor-pointer hover:text-black">Refund Policy</span>
            <span className="cursor-pointer hover:text-black">Terms of service</span>
            <span className="cursor-pointer hover:text-black">Contact</span>
          </div>
        </div>

        {/* Column 3: Order Summary */}
        <div className="lg:col-span-4 bg-[#FDFDFD] p-6 md:p-8">
          <h2 className="mb-6 font-oswald text-xl font-medium uppercase tracking-wide text-[#191A1C]">
            Order Summary
          </h2>

          <div className="mb-6 max-h-[400px] overflow-y-auto space-y-4 pr-1">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 rounded border border-[#E5E5E5] bg-white p-1">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-300">IMG</div>
                  )}
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-oswald text-sm font-medium uppercase leading-tight text-[#191A1C] truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#777777] mt-0.5">{item.optionSignature}</p>
                </div>
                <span className="text-sm font-semibold text-[#191A1C] whitespace-nowrap">
                  {formatPrice(item.priceMinor * item.quantity)}
                </span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-[#777777] italic py-4">No items currently active in session.</p>
            )}
          </div>

          <div className="mb-6 flex gap-2 border-t border-[#E5E5E5] pt-4">
            <input
              type="text"
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 rounded border border-[#D9D9D9] px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              type="button"
              className="rounded border border-[#D9D9D9] bg-white px-4 py-2 font-oswald text-xs uppercase text-[#191A1C] transition-colors hover:bg-gray-50"
            >
              Apply
            </button>
          </div>

          <div className="border-t border-[#E5E5E5] pt-4 space-y-2.5">
            <div className="flex justify-between text-sm text-[#777777]">
              <span>Subtotal</span>
              <span className="font-medium text-[#191A1C]">{formatPrice(subtotalMinor)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#777777]">
              <span>Shipping</span>
              <span className={`font-medium ${shippingMinor === 0 ? "text-green-600 uppercase font-bold" : "text-[#191A1C]"}`}>
                {shippingMinor === 0 ? "FREE" : formatPrice(shippingMinor)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-[#777777]">
              <span>Discount</span>
              <span className="font-medium text-green-600">- {formatPrice(discountMinor)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E5E5E5] pt-3 font-oswald text-xl font-semibold text-[#191A1C]">
              <span>Total</span>
              <span className="text-xl">{formatPrice(grandTotalMinor)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
