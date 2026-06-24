import { relations } from "drizzle-orm";
import { AnyPgColumn, boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { categoryStatusEnum } from "./enums";
import { files } from "./files";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    fullSlug: text("full_slug").notNull(),
    description: text("description"),
    imageFileId: uuid("image_file_id").references(() => files.id, { onDelete: "set null" }),
    status: categoryStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    groupSlug: text("group_slug").notNull().default("default"),
  },
  (table) => ({
    parentIdx: index("categories_parent_idx").on(table.parentId),
    fullSlugIdx: uniqueIndex("categories_full_slug_idx").on(table.fullSlug),
    siblingSlugIdx: uniqueIndex("categories_sibling_slug_idx").on(table.parentId, table.slug),
    statusIdx: index("categories_status_idx").on(table.status),
    groupSlugIdx: index("categories_group_slug_idx").on(table.groupSlug),
    groupSlugSlugIdx: uniqueIndex("categories_group_slug_slug_idx").on(table.groupSlug, table.slug),
  })
);

export const categoryPageContent = pgTable(
  "category_page_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    heroImageFileId: uuid("hero_image_file_id").references(() => files.id, { onDelete: "set null" }),
    fallbackHeroImageFileId: uuid("fallback_hero_image_file_id").references(() => files.id, { onDelete: "set null" }),
    heroImageUrl: text("hero_image_url"),
    fallbackHeroImageUrl: text("fallback_hero_image_url"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    contentJson: jsonb("content_json").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: uniqueIndex("category_page_content_category_idx").on(table.categoryId),
  })
);

export const categoryFilters = pgTable(
  "category_filters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    sourceType: text("source_type").notNull().default("attribute"),
    sourceKey: text("source_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categorySlugIdx: uniqueIndex("category_filters_category_slug_idx").on(table.categoryId, table.slug),
    categoryIdx: index("category_filters_category_idx").on(table.categoryId),
  })
);

export const categoryFilterOptions = pgTable(
  "category_filter_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filterId: uuid("filter_id").notNull().references(() => categoryFilters.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    filterValueIdx: uniqueIndex("category_filter_options_filter_value_idx").on(table.filterId, table.value),
  })
);

export const storefrontNavItems = pgTable(
  "storefront_nav_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    label: text("label").notNull(),
    href: text("href").notNull(),
    menuType: text("menu_type").notNull().default("category"),
    imageFileId: uuid("image_file_id").references(() => files.id, { onDelete: "set null" }),
    imageAlt: text("image_alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sortIdx: index("storefront_nav_items_sort_idx").on(table.sortOrder),
  })
);

export const storefrontNavColumns = pgTable(
  "storefront_nav_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    navItemId: uuid("nav_item_id").notNull().references(() => storefrontNavItems.id, { onDelete: "cascade" }),
    heading: text("heading").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    navItemIdx: index("storefront_nav_columns_nav_item_idx").on(table.navItemId),
  })
);

export const storefrontNavLinks = pgTable(
  "storefront_nav_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    columnId: uuid("column_id").notNull().references(() => storefrontNavColumns.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    href: text("href").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    columnIdx: index("storefront_nav_links_column_idx").on(table.columnId),
    categoryIdx: index("storefront_nav_links_category_idx").on(table.categoryId),
  })
);

export const homepageSportsSlides = pgTable(
  "homepage_sports_slides",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    imageFileId: uuid("image_file_id").references(() => files.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    sortIdx: index("homepage_sports_slides_sort_idx").on(table.sortOrder),
  })
);

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "category_parent" }),
  children: many(categories, { relationName: "category_parent" }),
  pageContent: one(categoryPageContent, { fields: [categories.id], references: [categoryPageContent.categoryId] }),
  filters: many(categoryFilters),
}));

export const categoryFiltersRelations = relations(categoryFilters, ({ one, many }) => ({
  category: one(categories, { fields: [categoryFilters.categoryId], references: [categories.id] }),
  options: many(categoryFilterOptions),
}));

export const categoryFilterOptionsRelations = relations(categoryFilterOptions, ({ one }) => ({
  filter: one(categoryFilters, { fields: [categoryFilterOptions.filterId], references: [categoryFilters.id] }),
}));
