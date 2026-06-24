import { and, asc, eq } from "drizzle-orm";
import { db } from "@/core/db/client";
import { categories, categoryFilters, categoryFilterOptions, categoryPageContent } from "@/core/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type CategoryRow = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;
export type CategoryPageContentRow = InferSelectModel<typeof categoryPageContent>;
export type CategoryPageContentInsert = InferInsertModel<typeof categoryPageContent>;
export type CategoryFilterRow = InferSelectModel<typeof categoryFilters>;
export type CategoryFilterInsert = InferInsertModel<typeof categoryFilters>;
export type CategoryFilterOptionRow = InferSelectModel<typeof categoryFilterOptions>;
export type CategoryFilterOptionInsert = InferInsertModel<typeof categoryFilterOptions>;

export function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export function listCategoriesByGroup(groupSlug: string) {
  return db.select().from(categories).where(eq(categories.groupSlug, groupSlug)).orderBy(asc(categories.sortOrder));
}

export async function getCategoryByGroupSlug(groupSlug: string, slug: string) {
  return db.query.categories.findFirst({
    where: and(eq(categories.groupSlug, groupSlug), eq(categories.slug, slug)),
    with: { pageContent: true, filters: { with: { options: true }, orderBy: asc(categoryFilters.sortOrder) } },
  });
}

export async function getCategoryById(id: string) {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: { pageContent: true, filters: { with: { options: true }, orderBy: asc(categoryFilters.sortOrder) } },
  });
}

export async function createCategory(values: CategoryInsert) {
  const [created] = await db.insert(categories).values(values).returning();
  return created ?? null;
}

export async function updateCategory(id: string, values: Partial<CategoryInsert>) {
  const [updated] = await db.update(categories).set({ ...values, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
  return updated ?? null;
}

export async function getCategoryPageContent(categoryId: string) {
  return db.query.categoryPageContent.findFirst({ where: eq(categoryPageContent.categoryId, categoryId) });
}

export async function upsertCategoryPageContent(categoryId: string, values: Partial<CategoryPageContentInsert>) {
  const existing = await getCategoryPageContent(categoryId);
  if (existing) {
    const [updated] = await db.update(categoryPageContent).set({ ...values, updatedAt: new Date() }).where(eq(categoryPageContent.categoryId, categoryId)).returning();
    return updated;
  }
  const [created] = await db.insert(categoryPageContent).values({ categoryId, ...values } as CategoryPageContentInsert).returning();
  return created ?? null;
}

export function listCategoryFilters(categoryId: string) {
  return db.select().from(categoryFilters).where(and(eq(categoryFilters.categoryId, categoryId), eq(categoryFilters.isActive, true))).orderBy(asc(categoryFilters.sortOrder));
}

export async function createCategoryFilter(values: CategoryFilterInsert) {
  const [created] = await db.insert(categoryFilters).values(values).returning();
  return created ?? null;
}

export async function updateCategoryFilter(id: string, values: Partial<CategoryFilterInsert>) {
  const [updated] = await db.update(categoryFilters).set({ ...values, updatedAt: new Date() }).where(eq(categoryFilters.id, id)).returning();
  return updated ?? null;
}

export async function deleteCategoryFilter(id: string) {
  await db.delete(categoryFilters).where(eq(categoryFilters.id, id));
}

export async function createCategoryFilterOption(values: CategoryFilterOptionInsert) {
  const [created] = await db.insert(categoryFilterOptions).values(values).returning();
  return created ?? null;
}

export async function updateCategoryFilterOption(id: string, values: Partial<CategoryFilterOptionInsert>) {
  const [updated] = await db.update(categoryFilterOptions).set(values).where(eq(categoryFilterOptions.id, id)).returning();
  return updated ?? null;
}

export async function deleteCategoryFilterOption(id: string) {
  await db.delete(categoryFilterOptions).where(eq(categoryFilterOptions.id, id));
}

export function listFilterOptions(filterId: string) {
  return db.select().from(categoryFilterOptions).where(and(eq(categoryFilterOptions.filterId, filterId), eq(categoryFilterOptions.isActive, true))).orderBy(asc(categoryFilterOptions.sortOrder));
}