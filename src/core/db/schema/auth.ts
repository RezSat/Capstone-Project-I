import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accountTypeEnum, accountStatusEnum, addressTypeEnum, authProviderEnum, staffStatusEnum, tokenPurposeEnum, userStatusEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    normalizedEmail: text("normalized_email").notNull(),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    accountType: accountTypeEnum("account_type").notNull().default("customer"),
    status: userStatusEnum("status").notNull().default("pending_verification"),
    accountStatus: accountStatusEnum("account_status").notNull().default("incomplete"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    normalizedEmailIdx: uniqueIndex("users_normalized_email_idx").on(table.normalizedEmail),
    phoneIdx: index("users_phone_idx").on(table.phone),
    statusIdx: index("users_status_idx").on(table.status),
    accountTypeIdx: index("users_account_type_idx").on(table.accountType),
    emailLowerCheck: check("users_normalized_email_lower_check", sql`${table.normalizedEmail} = lower(${table.normalizedEmail})`),
  })
);

export const userAuthIdentities = pgTable(
  "user_auth_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: authProviderEnum("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerUserIdx: uniqueIndex("user_auth_identities_provider_user_idx").on(table.provider, table.providerUserId),
    userProviderIdx: uniqueIndex("user_auth_identities_user_provider_idx").on(table.userId, table.provider),
  })
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sessionTokenHash: text("session_token_hash").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("user_sessions_token_hash_idx").on(table.sessionTokenHash),
    userIdx: index("user_sessions_user_idx").on(table.userId),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
  })
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    purpose: tokenPurposeEnum("purpose").notNull(),
    tokenHash: text("token_hash").notNull(),
    email: text("email"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("auth_tokens_token_hash_idx").on(table.tokenHash),
    userPurposeIdx: index("auth_tokens_user_purpose_idx").on(table.userId, table.purpose),
    expiresAtIdx: index("auth_tokens_expires_at_idx").on(table.expiresAt),
  })
);

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    customerNumber: varchar("customer_number", { length: 32 }).notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    displayName: text("display_name"),
    phone: text("phone"),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    recommendationOptIn: boolean("recommendation_opt_in").notNull().default(true),
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("customer_profiles_user_idx").on(table.userId),
    customerNumberIdx: uniqueIndex("customer_profiles_customer_number_idx").on(table.customerNumber),
    phoneIdx: index("customer_profiles_phone_idx").on(table.phone),
  })
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
    type: addressTypeEnum("type").notNull().default("shipping"),
    label: text("label"),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    city: text("city").notNull(),
    district: text("district"),
    province: text("province"),
    postalCode: text("postal_code"),
    countryCode: varchar("country_code", { length: 2 }).notNull().default("LK"),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index("customer_addresses_customer_idx").on(table.customerId),
    defaultBillingIdx: uniqueIndex("customer_addresses_default_billing_idx").on(table.customerId).where(sql`${table.isDefaultBilling} = true`),
    defaultShippingIdx: uniqueIndex("customer_addresses_default_shipping_idx").on(table.customerId).where(sql`${table.isDefaultShipping} = true`),
  })
);

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystemRole: boolean("is_system_role").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("roles_key_idx").on(table.key),
  })
);

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    keyIdx: uniqueIndex("permissions_key_idx").on(table.key),
  })
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

export const staffProfiles = pgTable(
  "staff_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    staffNumber: varchar("staff_number", { length: 32 }).notNull(),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    status: staffStatusEnum("status").notNull().default("invited"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("staff_profiles_user_idx").on(table.userId),
    staffNumberIdx: uniqueIndex("staff_profiles_staff_number_idx").on(table.staffNumber),
    roleIdx: index("staff_profiles_role_idx").on(table.roleId),
    statusIdx: index("staff_profiles_status_idx").on(table.status),
  })
);

export const userRelations = relations(users, ({ one, many }) => ({
  customerProfile: one(customerProfiles, { fields: [users.id], references: [customerProfiles.userId] }),
  staffProfile: one(staffProfiles, { fields: [users.id], references: [staffProfiles.userId] }),
  authIdentities: many(userAuthIdentities),
  sessions: many(userSessions),
}));

export const customerProfileRelations = relations(customerProfiles, ({ one, many }) => ({
  user: one(users, { fields: [customerProfiles.userId], references: [users.id] }),
  addresses: many(customerAddresses),
}));

export const staffProfileRelations = relations(staffProfiles, ({ one }) => ({
  user: one(users, { fields: [staffProfiles.userId], references: [users.id] }),
  role: one(roles, { fields: [staffProfiles.roleId], references: [roles.id] }),
}));
