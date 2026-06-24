import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/core/db/client";
import { orders, users, customerProfiles, customerAddresses, payments } from "@/core/db/schema";
import { inArray } from "drizzle-orm";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/modules/auth/session-token";

export async function GET(request: Request) {
  try {
    console.log("[ACCOUNT-API] === /api/account/details called ===");
    const cookieHeader = request.headers.get("cookie") || "";
    console.log("[ACCOUNT-API] Raw cookie header length:", cookieHeader.length, "preview:", cookieHeader.substring(0, 200));

    const cookie = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );

    const sessionToken = cookie[SESSION_COOKIE_NAME];
    console.log("[ACCOUNT-API] storefront_session cookie present:", !!sessionToken, sessionToken ? `len=${sessionToken.length}` : "");

    if (!sessionToken) {
      console.log("[ACCOUNT-API] No session cookie found - returning 401 Not authenticated");
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    console.log("[ACCOUNT-API] Attempting to verify session token...");
    const session = verifySessionToken(sessionToken);
    console.log("[ACCOUNT-API] verifySessionToken result:", session ? "VALID" : "NULL");

    if (!session) {
      console.log("[ACCOUNT-API] Token verification failed - returning 401 Session expired");
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }

    console.log("[ACCOUNT-API] Session verified. userId:", session.userId, "email:", session.email, "accountStatus:", session.accountStatus);

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: {
        id: true,
        email: true,
        accountStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const profile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.userId, user.id),
    });

    const userOrders = profile
      ? await db.query.orders.findMany({
          where: eq(orders.customerId, profile.id),
          columns: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
            grandTotalMinor: true,
            currencyCode: true,
          },
          orderBy: [desc(orders.createdAt)],
        })
      : [];

    const paymentMap: Record<string, string> = {};
    if (userOrders.length > 0) {
      const orderIds = userOrders.map((o) => o.id);
      const orderPayments = await db.query.payments.findMany({
        where: inArray(payments.orderId, orderIds),
        columns: { orderId: true, provider: true },
      });
      for (const p of orderPayments) {
        if (!paymentMap[p.orderId]) paymentMap[p.orderId] = p.provider;
      }
    }

    const addresses = profile
      ? await db.query.customerAddresses.findMany({
          where: eq(customerAddresses.customerId, profile.id),
          columns: {
            id: true,
            type: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            district: true,
            province: true,
            postalCode: true,
            countryCode: true,
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
        })
      : [];

    const defaultShipping = addresses.find((a) => a.isDefaultShipping) || addresses[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          accountStatus: user.accountStatus,
        },
        profile: profile
          ? {
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              displayName: profile.displayName,
              phone: profile.phone,
            }
          : null,
        orders: userOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          status: o.status,
          paymentStatus: o.paymentStatus,
          grandTotalMinor: o.grandTotalMinor,
          currencyCode: o.currencyCode,
          paymentMethod: paymentMap[o.id] || "unknown",
        })),
        addresses,
        defaultShipping,
      },
    });
  } catch (error) {
    console.error("[account/details] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
