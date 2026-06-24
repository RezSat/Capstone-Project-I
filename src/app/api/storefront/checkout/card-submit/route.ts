import { NextResponse } from "next/server"
import { createStorefrontOrder } from "@/modules/orders/storefront-order.service"
import { db } from "@/core/db/client"
import { orders } from "@/core/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const cardSubmitSchema = z.object({
  grandTotalMinor: z.number().int().nonnegative(),
  customerEmail: z.string().email(),
  billingDetails: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    apartment: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().optional(),
    phone: z.string().min(1),
  }),
  card: z.object({
    number: z.string(),
    expiry: z.string(),
    cvv: z.string(),
    name: z.string().min(1),
  }),
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive(),
    priceMinor: z.number().int().nonnegative(),
    name: z.string(),
    optionSignature: z.string(),
  })).optional(),
})

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "")
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

function validateExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = parseInt(match[1], 10)
  const year = parseInt(match[2], 10)
  if (month < 1 || month > 12) return false
  const now = new Date()
  const expDate = new Date(2000 + year, month)
  return expDate > now
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = cardSubmitSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { grandTotalMinor, customerEmail, billingDetails, card, items } = parsed.data

    if (!luhnCheck(card.number)) {
      return Response.json({ error: "Invalid card number" }, { status: 400 })
    }
    if (!validateExpiry(card.expiry)) {
      return Response.json({ error: "Invalid or expired card" }, { status: 400 })
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      return Response.json({ error: "Invalid CVV" }, { status: 400 })
    }

    const orderRef = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const email = customerEmail.trim()

    const orderResult = await createStorefrontOrder({
      orderNumber: orderRef,
      subtotalMinor: grandTotalMinor,
      grandTotalMinor: grandTotalMinor,
      customerEmail: email,
      customerPhone: billingDetails.phone,
      billingDetails: {
        firstName: billingDetails.firstName.trim(),
        lastName: billingDetails.lastName.trim(),
        address: billingDetails.address,
        apartment: billingDetails.apartment,
        city: billingDetails.city,
        postalCode: billingDetails.postalCode,
        phone: billingDetails.phone,
      },
      items: items || [],
      paymentProvider: "card",
    })

    if (!orderResult.success) {
      return Response.json({ error: orderResult.error }, { status: 500 })
    }

    const delay = 2000 + Math.random() * 3000
    await new Promise((r) => setTimeout(r, delay))

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderRef),
    })

    const existingMetadata = (existingOrder?.metadata as Record<string, unknown>) || {}

    await db
      .update(orders)
      .set({
        status: "staged",
        paymentStatus: "paid",
        paidAt: new Date(),
        metadata: {
          ...existingMetadata,
          transactionId,
          paymentProvider: "card",
          cardLast4: card.number.replace(/\D/g, "").slice(-4),
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.orderNumber, orderRef))

    return NextResponse.json({
      success: true,
      orderRef,
      transactionId,
    })
  } catch (error) {
    console.error("[CARD SUBMIT ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment processing failed" },
      { status: 500 }
    )
  }
}
