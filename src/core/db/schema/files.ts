import { relations } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { fileAccessEnum, fileKindEnum, imageOrientationEnum } from "./enums";
import { users } from "./auth";

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: fileKindEnum("kind").notNull(),
    access: fileAccessEnum("access").notNull().default("private"),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    orientation: imageOrientationEnum("orientation").notNull().default("unknown"),
    bucket: text("bucket").notNull(),
    storageKey: text("storage_key").notNull(),
    publicUrl: text("public_url"),
    altText: text("alt_text"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    storageKeyIdx: uniqueIndex("files_storage_key_idx").on(table.storageKey),
    kindIdx: index("files_kind_idx").on(table.kind),
    uploadedByIdx: index("files_uploaded_by_idx").on(table.uploadedByUserId),
  })
);

export const fileRelations = relations(files, ({ one }) => ({
  uploadedBy: one(users, { fields: [files.uploadedByUserId], references: [users.id] }),
}));
