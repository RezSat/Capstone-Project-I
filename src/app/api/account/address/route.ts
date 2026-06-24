import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/core/db/client";
import { customerAddresses } from "@/core/db/schema";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

const updateAddressSchema = z.object({
  addressId: z.string().uuid(),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().nullish(),
  city: z.string().min(1).optional(),
  postalCode: z.string().nullish(),
});

export async function PUT(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookie = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );
    const sessionToken = cookie[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    const session = verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const existing = await db.query.customerAddresses.findFirst({
      where: eq(customerAddresses.id, parsed.data.addressId),
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.fullName !== undefined) updateData.fullName = parsed.data.fullName;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    if (parsed.data.addressLine1 !== undefined) updateData.addressLine1 = parsed.data.addressLine1;
    if (parsed.data.addressLine2 !== undefined) updateData.addressLine2 = parsed.data.addressLine2 ?? null;
    if (parsed.data.city !== undefined) updateData.city = parsed.data.city;
    if (parsed.data.postalCode !== undefined) updateData.postalCode = parsed.data.postalCode ?? null;

    await db.update(customerAddresses).set(updateData).where(eq(customerAddresses.id, parsed.data.addressId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[account/address] Error:", error);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
