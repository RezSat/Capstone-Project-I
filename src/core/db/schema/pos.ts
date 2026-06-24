import { relations, sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { cashMovementTypeEnum, posSessionStatusEnum } from "./enums";
import { staffProfiles } from "./auth";
import { stockLocations } from "./inventory";
import { orders } from "./orders";

export const posRegisters = pgTable(
  "pos_registers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    locationId: uuid("location_id").notNull().references(() => stockLocations.id, { onDelete: "restrict" }),
    receiptPrefix: varchar("receipt_prefix", { length: 16 }).notNull().default("POS"),
    nextReceiptNumber: integer("next_receipt_number").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    codeIdx: uniqueIndex("pos_registers_code_idx").on(table.code),
    locationIdx: index("pos_registers_location_idx").on(table.locationId),
  })
);

export const posSessions = pgTable(
  "pos_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionNumber: varchar("session_number", { length: 48 }).notNull(),
    registerId: uuid("register_id").notNull().references(() => posRegisters.id, { onDelete: "restrict" }),
    openedByStaffId: uuid("opened_by_staff_id").notNull().references(() => staffProfiles.id, { onDelete: "restrict" }),
    closedByStaffId: uuid("closed_by_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    status: posSessionStatusEnum("status").notNull().default("open"),
    openingCashMinor: integer("opening_cash_minor").notNull().default(0),
    expectedClosingCashMinor: integer("expected_closing_cash_minor"),
    actualClosingCashMinor: integer("actual_closing_cash_minor"),
    cashDifferenceMinor: integer("cash_difference_minor"),
    notes: text("notes"),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    numberIdx: uniqueIndex("pos_sessions_number_idx").on(table.sessionNumber),
    registerIdx: index("pos_sessions_register_idx").on(table.registerId),
    openSessionPerRegisterIdx: uniqueIndex("pos_sessions_open_register_idx").on(table.registerId).where(sql`${table.status} = 'open'`),
  })
);

export const posReceipts = pgTable(
  "pos_receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    receiptNumber: varchar("receipt_number", { length: 64 }).notNull(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => posSessions.id, { onDelete: "set null" }),
    cashierStaffId: uuid("cashier_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    printedAt: timestamp("printed_at", { withTimezone: true }),
    emailedAt: timestamp("emailed_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    numberIdx: uniqueIndex("pos_receipts_number_idx").on(table.receiptNumber),
    orderIdx: uniqueIndex("pos_receipts_order_idx").on(table.orderId),
    sessionIdx: index("pos_receipts_session_idx").on(table.sessionId),
  })
);

export const posCashMovements = pgTable(
  "pos_cash_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id").notNull().references(() => posSessions.id, { onDelete: "cascade" }),
    type: cashMovementTypeEnum("type").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    reason: text("reason"),
    actorStaffId: uuid("actor_staff_id").references(() => staffProfiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdx: index("pos_cash_movements_session_idx").on(table.sessionId),
    amountCheck: check("pos_cash_movements_amount_non_negative_check", sql`${table.amountMinor} >= 0`),
  })
);

export const posSessionRelations = relations(posSessions, ({ one, many }) => ({
  register: one(posRegisters, { fields: [posSessions.registerId], references: [posRegisters.id] }),
  receipts: many(posReceipts),
  cashMovements: many(posCashMovements),
}));
