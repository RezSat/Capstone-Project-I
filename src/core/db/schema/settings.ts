import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { apiKeyStatusEnum, paymentProviderEnum, settingValueTypeEnum } from "./enums";

export * from "./shipping-settings";

export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    valueType: settingValueTypeEnum("value_type").notNull().default("string"),
    value: jsonb("value").$type<Record<string, unknown>>().notNull().default({}),
    description: text("description"),
    isPublic: boolean("is_public").notNull().default(false),
    updatedByUserId: uuid("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ keyIdx: uniqueIndex("system_settings_key_idx").on(table.key) })
);

export const paymentProviderConfigs = pgTable(
  "payment_provider_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: paymentProviderEnum("provider").notNull(),
    displayName: text("display_name").notNull(),
    isEnabled: boolean("is_enabled").notNull().default(false),
    mode: text("mode").notNull().default("sandbox"),
    publicConfig: jsonb("public_config").$type<Record<string, unknown>>().notNull().default({}),
    secretConfigRef: text("secret_config_ref"),
    sortOrder: integer("sort_order").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ providerIdx: uniqueIndex("payment_provider_configs_provider_idx").on(table.provider) })
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hashedKey: text("hashed_key").notNull(),
    status: apiKeyStatusEnum("status").notNull().default("active"),
    permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    prefixIdx: uniqueIndex("api_keys_prefix_idx").on(table.prefix),
    hashedKeyIdx: uniqueIndex("api_keys_hashed_key_idx").on(table.hashedKey),
    statusIdx: index("api_keys_status_idx").on(table.status),
  })
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    eventId: text("event_id"),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    signatureVerified: boolean("signature_verified").notNull().default(false),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerEventIdx: uniqueIndex("webhook_events_provider_event_idx").on(table.provider, table.eventId).where(sql`${table.eventId} is not null`),
    receivedAtIdx: index("webhook_events_received_at_idx").on(table.receivedAt),
  })
);
