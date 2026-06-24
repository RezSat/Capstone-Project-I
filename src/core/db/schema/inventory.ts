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
  inventoryCountStatusEnum,
  inventoryLocationTypeEnum,
  inventoryReservationStatusEnum,
  purchaseOrderStatusEnum,
  stockCommitStatusEnum,
  stockMovementTypeEnum,
  stockSourceTypeEnum,
} from "./enums";
import { users } from "./auth";
import { productVariants } from "./products";

export const stockLocations = pgTable(
  "stock_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    type: inventoryLocationTypeEnum("type").notNull().default("store"),
    address: text("address"),
    isDefault: boolean("is_default").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("stock_locations_code_idx").on(table.code),
    defaultIdx: uniqueIndex("stock_locations_default_idx").on(table.isDefault).where(sql`${table.isDefault} = true`),
  })
);

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").notNull().references(() => stockLocations.id, { onDelete: "restrict" }),
    quantityOnHand: integer("quantity_on_hand").notNull().default(0),
    quantityReserved: integer("quantity_reserved").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(0),
    reorderPoint: integer("reorder_point").notNull().default(0),
    reorderQuantity: integer("reorder_quantity").notNull().default(0),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    variantLocationIdx: uniqueIndex("inventory_items_variant_location_idx").on(table.variantId, table.locationId),
    locationIdx: index("inventory_items_location_idx").on(table.locationId),
    onHandCheck: check("inventory_items_on_hand_non_negative_check", sql`${table.quantityOnHand} >= 0`),
    reservedCheck: check("inventory_items_reserved_non_negative_check", sql`${table.quantityReserved} >= 0`),
    reservedLteOnHandCheck: check("inventory_items_reserved_lte_on_hand_check", sql`${table.quantityReserved} <= ${table.quantityOnHand}`),
  })
);

export const stockCommits = pgTable(
  "stock_commits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commitNumber: varchar("commit_number", { length: 48 }).notNull(),
    sourceType: stockSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id"),
    status: stockCommitStatusEnum("status").notNull().default("pending"),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    idempotencyKey: text("idempotency_key"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    committedAt: timestamp("committed_at", { withTimezone: true }),
    rolledBackAt: timestamp("rolled_back_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("stock_commits_number_idx").on(table.commitNumber),
    sourceIdx: index("stock_commits_source_idx").on(table.sourceType, table.sourceId),
    idempotencyIdx: uniqueIndex("stock_commits_idempotency_idx").on(table.idempotencyKey).where(sql`${table.idempotencyKey} is not null`),
  })
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reservationNumber: varchar("reservation_number", { length: 48 }).notNull(),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").notNull().references(() => stockLocations.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    status: inventoryReservationStatusEnum("status").notNull().default("active"),
    sourceType: stockSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    committedAt: timestamp("committed_at", { withTimezone: true }),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("inventory_reservations_number_idx").on(table.reservationNumber),
    variantLocationIdx: index("inventory_reservations_variant_location_idx").on(table.variantId, table.locationId),
    sourceIdx: index("inventory_reservations_source_idx").on(table.sourceType, table.sourceId),
    expiresAtIdx: index("inventory_reservations_expires_at_idx").on(table.expiresAt),
    quantityCheck: check("inventory_reservations_quantity_positive_check", sql`${table.quantity} > 0`),
  })
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commitId: uuid("commit_id").references(() => stockCommits.id, { onDelete: "set null" }),
    reservationId: uuid("reservation_id").references(() => inventoryReservations.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").notNull().references(() => stockLocations.id, { onDelete: "restrict" }),
    movementType: stockMovementTypeEnum("movement_type").notNull(),
    sourceType: stockSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id"),
    quantityChange: integer("quantity_change").notNull(),
    quantityBefore: integer("quantity_before").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    reservedBefore: integer("reserved_before").notNull().default(0),
    reservedAfter: integer("reserved_after").notNull().default(0),
    note: text("note"),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    variantCreatedIdx: index("stock_movements_variant_created_idx").on(table.variantId, table.createdAt),
    sourceIdx: index("stock_movements_source_idx").on(table.sourceType, table.sourceId),
    commitIdx: index("stock_movements_commit_idx").on(table.commitId),
  })
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    contactName: text("contact_name"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("suppliers_name_idx").on(table.name),
  })
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    poNumber: varchar("po_number", { length: 48 }).notNull(),
    supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    status: purchaseOrderStatusEnum("status").notNull().default("draft"),
    expectedAt: timestamp("expected_at", { withTimezone: true }),
    subtotalMinor: integer("subtotal_minor").notNull().default(0),
    totalMinor: integer("total_minor").notNull().default(0),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    notes: text("notes"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("purchase_orders_number_idx").on(table.poNumber),
    supplierIdx: index("purchase_orders_supplier_idx").on(table.supplierId),
    statusIdx: index("purchase_orders_status_idx").on(table.status),
  })
);

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseOrderId: uuid("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
    quantityOrdered: integer("quantity_ordered").notNull(),
    quantityReceived: integer("quantity_received").notNull().default(0),
    unitCostMinor: integer("unit_cost_minor").notNull().default(0),
    lineTotalMinor: integer("line_total_minor").notNull().default(0),
  },
  (table) => ({
    poVariantIdx: uniqueIndex("purchase_order_items_po_variant_idx").on(table.purchaseOrderId, table.variantId),
    quantityOrderedCheck: check("purchase_order_items_quantity_ordered_positive_check", sql`${table.quantityOrdered} > 0`),
    quantityReceivedCheck: check("purchase_order_items_quantity_received_non_negative_check", sql`${table.quantityReceived} >= 0`),
  })
);

export const inventoryCountSessions = pgTable(
  "inventory_count_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countNumber: varchar("count_number", { length: 48 }).notNull(),
    locationId: uuid("location_id").notNull().references(() => stockLocations.id, { onDelete: "restrict" }),
    status: inventoryCountStatusEnum("status").notNull().default("draft"),
    startedByUserId: uuid("started_by_user_id").references(() => users.id, { onDelete: "set null" }),
    completedByUserId: uuid("completed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("inventory_count_sessions_number_idx").on(table.countNumber),
    locationIdx: index("inventory_count_sessions_location_idx").on(table.locationId),
  })
);

export const inventoryCountItems = pgTable(
  "inventory_count_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countSessionId: uuid("count_session_id").notNull().references(() => inventoryCountSessions.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
    expectedQuantity: integer("expected_quantity").notNull(),
    countedQuantity: integer("counted_quantity"),
    differenceQuantity: integer("difference_quantity"),
    note: text("note"),
  },
  (table) => ({
    sessionVariantIdx: uniqueIndex("inventory_count_items_session_variant_idx").on(table.countSessionId, table.variantId),
  })
);

export const inventoryItemRelations = relations(inventoryItems, ({ one }) => ({
  variant: one(productVariants, { fields: [inventoryItems.variantId], references: [productVariants.id] }),
  location: one(stockLocations, { fields: [inventoryItems.locationId], references: [stockLocations.id] }),
}));
