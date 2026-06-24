import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/core/db/client"
import { users, customerProfiles, customerAddresses } from "@/core/db/schema"
import { createSessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token"
import { z } from "zod"
import { createHash } from "node:crypto"

const saveGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
})

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildCustomerNumber() {
  return `CUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    console.log("[SAVE-GUEST] === save-guest-user called ===");
    const body = await request.json()
    const parsed = saveGuestSchema.safeParse(body)

    if (!parsed.success) {
      console.error("[SAVE-GUEST] Validation failed:", parsed.error.flatten());
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone, address, apartment, city, postalCode } = parsed.data
    const normalizedEmail = normalizeEmail(email)
    console.log("[SAVE-GUEST] Processing for email:", normalizedEmail);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.normalizedEmail, normalizedEmail),
    })

    let userId: string
    let customerId: string

    if (existingUser) {
      userId = existingUser.id

      const existingProfile = await db.query.customerProfiles.findFirst({
        where: eq(customerProfiles.userId, existingUser.id),
      })
      customerId = existingProfile?.id ?? ""

      if (existingProfile) {
        await db
          .update(customerProfiles)
          .set({
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`.trim(),
            phone,
            updatedAt: new Date(),
          })
          .where(eq(customerProfiles.id, existingProfile.id))
      }

      if (address && existingProfile) {
        const existingAddr = await db.query.customerAddresses.findFirst({
          where: eq(customerAddresses.customerId, existingProfile.id),
        })

        if (existingAddr) {
          await db
            .update(customerAddresses)
            .set({
              fullName: `${firstName} ${lastName}`.trim(),
              phone,
              addressLine1: address,
              addressLine2: apartment,
              city: city ?? "",
              postalCode: postalCode ?? null,
              updatedAt: new Date(),
            })
            .where(eq(customerAddresses.id, existingAddr.id))
        } else {
          await db.insert(customerAddresses).values({
            customerId: existingProfile.id,
            type: "shipping",
            fullName: `${firstName} ${lastName}`.trim(),
            phone,
            addressLine1: address,
            addressLine2: apartment,
            city: city ?? "",
            postalCode: postalCode ?? null,
            countryCode: "LK",
            isDefaultShipping: true,
            isDefaultBilling: true,
          })
        }
      }

      if (existingProfile) {
        const { orders } = await import("@/core/db/schema");
        await db
          .update(orders)
          .set({ customerId: existingProfile.id })
          .where(eq(orders.customerEmailSnapshot, normalizedEmail));
      }
    } else {
      const dummyPassword = `guest_${Date.now()}_${Math.random().toString(36)}`
      const passwordHash = hashPassword(dummyPassword)

      const [createdUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          normalizedEmail,
          phone,
          accountType: "customer",
          status: "active",
          passwordHash,
          metadata: { source: "checkout_guest_early" },
        })
        .returning()

      userId = createdUser.id

      const [createdProfile] = await db
        .insert(customerProfiles)
        .values({
          userId: createdUser.id,
          customerNumber: buildCustomerNumber(),
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`.trim(),
          phone,
          metadata: { source: "checkout_guest_early" },
        })
        .returning()

      customerId = createdProfile.id

      if (address) {
        await db.insert(customerAddresses).values({
          customerId: createdProfile.id,
          type: "shipping",
          fullName: `${firstName} ${lastName}`.trim(),
          phone,
          addressLine1: address,
          addressLine2: apartment,
          city: city ?? "",
          postalCode: postalCode ?? null,
          countryCode: "LK",
          isDefaultShipping: true,
          isDefaultBilling: true,
        })
      }

      const { orders } = await import("@/core/db/schema");
      await db
        .update(orders)
        .set({ customerId: createdProfile.id })
        .where(eq(orders.customerEmailSnapshot, normalizedEmail));
    }

    const userForSession = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { accountStatus: true },
    })

    console.log("[SAVE-GUEST] User accountStatus:", userForSession?.accountStatus);

    const sessionToken = createSessionToken({
      userId,
      email: normalizedEmail,
      accountStatus: userForSession?.accountStatus ?? "incomplete",
    })

    console.log("[SAVE-GUEST] Session token created, length:", sessionToken.length);
    console.log("[SAVE-GUEST] NODE_ENV:", process.env.NODE_ENV);

    const response = NextResponse.json({
      success: true,
      data: { userId, customerId },
    })

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    console.log("[SAVE-GUEST] Cookie set on response. Set-Cookie header:", response.headers.get("Set-Cookie")?.substring(0, 100));

    return response

  } catch (error) {
    console.error("[save-guest-user] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}