import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { roles, staffProfiles, userStatusEnum, users } from "../../core/db/schema";

type UserStatus = (typeof userStatusEnum.enumValues)[number];

type CreateStaffUserProfileInput = {
  email: string;
  fullName: string;
  roleKey: string;
  phone?: string | null;
  status?: "active" | "disabled" | "invited";
  createdByUserId?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildStaffNumber() {
  return `STAFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function getStaffProfileByUserId(userId: string) {
  return db.query.staffProfiles.findFirst({ where: eq(staffProfiles.userId, userId) });
}

export async function getStaffWithRoleByUserId(userId: string) {
  const [item] = await db
    .select({ user: users, staff: staffProfiles, role: roles })
    .from(staffProfiles)
    .innerJoin(users, eq(staffProfiles.userId, users.id))
    .innerJoin(roles, eq(staffProfiles.roleId, roles.id))
    .where(eq(staffProfiles.userId, userId));
  return item;
}

export function listStaffUsers() {
  return db
    .select({ user: users, staff: staffProfiles, role: roles })
    .from(staffProfiles)
    .innerJoin(users, eq(staffProfiles.userId, users.id))
    .innerJoin(roles, eq(staffProfiles.roleId, roles.id));
}

export async function createStaffUserProfile(input: CreateStaffUserProfileInput) {
  const role = await db.query.roles.findFirst({ where: eq(roles.key, input.roleKey) });
  if (!role) throw new Error("Role not found");
  const email = normalizeEmail(input.email);
  return db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        email,
        normalizedEmail: email,
        phone: input.phone ?? null,
        accountType: "staff",
        status: (input.status === "active" ? "active" : input.status === "disabled" ? "disabled" : "invited") as UserStatus,
        metadata: {},
      })
      .returning();
    await tx.insert(staffProfiles).values({
      userId: createdUser.id,
      staffNumber: buildStaffNumber(),
      roleId: role.id,
      fullName: input.fullName,
      phone: input.phone ?? null,
      status: input.status ?? "invited",
      createdByUserId: input.createdByUserId,
      metadata: {},
    });
    return getStaffWithRoleByUserId(createdUser.id);
  });
}

export async function updateStaffRole(userId: string, roleKey: string) {
  const role = await db.query.roles.findFirst({ where: eq(roles.key, roleKey) });
  if (!role) throw new Error("Role not found");
  await db.update(staffProfiles).set({ roleId: role.id, updatedAt: new Date() }).where(eq(staffProfiles.userId, userId));
  return getStaffWithRoleByUserId(userId);
}

export async function setStaffActiveStatus(userId: string, isActive: boolean) {
  const userStatus: UserStatus = isActive ? "active" : "disabled";
  const staffStatus = isActive ? "active" : "disabled";
  await db.transaction(async (tx) => {
    await tx.update(users).set({ status: userStatus, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx.update(staffProfiles).set({ status: staffStatus, updatedAt: new Date() }).where(eq(staffProfiles.userId, userId));
  });
  return getStaffWithRoleByUserId(userId);
}
