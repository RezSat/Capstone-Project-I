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
import {
  cartStatusEnum,
  checkoutSessionStatusEnum,
  fulfillmentStatusEnum,
  orderSourceEnum,
  orderStatusEnum,
  paymentStatusEnum,
  returnStatusEnum,
  shipmentStatusEnum,
} from "./enums";
import { customerAddresses, customerProfiles, staffProfiles, users } from "./auth";
import { productVariants, products } from "./products";
import { stockLocations } from "./inventory";

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "cascade" }),
    guestTokenHash: text("guest_token_hash"),
    status: cartStatusEnum("status").notNull().default("active"),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index("carts_customer_idx").on(table.customerId),
    guestTokenIdx: uniqueIndex("carts_guest_token_idx").on(table.guestTokenHash).where(sql`${table.guestTokenHash} is not null`),
    statusIdx: index("carts_status_idx").on(table.status),
  })
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceMinorSnapshot: integer("unit_price_minor_snapshot").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cartVariantIdx: uniqueIndex("cart_items_cart_variant_idx").on(table.cartId, table.variantId),
    quantityCheck: check("cart_items_quantity_positive_check", sql`${table.quantity} > 0`),
  })
);

export const discounts = pgTable(
  "discounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    discountType: text("discount_type").notNull(),
    discountValue: integer("discount_value").notNull().default(0),
    minimumOrderMinor: integer("minimum_order_minor"),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("discounts_code_idx").on(table.code),
    activeIdx: index("discounts_active_idx").on(table.isActive),
  })
);

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionNumber: varchar("session_number", { length: 48 }).notNull(),
    cartId: uuid("cart_id").references(() => carts.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "set null" }),
    status: checkoutSessionStatusEnum("status").notNull().default("open"),
    reservationId: uuid("reservation_id"),
    selectedPaymentProvider: text("selected_payment_provider"),
    subtotalMinor: integer("subtotal_minor").notNull().default(0),
    discountTotalMinor: integer("discount_total_minor").notNull().default(0),
    shippingTotalMinor: integer("shipping_total_minor").notNull().default(0),
    taxTotalMinor: integer("tax_total_minor").notNull().default(0),
    grandTotalMinor: integer("grand_total_minor").notNull().default(0),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("checkout_sessions_number_idx").on(table.sessionNumber),
    cartIdx: index("checkout_sessions_cart_idx").on(table.cartId),
    customerIdx: index("checkout_sessions_customer_idx").on(table.customerId),
    expiresAtIdx: index("checkout_sessions_expires_at_idx").on(table.expiresAt),
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 48 }).notNull(),
    kokoTrnId: text("koko_trn_id"),
    checkoutSessionId: uuid("checkout_session_id").references(() => checkoutSessions.id, { onDelete: "set null" }),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "set null" }),
    source: orderSourceEnum("source").notNull().default("online"),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status").notNull().default("unfulfilled"),
    stockLocationId: uuid("stock_location_id").references(() => stockLocations.id, { onDelete: "set null" }),
    subtotalMinor: integer("subtotal_minor").notNull().default(0),
    discountTotalMinor: integer("discount_total_minor").notNull().default(0),
    taxTotalMinor: integer("tax_total_minor").notNull().default(0),
    shippingTotalMinor: integer("shipping_total_minor").notNull().default(0),
    grandTotalMinor: integer("grand_total_minor").notNull().default(0),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    customerEmailSnapshot: text("customer_email_snapshot"),
    customerPhoneSnapshot: text("customer_phone_snapshot"),
    billingDetailsSnapshot: jsonb("billing_details_snapshot").$type<{
      firstName: string;
      lastName: string;
      address: string;
      apartment?: string;
      city: string;
      district?: string;
      province?: string;
      postalCode?: string;
      phone: string;
      items?: Array<{ name: string; optionSignature: string; quantity: number; priceMinor: number }>;
    }>().notNull(),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    createdByStaffId: uuid("created_by_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    placedAt: timestamp("placed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("orders_number_idx").on(table.orderNumber),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    sourceIdx: index("orders_source_idx").on(table.source),
    statusIdx: index("orders_status_idx").on(table.status),
    paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
    grandTotalCheck: check("orders_grand_total_non_negative_check", sql`${table.grandTotalMinor} >= 0`),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    variantTitleSnapshot: text("variant_title_snapshot").notNull(),
    skuSnapshot: text("sku_snapshot"),
    quantity: integer("quantity").notNull(),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    discountTotalMinor: integer("discount_total_minor").notNull().default(0),
    taxTotalMinor: integer("tax_total_minor").notNull().default(0),
    lineTotalMinor: integer("line_total_minor").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
    variantIdx: index("order_items_variant_idx").on(table.variantId),
    quantityCheck: check("order_items_quantity_positive_check", sql`${table.quantity} > 0`),
  })
);

export const orderAddresses = pgTable(
  "order_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    sourceAddressId: uuid("source_address_id").references(() => customerAddresses.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    district: text("district"),
    province: text("province"),
    postalCode: text("postal_code"),
    countryCode: varchar("country_code", { length: 2 }).notNull().default("LK"),
  },
  (table) => ({
    orderTypeIdx: uniqueIndex("order_addresses_order_type_idx").on(table.orderId, table.type),
  })
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    note: text("note"),
    changedByUserId: uuid("changed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index("order_status_history_order_idx").on(table.orderId),
  })
);

export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    basePriceMinor: integer("base_price_minor").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("shipping_methods_code_idx").on(table.code),
  })
);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    shippingMethodId: uuid("shipping_method_id").references(() => shippingMethods.id, { onDelete: "set null" }),
    status: shipmentStatusEnum("status").notNull().default("pending"),
    trackingNumber: text("tracking_number"),
    carrierName: text("carrier_name"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index("shipments_order_idx").on(table.orderId),
    trackingIdx: index("shipments_tracking_idx").on(table.trackingNumber),
  })
);

export const orderReturns = pgTable(
  "order_returns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    returnNumber: varchar("return_number", { length: 48 }).notNull(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: returnStatusEnum("status").notNull().default("requested"),
    reason: text("reason"),
    notes: text("notes"),
    requestedByUserId: uuid("requested_by_user_id").references(() => users.id, { onDelete: "set null" }),
    processedByUserId: uuid("processed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("order_returns_number_idx").on(table.returnNumber),
    orderIdx: index("order_returns_order_idx").on(table.orderId),
  })
);

export const orderReturnItems = pgTable(
  "order_return_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    returnId: uuid("return_id").notNull().references(() => orderReturns.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").notNull().references(() => orderItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    restock: boolean("restock").notNull().default(true),
    reason: text("reason"),
  },
  (table) => ({
    returnItemIdx: uniqueIndex("order_return_items_return_item_idx").on(table.returnId, table.orderItemId),
    quantityCheck: check("order_return_items_quantity_positive_check", sql`${table.quantity} > 0`),
  })
);

export const discountRedemptions = pgTable(
  "discount_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    discountId: uuid("discount_id").notNull().references(() => discounts.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "set null" }),
    amountMinor: integer("amount_minor").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    discountOrderIdx: uniqueIndex("discount_redemptions_discount_order_idx").on(table.discountId, table.orderId),
  })
);

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customerProfiles, { fields: [orders.customerId], references: [customerProfiles.id] }),
  items: many(orderItems),
  addresses: many(orderAddresses),
  shipments: many(shipments),
}));
