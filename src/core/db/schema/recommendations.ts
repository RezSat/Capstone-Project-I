import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { customerProfiles } from "./auth";
import { categories } from "./catalog";
import { products } from "./products";
import { recommendationQuestionTypeEnum, recommendationSourceEnum } from "./enums";

export const recommendationSettings = pgTable(
  "recommendation_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull().default({}),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({ keyIdx: uniqueIndex("recommendation_settings_key_idx").on(table.key) })
);

export const recommendationQuestionnaires = pgTable(
  "recommendation_questionnaires",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("recommendation_questionnaires_slug_idx").on(table.slug),
    categoryIdx: index("recommendation_questionnaires_category_idx").on(table.categoryId),
  })
);

export const recommendationQuestions = pgTable(
  "recommendation_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionnaireId: uuid("questionnaire_id").notNull().references(() => recommendationQuestionnaires.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    helpText: text("help_text"),
    questionType: recommendationQuestionTypeEnum("question_type").notNull().default("single_choice"),
    isRequired: boolean("is_required").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    questionnaireKeyIdx: uniqueIndex("recommendation_questions_questionnaire_key_idx").on(table.questionnaireId, table.key),
  })
);

export const recommendationQuestionChoices = pgTable(
  "recommendation_question_choices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id").notNull().references(() => recommendationQuestions.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    weight: integer("weight").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    questionValueIdx: uniqueIndex("recommendation_question_choices_question_value_idx").on(table.questionId, table.value),
  })
);

export const customerRecommendationProfiles = pgTable(
  "customer_recommendation_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "cascade" }),
    guestTokenHash: text("guest_token_hash"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    profileJson: jsonb("profile_json").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index("customer_recommendation_profiles_customer_idx").on(table.customerId),
    guestIdx: index("customer_recommendation_profiles_guest_idx").on(table.guestTokenHash),
  })
);

export const customerRecommendationAnswers = pgTable(
  "customer_recommendation_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id").notNull().references(() => customerRecommendationProfiles.id, { onDelete: "cascade" }),
    questionId: uuid("question_id").notNull().references(() => recommendationQuestions.id, { onDelete: "cascade" }),
    answerJson: jsonb("answer_json").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    profileQuestionIdx: uniqueIndex("customer_recommendation_answers_profile_question_idx").on(table.profileId, table.questionId),
  })
);

export const recommendationEvents = pgTable(
  "recommendation_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "set null" }),
    guestTokenHash: text("guest_token_hash"),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    source: recommendationSourceEnum("source").notNull(),
    score: integer("score"),
    contextJson: jsonb("context_json").$type<Record<string, unknown>>().notNull().default({}),
    shownAt: timestamp("shown_at", { withTimezone: true }).notNull().defaultNow(),
    clickedAt: timestamp("clicked_at", { withTimezone: true }),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }),
  },
  (table) => ({
    customerIdx: index("recommendation_events_customer_idx").on(table.customerId),
    productIdx: index("recommendation_events_product_idx").on(table.productId),
    shownAtIdx: index("recommendation_events_shown_at_idx").on(table.shownAt),
  })
);

export const recommendationQuestionnaireRelations = relations(recommendationQuestionnaires, ({ many }) => ({
  questions: many(recommendationQuestions),
}));
