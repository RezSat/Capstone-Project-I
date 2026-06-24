import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { customerProfiles, userAuthIdentities, users } from "../../core/db/schema";

type CreateCustomerUserInput = {
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
};

type CreateCustomerUserWithIdentityInput = CreateCustomerUserInput & {
  authUserId: string;
};

type UpdateCustomerProfileInput = {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  marketingOptIn?: boolean;
  recommendationOptIn?: boolean;
  notes?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildCustomerNumber() {
  return `CUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function findUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.normalizedEmail, normalizeEmail(email)) });
}

export async function findUserByAuthUserId(providerUserId: string) {
  const identity = await db.query.userAuthIdentities.findFirst({
    where: eq(userAuthIdentities.providerUserId, providerUserId),
  });
  if (!identity) return null;
  return db.query.users.findFirst({ where: eq(users.id, identity.userId) });
}

export async function createCustomerUser(input: CreateCustomerUserInput) {
  const email = normalizeEmail(input.email);
  return db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        email,
        normalizedEmail: email,
        phone: input.phone ?? null,
        accountType: "customer",
        status: "pending_verification",
        metadata: {},
      })
      .returning();
    const [createdProfile] = await tx
      .insert(customerProfiles)
      .values({
        userId: createdUser.id,
        customerNumber: buildCustomerNumber(),
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        displayName: input.displayName ?? null,
        phone: input.phone ?? null,
        metadata: {},
      })
      .returning();
    return { user: createdUser, customerProfile: createdProfile };
  });
}

export async function createCustomerUserWithIdentity(input: CreateCustomerUserWithIdentityInput) {
  const email = normalizeEmail(input.email);
  return db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        email,
        normalizedEmail: email,
        phone: input.phone ?? null,
        accountType: "customer",
        status: "active",
        metadata: {},
      })
      .returning();
    await tx.insert(userAuthIdentities).values({
      userId: createdUser.id,
      provider: "credentials",
      providerUserId: input.authUserId,
    });
    const [createdProfile] = await tx
      .insert(customerProfiles)
      .values({
        userId: createdUser.id,
        customerNumber: buildCustomerNumber(),
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        displayName: input.displayName ?? null,
        phone: input.phone ?? null,
        metadata: {},
      })
      .returning();
    return { user: createdUser, customerProfile: createdProfile };
  });
}

export function getCustomerProfileByUserId(userId: string) {
  return db.query.customerProfiles.findFirst({ where: eq(customerProfiles.userId, userId) });
}

export async function updateCustomerProfile(userId: string, input: UpdateCustomerProfileInput) {
  const [updated] = await db
    .update(customerProfiles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(customerProfiles.userId, userId))
    .returning();
  return updated;
}
