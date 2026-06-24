import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const shippingSettingsTable = pgTable(
  "shipping_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    freeShippingThresholdMinor: integer("free_shipping_threshold_minor").notNull().default(650000),
    baseShippingFeeMinor: integer("base_shipping_fee_minor").notNull().default(35000),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);