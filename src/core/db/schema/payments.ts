import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { customerProfiles, users } from "./auth";
import { orders } from "./orders";
import { paymentEventTypeEnum, paymentMethodTypeEnum, paymentProviderEnum, paymentStatusEnum, refundStatusEnum } from "./enums";

export const customerPaymentMethods = pgTable(
  "customer_payment_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    methodType: paymentMethodTypeEnum("method_type").notNull(),
    providerCustomerId: text("provider_customer_id"),
    providerPaymentMethodId: text("provider_payment_method_id"),
    brand: text("brand"),
    last4: varchar("last4", { length: 4 }),
    expMonth: integer("exp_month"),
    expYear: integer("exp_year"),
    billingName: text("billing_name"),
    billingEmail: text("billing_email"),
    billingPhone: text("billing_phone"),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index("customer_payment_methods_customer_idx").on(table.customerId),
    providerMethodIdx: uniqueIndex("customer_payment_methods_provider_method_idx").on(table.provider, table.providerPaymentMethodId).where(sql`${table.providerPaymentMethodId} is not null`),
    defaultPerCustomerIdx: uniqueIndex("customer_payment_methods_default_idx").on(table.customerId).where(sql`${table.isDefault} = true`),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentNumber: varchar("payment_number", { length: 48 }).notNull(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    customerPaymentMethodId: uuid("customer_payment_method_id").references(() => customerPaymentMethods.id, { onDelete: "set null" }),
    provider: paymentProviderEnum("provider").notNull(),
    methodType: paymentMethodTypeEnum("method_type").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amountMinor: integer("amount_minor").notNull(),
    refundedAmountMinor: integer("refunded_amount_minor").notNull().default(0),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    providerReference: text("provider_reference"),
    providerCheckoutUrl: text("provider_checkout_url"),
    idempotencyKey: text("idempotency_key"),
    failureCode: text("failure_code"),
    failureMessage: text("failure_message"),
    rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("payments_number_idx").on(table.paymentNumber),
    orderIdx: index("payments_order_idx").on(table.orderId),
    providerReferenceIdx: index("payments_provider_reference_idx").on(table.provider, table.providerReference),
    idempotencyIdx: uniqueIndex("payments_idempotency_idx").on(table.idempotencyKey).where(sql`${table.idempotencyKey} is not null`),
    amountCheck: check("payments_amount_positive_check", sql`${table.amountMinor} > 0`),
    refundedCheck: check("payments_refunded_non_negative_check", sql`${table.refundedAmountMinor} >= 0`),
  })
);

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    eventType: paymentEventTypeEnum("event_type").notNull(),
    providerEventId: text("provider_event_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    paymentIdx: index("payment_events_payment_idx").on(table.paymentId),
    providerEventIdx: uniqueIndex("payment_events_provider_event_idx").on(table.provider, table.providerEventId).where(sql`${table.providerEventId} is not null`),
  })
);

export const paymentRefunds = pgTable(
  "payment_refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    refundNumber: varchar("refund_number", { length: 48 }).notNull(),
    paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
    amountMinor: integer("amount_minor").notNull(),
    status: refundStatusEnum("status").notNull().default("pending"),
    reason: text("reason"),
    providerRefundReference: text("provider_refund_reference"),
    requestedByUserId: uuid("requested_by_user_id").references(() => users.id, { onDelete: "set null" }),
    rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("payment_refunds_number_idx").on(table.refundNumber),
    paymentIdx: index("payment_refunds_payment_idx").on(table.paymentId),
    amountCheck: check("payment_refunds_amount_positive_check", sql`${table.amountMinor} > 0`),
  })
);

export const paymentRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
  events: many(paymentEvents),
  refunds: many(paymentRefunds),
}));
