import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../core/db/client";
import { categories, categoryFilters } from "../../core/db/schema";

export type CategoryListQuery = {
  q?: string;
  status?: "active" | "inactive" | "hidden";
  sort?: "name" | "newest" | "sortOrder";
  page: number;
  pageSize: number;
};

export async function listDashboardCategories(query: CategoryListQuery) {
  const filters = [];
  if (query.status) filters.push(eq(categories.status, query.status));
  if (query.q) {
    filters.push(or(ilike(categories.name, `%${query.q}%`), ilike(categories.slug, `%${query.q}%`), ilike(categories.groupSlug, `%${query.q}%`)));
  }
  const where = filters.length ? and(...filters) : undefined;
  const orderBy = query.sort === "name" ? asc(categories.name) : query.sort === "sortOrder" ? asc(categories.sortOrder) : desc(categories.createdAt);
  const offset = (query.page - 1) * query.pageSize;
  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(categories).where(where);
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      groupSlug: categories.groupSlug,
      status: categories.status,
      sortOrder: categories.sortOrder,
      parentId: categories.parentId,
      createdAt: categories.createdAt,
      parentName: sql<string | null>`null`,
    })
    .from(categories)
    .where(where)
    .orderBy(orderBy)
    .limit(query.pageSize)
    .offset(offset);

  const enriched = rows.map((row) => ({ ...row, filterCount: 0 }));

  if (!rows.length) return { rows: enriched, total: totalRows[0]?.count ?? 0 };

  const idList = rows.map((r) => r.id).join(",");
  const filterCounts = await db
    .select({ categoryId: categoryFilters.categoryId, count: sql<number>`count(*)` })
    .from(categoryFilters)
    .where(sql`${categoryFilters.categoryId} = ANY(${sql.raw("ARRAY[" + idList.split(",").map((id) => "'" + id + "'").join(",") + "]::uuid[]")})`)
    .groupBy(categoryFilters.categoryId);

  const filterCountMap = new Map(filterCounts.map((f) => [f.categoryId, f.count]));
  for (const row of rows) {
    const match = filterCountMap.get(row.id);
    if (match !== undefined) {
      const enrichedRow = enriched.find((e) => e.id === row.id);
      if (enrichedRow) enrichedRow.filterCount = match;
    }
  }

  return { rows: enriched, total: totalRows[0]?.count ?? 0 };
}