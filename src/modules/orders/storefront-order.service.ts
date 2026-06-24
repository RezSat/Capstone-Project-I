import { eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { orders, orderItems, inventoryItems, productVariants, products } from "@/core/db/schema";

type StorefrontTransaction = Parameters<typeof db.transaction>[0] extends (
  tx: infer T
) => Promise<unknown>
  ? T
  : never;

export interface RawOrderItemInput {
  variantId: string;
  quantity: number;
  priceMinor: number;
  name: string;
  optionSignature: string;
}

export interface CreateStorefrontOrderInput {
  orderNumber: string;
  subtotalMinor: number;
  grandTotalMinor: number;
  customerEmail: string;
  customerPhone: string;
  billingDetails: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode?: string;
    phone: string;
  };
  items: RawOrderItemInput[];
  paymentProvider?: string;
}

interface EnrichedItem {
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  sku: string | null;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

async function enrichItem(tx: StorefrontTransaction, item: RawOrderItemInput): Promise<EnrichedItem> {
  const [variant] = await tx.select({
    id: productVariants.id,
    productId: productVariants.productId,
    title: productVariants.title,
    sku: productVariants.sku,
  }).from(productVariants).where(eq(productVariants.id, item.variantId));

  if (!variant) throw new Error(`Variant not found: ${item.variantId}`);

  const [product] = await tx.select({ name: products.name })
    .from(products).where(eq(products.id, variant.productId));

  if (!product) throw new Error(`Product not found for variant: ${item.variantId}`);

  return {
    variantId: item.variantId,
    productId: variant.productId,
    productName: product.name,
    variantTitle: variant.title,
    sku: variant.sku,
    quantity: item.quantity,
    unitPriceMinor: item.priceMinor,
    lineTotalMinor: item.priceMinor * item.quantity,
  };
}

export async function createStorefrontOrder(
  input: CreateStorefrontOrderInput
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        orderNumber: input.orderNumber,
        source: "online",
        status: "pending_payment",
        paymentStatus: "unpaid",
        subtotalMinor: input.subtotalMinor,
        grandTotalMinor: input.grandTotalMinor,
        customerEmailSnapshot: input.customerEmail,
        customerPhoneSnapshot: input.customerPhone,
        billingDetailsSnapshot: {
          firstName: input.billingDetails.firstName,
          lastName: input.billingDetails.lastName,
          address: input.billingDetails.address,
          apartment: input.billingDetails.apartment,
          city: input.billingDetails.city,
          postalCode: input.billingDetails.postalCode,
          phone: input.billingDetails.phone,
        },
        metadata: input.paymentProvider ? { paymentProvider: input.paymentProvider } : {},
      }).returning();

      if (!newOrder) throw new Error("Failed to create order");

      const enrichedItems: EnrichedItem[] = [];
      for (const item of input.items) {
        enrichedItems.push(await enrichItem(tx, item));
      }

      for (const item of enrichedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.productName,
          variantTitleSnapshot: item.variantTitle,
          skuSnapshot: item.sku,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          lineTotalMinor: item.lineTotalMinor,
        });

        const [inventory] = await tx.select()
          .from(inventoryItems).where(eq(inventoryItems.variantId, item.variantId))
          .for("update");

        if (inventory) {
          await tx.update(inventoryItems).set({
            quantityReserved: inventory.quantityReserved + item.quantity,
            updatedAt: new Date(),
          }).where(eq(inventoryItems.id, inventory.id));
        }
      }

      return newOrder;
    });

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error("[CREATE STOREFRONT ORDER ERROR]", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create order" };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
}

export async function releaseInventoryOnCancel(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    if (items.length === 0) {
      console.log(`[RELEASE INVENTORY] No items found for order ${orderId}`);
      return { success: true };
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        if (!item.variantId) {
          console.log(`[RELEASE INVENTORY] Skipping item ${item.id} - no variantId`);
          continue;
        }

        const [inventory] = await tx.select()
          .from(inventoryItems).where(eq(inventoryItems.variantId, item.variantId))
          .for("update");

        if (inventory) {
          const releaseQty = Math.min(item.quantity, inventory.quantityReserved);
          if (releaseQty > 0) {
            await tx.update(inventoryItems).set({
              quantityReserved: Math.max(0, inventory.quantityReserved - releaseQty),
              updatedAt: new Date(),
            }).where(eq(inventoryItems.id, inventory.id));
            console.log(`[INVENTORY RELEASED]: Released ${releaseQty} units for variant ${item.variantId} from Order ${orderId}`);
          } else {
            console.log(`[RELEASE INVENTORY] No reserved stock to release for variant ${item.variantId}`);
          }
        } else {
          console.log(`[RELEASE INVENTORY] No inventory found for variant ${item.variantId}`);
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("[RELEASE INVENTORY ERROR]", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to release inventory" };
  }
}