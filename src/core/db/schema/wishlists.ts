import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./auth";

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("wishlist_items_user_product_idx").on(table.userId, table.productId),
    userIdx: index("wishlist_items_user_idx").on(table.userId),
    productIdx: index("wishlist_items_product_idx").on(table.productId),
  })
);