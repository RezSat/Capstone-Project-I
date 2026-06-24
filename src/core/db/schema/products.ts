import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  attributeDisplayTypeEnum,
  contentSectionTypeEnum,
  productPromoLabelEnum,
  productStatusEnum,
  promotionDiscountTypeEnum,
  promotionTypeEnum,
  recommendationSourceEnum,
  variantStatusEnum,
} from "./enums";
import { categories } from "./catalog";
import { files } from "./files";

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoFileId: uuid("logo_file_id").references(() => files.id, { onDelete: "set null" }),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("brands_slug_idx").on(table.slug),
    nameIdx: index("brands_name_idx").on(table.name),
  })
);

export const productTags = pgTable(
  "product_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("product_tags_slug_idx").on(table.slug),
  })
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    primaryCategoryId: uuid("primary_category_id").references(() => categories.id, { onDelete: "set null" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    productType: text("product_type"),
    shortDescription: text("short_description"),
    description: text("description"),
    basePriceMinor: integer("base_price_minor").notNull().default(0),
    compareAtPriceMinor: integer("compare_at_price_minor"),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    status: productStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    promoLabel: productPromoLabelEnum("promo_label").notNull().default("none"),
    allowBackorder: boolean("allow_backorder").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    searchKeywords: text("search_keywords"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    group: text("group"),
    category: text("category"),
    categorySlug: text("category_slug"),
  },
  (table) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
    primaryCategoryIdx: index("products_primary_category_idx").on(table.primaryCategoryId),
    brandIdx: index("products_brand_idx").on(table.brandId),
    statusIdx: index("products_status_idx").on(table.status),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    priceCheck: check("products_base_price_non_negative_check", sql`${table.basePriceMinor} >= 0`),
  })
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] }),
    categoryIdx: index("product_categories_category_idx").on(table.categoryId),
  })
);

export const productTagAssignments = pgTable(
  "product_tag_assignments",
  {
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => productTags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
  })
);

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "restrict" }),
    role: text("role").notNull().default("gallery"),
    altText: text("alt_text"),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_media_product_idx").on(table.productId),
    fileIdx: index("product_media_file_idx").on(table.fileId),
    primaryPerProductIdx: uniqueIndex("product_media_primary_per_product_idx").on(table.productId).where(sql`${table.isPrimary} = true`),
  })
);

export const productContentSections = pgTable(
  "product_content_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    title: text("title").notNull(),
    contentType: contentSectionTypeEnum("content_type").notNull(),
    contentJson: jsonb("content_json").$type<Record<string, unknown>>().notNull().default({}),
    defaultOpen: boolean("default_open").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productKeyIdx: uniqueIndex("product_content_sections_product_key_idx").on(table.productId, table.key),
  })
);

export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    groupName: text("group_name"),
    name: text("name").notNull(),
    value: text("value").notNull(),
    valueNormalized: text("value_normalized"),
    isFilterable: boolean("is_filterable").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    productIdx: index("product_specifications_product_idx").on(table.productId),
    filterIdx: index("product_specifications_filter_idx").on(table.name, table.valueNormalized),
  })
);

export const productAttributes = pgTable(
  "product_attributes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    displayType: attributeDisplayTypeEnum("display_type").notNull().default("button"),
    isVariantAttribute: boolean("is_variant_attribute").notNull().default(true),
    isRequired: boolean("is_required").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productSlugIdx: uniqueIndex("product_attributes_product_slug_idx").on(table.productId, table.slug),
  })
);

export const productAttributeValues = pgTable(
  "product_attribute_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attributeId: uuid("attribute_id").notNull().references(() => productAttributes.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    colorHex: varchar("color_hex", { length: 16 }),
    imageFileId: uuid("image_file_id").references(() => files.id, { onDelete: "set null" }),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    attributeValueIdx: uniqueIndex("product_attribute_values_attribute_value_idx").on(table.attributeId, table.value),
  })
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    title: text("title").notNull(),
    optionSignature: text("option_signature").notNull(),
    priceMinor: integer("price_minor").notNull().default(0),
    compareAtPriceMinor: integer("compare_at_price_minor"),
    costPriceMinor: integer("cost_price_minor"),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("LKR"),
    weightGrams: integer("weight_grams"),
    status: variantStatusEnum("status").notNull().default("active"),
    isDefault: boolean("is_default").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    skuIdx: uniqueIndex("product_variants_sku_idx").on(table.sku),
    barcodeIdx: uniqueIndex("product_variants_barcode_idx").on(table.barcode),
    productSignatureIdx: uniqueIndex("product_variants_product_signature_idx").on(table.productId, table.optionSignature),
    productIdx: index("product_variants_product_idx").on(table.productId),
    statusIdx: index("product_variants_status_idx").on(table.status),
    defaultPerProductIdx: uniqueIndex("product_variants_default_per_product_idx").on(table.productId).where(sql`${table.isDefault} = true`),
    priceCheck: check("product_variants_price_non_negative_check", sql`${table.priceMinor} >= 0`),
  })
);

export const productVariantOptions = pgTable(
  "product_variant_options",
  {
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id").notNull().references(() => productAttributes.id, { onDelete: "cascade" }),
    attributeValueId: uuid("attribute_value_id").notNull().references(() => productAttributeValues.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.variantId, table.attributeId] }),
    valueIdx: index("product_variant_options_value_idx").on(table.attributeValueId),
  })
);

export const productVariantMedia = pgTable(
  "product_variant_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "restrict" }),
    role: text("role").notNull().default("gallery"),
    altText: text("alt_text"),
    isPrimary: boolean("is_primary").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    variantIdx: index("product_variant_media_variant_idx").on(table.variantId),
    primaryPerVariantIdx: uniqueIndex("product_variant_media_primary_per_variant_idx").on(table.variantId).where(sql`${table.isPrimary} = true`),
  })
);

export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    promoType: promotionTypeEnum("promo_type").notNull(),
    discountType: promotionDiscountTypeEnum("discount_type").notNull().default("message_only"),
    discountValue: integer("discount_value"),
    providerKey: text("provider_key"),
    badgeFileId: uuid("badge_file_id").references(() => files.id, { onDelete: "set null" }),
    badgeAlt: text("badge_alt"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("promotions_slug_idx").on(table.slug),
    activeIdx: index("promotions_active_idx").on(table.isActive),
  })
);

export const productPromotions = pgTable(
  "product_promotions",
  {
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    promotionId: uuid("promotion_id").notNull().references(() => promotions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.promotionId] }),
  })
);

export const productRecommendations = pgTable(
  "product_recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    recommendedProductId: uuid("recommended_product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    source: recommendationSourceEnum("source").notNull().default("manual"),
    score: integer("score").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniquePairIdx: uniqueIndex("product_recommendations_pair_idx").on(table.productId, table.recommendedProductId, table.source),
    productIdx: index("product_recommendations_product_idx").on(table.productId),
  })
);

export const productRelations = relations(products, ({ one, many }) => ({
  primaryCategory: one(categories, { fields: [products.primaryCategoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  variants: many(productVariants),
  attributes: many(productAttributes),
  media: many(productMedia),
  contentSections: many(productContentSections),
  specifications: many(productSpecifications),
}));

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    src: text("src").notNull(),
    alt: text("alt"),
    orientation: text("orientation"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_images_product_idx").on(table.productId),
  })
);

export const productPaymentPromos = pgTable(
  "product_payment_promos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    badgeImage: text("badge_image"),
    badgeAlt: text("badge_alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_payment_promos_product_idx").on(table.productId),
  })
);

export const productOptionGroups = pgTable(
  "product_option_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    selectedLabel: text("selected_label"),
    type: text("type").notNull().default("button"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_option_groups_product_idx").on(table.productId),
  })
);

export const productOptionValues = pgTable(
  "product_option_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id").notNull().references(() => productOptionGroups.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    color: text("color"),
    image: text("image"),
    available: boolean("available").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    groupIdx: index("product_option_values_group_idx").on(table.groupId),
  })
);

export const productAccordions = pgTable(
  "product_accordions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    defaultOpen: boolean("default_open").notNull().default(false),
    contentType: text("content_type").notNull().default("paragraphs"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_accordions_product_idx").on(table.productId),
  })
);

export const productAccordionBullets = pgTable(
  "product_accordion_bullets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accordionId: uuid("accordion_id").notNull().references(() => productAccordions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accordionIdx: index("product_accordion_bullets_accordion_idx").on(table.accordionId),
  })
);

export const productAccordionParagraphs = pgTable(
  "product_accordion_paragraphs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accordionId: uuid("accordion_id").notNull().references(() => productAccordions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accordionIdx: index("product_accordion_paragraphs_accordion_idx").on(table.accordionId),
  })
);

export const productRecommendationsSimple = pgTable(
  "product_recommendations_simple",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    recommendedProductSlug: text("recommended_product_slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_recommendations_simple_product_idx").on(table.productId),
  })
);

export const productVariantRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  options: many(productVariantOptions),
  media: many(productVariantMedia),
}));
