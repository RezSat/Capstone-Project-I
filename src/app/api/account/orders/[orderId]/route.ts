import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/core/db/client";
import {
  orders,
  orderItems,
  payments,
  customerProfiles,
  productMedia,
  productImages,
  files,
} from "@/core/db/schema";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/modules/auth/session-token";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const cookieHeader = _request.headers.get("cookie") || "";
    const cookie = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );
    const sessionToken = cookie[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    const session = verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session expired" },
        { status: 401 }
      );
    }

    // Look up customer profile from userId
    const profile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.userId, session.userId),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Customer profile not found" },
        { status: 404 }
      );
    }

    // Fetch order belonging to user
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.customerId, profile.id)
      ),
      columns: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        grandTotalMinor: true,
        subtotalMinor: true,
        taxTotalMinor: true,
        shippingTotalMinor: true,
        discountTotalMinor: true,
        currencyCode: true,
        notes: true,
        billingDetailsSnapshot: true,
        metadata: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch order items
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId),
      columns: {
        id: true,
        productId: true,
        variantId: true,
        productNameSnapshot: true,
        variantTitleSnapshot: true,
        skuSnapshot: true,
        quantity: true,
        unitPriceMinor: true,
        lineTotalMinor: true,
        discountTotalMinor: true,
        taxTotalMinor: true,
      },
    });

    // Fetch images for each item
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        let imageSrc: string | null = null;

        if (item.productId) {
          // Try product_images first (legacy/WooCommerce)
          const legacyImage = await db.query.productImages.findFirst({
            where: eq(productImages.productId, item.productId),
            columns: { src: true },
          });
          if (legacyImage?.src) {
            imageSrc = legacyImage.src;
          }

          // Try product_media -> files
          if (!imageSrc) {
            const media = await db.query.productMedia.findFirst({
              where: eq(productMedia.productId, item.productId),
              columns: { fileId: true },
            });
            if (media?.fileId) {
              const file = await db.query.files.findFirst({
                where: eq(files.id, media.fileId),
                columns: { publicUrl: true, storageKey: true },
              });
              imageSrc = file?.publicUrl || null;
            }
          }
        }

        return { ...item, imageSrc };
      })
    );

    // Fetch payment info
    const orderPayments = await db.query.payments.findMany({
      where: eq(payments.orderId, orderId),
      columns: {
        provider: true,
        methodType: true,
        amountMinor: true,
        status: true,
        createdAt: true,
      },
      orderBy: [desc(payments.createdAt)],
    });

    // Extract payment method from metadata (fallback)
    const meta = (order.metadata || {}) as Record<string, unknown>;
    const paymentProviderMeta = meta.gateway as string | undefined;

    const paymentMethod =
      orderPayments.length > 0
        ? orderPayments[0].provider
        : paymentProviderMeta || "unknown";

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        paymentMethod,
        items: itemsWithImages,
      },
    });
  } catch (error) {
    console.error("[account/order-detail] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
