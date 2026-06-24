import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { roles, staffProfiles, userAuthIdentities, users } from "../../core/db/schema";
import type { DashboardUserRole } from "../../core/auth/rbac-permissions";

export type UserSearchParams = {
  search?: string;
  roleFilter?: "all" | DashboardUserRole;
  activeFilter?: "all" | "active" | "inactive";
  sort?: string;
  page?: number;
  pageSize?: number;
};

type DashboardRepoUser = {
  id: string;
  userId: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const DASHBOARD_ROLES: DashboardUserRole[] = ["super_admin", "admin", "operator", "viewer"];

async function listBaseDashboardUsers(): Promise<DashboardRepoUser[]> {
  const rows = await db
    .select({
      id: staffProfiles.id,
      userId: users.id,
      email: users.email,
      role: roles.key,
      status: staffProfiles.status,
      createdAt: staffProfiles.createdAt,
      updatedAt: staffProfiles.updatedAt,
    })
    .from(staffProfiles)
    .innerJoin(users, eq(staffProfiles.userId, users.id))
    .innerJoin(roles, eq(staffProfiles.roleId, roles.id));

  return rows
    .filter((row) => DASHBOARD_ROLES.includes(row.role as DashboardUserRole))
    .map((row) => ({
      id: row.id,
      userId: row.userId,
      email: row.email,
      role: row.role as DashboardUserRole,
      isActive: row.status === "active",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
}

export async function findDashboardUserByAuthUserId(authUserId: string) {
  const identity = await db.query.userAuthIdentities.findFirst({ where: eq(userAuthIdentities.providerUserId, authUserId) });
  if (!identity) return undefined;
  return (await listBaseDashboardUsers()).find((item) => item.userId === identity.userId);
}

export async function findDashboardUserByEmail(email: string) {
  return (await listBaseDashboardUsers()).find((item) => item.email.toLowerCase() === email.toLowerCase());
}

export async function findDashboardUserById(id: string) {
  return (await listBaseDashboardUsers()).find((item) => item.id === id);
}

export async function listDashboardUsers() {
  return listBaseDashboardUsers();
}

export async function searchDashboardUsersPaginated(params: UserSearchParams) {
  const { search, roleFilter = "all", activeFilter = "all", sort, page = 1, pageSize = 20 } = params;
  let items = await listBaseDashboardUsers();
  if (search?.trim()) items = items.filter((item) => item.email.toLowerCase().includes(search.trim().toLowerCase()));
  if (roleFilter !== "all") items = items.filter((item) => item.role === roleFilter);
  if (activeFilter !== "all") items = items.filter((item) => item.isActive === (activeFilter === "active"));
  const factor = sort?.startsWith("-") ? -1 : 1;
  const field = sort?.replace("-", "") ?? "createdAt";
  items.sort((a, b) => {
    const av = field === "email" ? a.email : field === "role" ? a.role : a.createdAt.toISOString();
    const bv = field === "email" ? b.email : field === "role" ? b.role : b.createdAt.toISOString();
    return av.localeCompare(bv) * factor;
  });
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  return { items: items.slice(offset, offset + pageSize), total, page, pageSize, totalPages };
}

export async function createDashboardUser(input: { authUserId: string; email: string; role: DashboardUserRole; fullName: string; phone?: string }): Promise<DashboardRepoUser[]> {
  const roleRow = await db.query.roles.findFirst({ where: eq(roles.key, input.role) });
  if (!roleRow) throw new Error("Role not found");
  return db.transaction(async (tx) => {
    const [createdUser] = await tx.insert(users).values({
      email: input.email,
      normalizedEmail: input.email.toLowerCase(),
      phone: input.phone?.trim() || null,
      accountType: "staff",
      status: "active",
      metadata: {},
    }).returning({ id: users.id, createdAt: users.createdAt, updatedAt: users.updatedAt });
    await tx.insert(userAuthIdentities).values({ userId: createdUser.id, provider: "credentials", providerUserId: input.authUserId });
    const [createdStaff] = await tx.insert(staffProfiles).values({
      userId: createdUser.id,
      staffNumber: `STAFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      roleId: roleRow.id,
      fullName: input.fullName,
      status: "active",
      metadata: {},
    }).returning({ id: staffProfiles.id, createdAt: staffProfiles.createdAt, updatedAt: staffProfiles.updatedAt });
    return [{ id: createdStaff.id, userId: createdUser.id, email: input.email, role: input.role, isActive: true, createdAt: createdStaff.createdAt, updatedAt: createdStaff.updatedAt }];
  });
}

export async function updateDashboardUserRole(userId: string, role: DashboardUserRole) {
  const roleRow = await db.query.roles.findFirst({ where: eq(roles.key, role) });
  if (!roleRow) throw new Error("Role not found");
  await db.update(staffProfiles).set({ roleId: roleRow.id, updatedAt: new Date() }).where(eq(staffProfiles.id, userId));
  const updated = await findDashboardUserById(userId);
  return updated ? [updated] : [];
}

export async function toggleDashboardUserActive(userId: string, isActive: boolean) {
  const existing = await findDashboardUserById(userId);
  if (!existing?.userId) return [];
  await db.update(staffProfiles).set({ status: isActive ? "active" : "disabled", updatedAt: new Date() }).where(eq(staffProfiles.id, userId));
  await db.update(users).set({ status: isActive ? "active" : "disabled", updatedAt: new Date() }).where(eq(users.id, existing.userId));
  const updated = await findDashboardUserById(userId);
  return updated ? [updated] : [];
}
