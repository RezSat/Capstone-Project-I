import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { orders, users } from "@/core/db/schema";

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json({ success: false, error: "Missing order reference" }, { status: 400 });
    }

    console.log("🔍 [AUDIT SERVER] Incoming order reference lookup:", { ref });

    let order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, ref),
    });

    console.log("🔍 [AUDIT SERVER] Database Order Record Found:", {
      id: order?.id,
      customerEmail: order?.customerEmailSnapshot,
      paymentStatus: order?.paymentStatus,
      status: order?.status,
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "pending" || order.status === "pending_payment") {
      await wait(400);
      order = (await db.query.orders.findFirst({ where: eq(orders.orderNumber, ref) })) ?? order;
    }

    const email = order.customerEmailSnapshot;
    let accountExists = false;

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await db.query.users.findFirst({
        where: eq(users.normalizedEmail, normalizedEmail),
      });
      accountExists = !!existingUser;
    }

    console.log("🔍 [AUDIT SERVER] Account Check Result:", {
      emailChecked: email ?? "null",
      normalizedEmail: email?.trim().toLowerCase(),
      accountExists,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        customerEmail: email,
        accountExists,
        paymentStatus: order.paymentStatus,
        grandTotalMinor: order.grandTotalMinor,
        currencyCode: order.currencyCode,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("orders/lookup error:", err);
    return NextResponse.json({ success: false, error: "Lookup failed" }, { status: 500 });
  }
}