import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { orders, users, customerProfiles, customerAddresses } from "../../core/db/schema";
import { createSessionToken } from "./session-token";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildCustomerNumber() {
  return `CUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

type AutoLoginResult = {
  success: boolean;
  userId?: string;
  customerId?: string;
  sessionToken?: string;
  hasPassword?: boolean;
  error?: string;
};

export async function autoLoginFromCheckout(orderNumber: string): Promise<AutoLoginResult> {
  console.log("[AUTO-LOGIN-SERVICE] Looking up order:", orderNumber);
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
  });

  if (!order) {
    console.error("[AUTO-LOGIN-SERVICE] Order not found:", orderNumber);
    return { success: false, error: "Order not found" };
  }

  console.log("[AUTO-LOGIN-SERVICE] Order found. id:", order.id, "email:", order.customerEmailSnapshot, "customerId:", order.customerId);
  const email = order.customerEmailSnapshot;
  if (!email) {
    return { success: false, error: "Order has no customer email" };
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.normalizedEmail, normalizedEmail),
  });

  console.log("[AUTO-LOGIN-SERVICE] Existing user:", existingUser ? `id=${existingUser.id}` : "NOT FOUND");

  if (existingUser) {
    const existingProfile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.userId, existingUser.id),
    });

    if (order.customerId !== existingProfile?.id) {
      await db
        .update(orders)
        .set({ customerId: existingProfile?.id ?? null })
        .where(eq(orders.id, order.id));
    }

    const sessionToken = createSessionToken({
      userId: existingUser.id,
      email: existingUser.email,
      accountStatus: existingUser.accountStatus ?? "incomplete",
    });

    console.log("[AUTO-LOGIN-SERVICE] Returning session token for existing user. accountStatus:", existingUser.accountStatus ?? "incomplete");
    return {
      success: true,
      userId: existingUser.id,
      customerId: existingProfile?.id,
      sessionToken,
      hasPassword: !!existingUser.passwordHash,
    };
  }

  const billing = order.billingDetailsSnapshot;
  const ghostUser = await db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        email: normalizedEmail,
        normalizedEmail,
        phone: billing.phone ?? null,
        accountType: "customer",
        status: "active",
        accountStatus: "incomplete",
        metadata: { source: "checkout_ghost", orderNumber },
      })
      .returning();

    const [createdProfile] = await tx
      .insert(customerProfiles)
      .values({
        userId: createdUser.id,
        customerNumber: buildCustomerNumber(),
        firstName: billing.firstName ?? null,
        lastName: billing.lastName ?? null,
        displayName: `${billing.firstName ?? ""} ${billing.lastName ?? ""}`.trim() || normalizedEmail,
        phone: billing.phone ?? null,
        metadata: { source: "checkout_ghost" },
      })
      .returning();

    if (billing.address) {
      await tx.insert(customerAddresses).values({
        customerId: createdProfile.id,
        type: "shipping",
        fullName: `${billing.firstName ?? ""} ${billing.lastName ?? ""}`.trim(),
        phone: billing.phone ?? "",
        addressLine1: billing.address,
        addressLine2: billing.apartment ?? null,
        city: billing.city ?? "",
        district: billing.district ?? null,
        province: billing.province ?? null,
        postalCode: billing.postalCode ?? null,
        countryCode: "LK",
        isDefaultShipping: true,
        isDefaultBilling: true,
      });
    }

    await tx
      .update(orders)
      .set({ customerId: createdProfile.id })
      .where(eq(orders.id, order.id));

    return { user: createdUser, profile: createdProfile };
  });

  const sessionToken = createSessionToken({
    userId: ghostUser.user.id,
    email: ghostUser.user.email,
    accountStatus: ghostUser.user.accountStatus ?? "incomplete",
  });

  return {
    success: true,
    userId: ghostUser.user.id,
    customerId: ghostUser.profile.id,
    sessionToken,
    hasPassword: false,
  };
}
