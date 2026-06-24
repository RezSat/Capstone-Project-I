import { index, numeric, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"

export const wooOrders = pgTable(
  "woo_orders",
  {
    wooOrderId: varchar("woo_order_id", { length: 50 }).primaryKey(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    paymentUrl: varchar("payment_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("woo_orders_email_idx").on(table.email),
    statusIdx: index("woo_orders_status_idx").on(table.status),
  })
)