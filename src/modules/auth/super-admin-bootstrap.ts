import { eq, sql } from "drizzle-orm";
import { dashboardAuth } from "../../core/auth/better-auth";
import { db } from "../../core/db/client";
import { permissions, rolePermissions, roles, staffProfiles, userAuthIdentities, users } from "../../core/db/schema";
import { REQUIRED_PERMISSIONS, REQUIRED_ROLES } from "./super-admin-bootstrap.config";

export type BootstrapInput = { email: string; password: string; fullName: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildStaffNumber() {
  return `STAFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function ensureBetterAuthTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS auth_user (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS auth_session (
      id text PRIMARY KEY,
      expires_at timestamptz NOT NULL,
      token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      ip_address text,
      user_agent text,
      user_id text NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS auth_account (
      id text PRIMARY KEY,
      account_id text NOT NULL,
      provider_id text NOT NULL,
      user_id text NOT NULL,
      access_token text,
      refresh_token text,
      id_token text,
      access_token_expires_at timestamptz,
      refresh_token_expires_at timestamptz,
      scope text,
      password text,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS auth_verification (
      id text PRIMARY KEY,
      identifier text NOT NULL,
      value text NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz,
      updated_at timestamptz
    )
  `);
}

async function createIfMissingRole(key: string) {
  const [item] = await db.insert(roles).values({ key, name: key.toUpperCase(), isSystemRole: true }).onConflictDoNothing().returning();
  if (item) return item;
  return db.query.roles.findFirst({ where: eq(roles.key, key) });
}

async function createIfMissingPermission(key: string) {
  const [item] = await db.insert(permissions).values({ key }).onConflictDoNothing().returning();
  if (item) return item;
  return db.query.permissions.findFirst({ where: eq(permissions.key, key) });
}

export async function bootstrapFirstSuperAdmin(input: BootstrapInput) {
  await ensureBetterAuthTables();
  const email = normalizeEmail(input.email);
  const existingSuperAdmin = await db
    .select({ id: staffProfiles.id })
    .from(staffProfiles)
    .innerJoin(roles, eq(staffProfiles.roleId, roles.id))
    .where(eq(roles.key, "super_admin"));
  if (existingSuperAdmin.length > 0) throw new Error("Super admin already exists");

  const roleRows = await Promise.all(REQUIRED_ROLES.map(createIfMissingRole));
  const permissionRows = await Promise.all(REQUIRED_PERMISSIONS.map(createIfMissingPermission));
  const superAdminRole = roleRows.find((r) => r?.key === "super_admin");
  if (!superAdminRole) throw new Error("Unable to resolve super_admin role");

  for (const perm of permissionRows) {
    if (!perm) throw new Error("Unable to resolve required permissions");
    await db.insert(rolePermissions).values({ roleId: superAdminRole.id, permissionId: perm.id }).onConflictDoNothing();
  }

  const existingByEmail = await db.query.users.findFirst({ where: eq(users.normalizedEmail, email) });
  if (existingByEmail) throw new Error("Email already exists in app users");

  const authApi = dashboardAuth.api as typeof dashboardAuth.api & {
    signUpEmail: (input: {
      body: { name: string; email: string; password: string };
      headers: Headers;
    }) => Promise<{ token: string | null; user: { id: string } }>;
  };
  let authResult: { token: string | null; user: { id: string } };
  try {
    authResult = await authApi.signUpEmail({
      body: { name: input.fullName, email, password: input.password },
      headers: new Headers(),
    });
  } catch {
    throw new Error("Failed to create Better Auth user");
  }
  const authUserId = authResult.user.id;

  return db.transaction(async (tx) => {
    const [appUser] = await tx
      .insert(users)
      .values({ email, normalizedEmail: email, accountType: "staff", status: "active", metadata: {} })
      .returning();
    await tx.insert(userAuthIdentities).values({ userId: appUser.id, provider: "credentials", providerUserId: authUserId });
    const [staff] = await tx
      .insert(staffProfiles)
      .values({ userId: appUser.id, staffNumber: buildStaffNumber(), roleId: superAdminRole.id, fullName: input.fullName, status: "active", metadata: {} })
      .returning();
    return { userId: appUser.id, staffProfileId: staff.id, role: superAdminRole.key };
  });
}
