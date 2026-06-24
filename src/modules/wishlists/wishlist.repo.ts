import { eq, and, desc } from "drizzle-orm";
import { db } from "../../core/db/client";
import { wishlistItems, products, productMedia, files, categories } from "../../core/db/schema";

export async function addWishlistItem(userId: string, productId: string) {
  const [item] = await db
    .insert(wishlistItems)
    .values({
      userId,
      productId,
    })
    .onConflictDoNothing()
    .returning();
  return item ?? null;
}

export async function removeWishlistItem(userId: string, productId: string) {
  const [deleted] = await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    )
    .returning();
  return deleted ?? null;
}

export async function getWishlistItems(userId: string) {
  const rows = await db
    .select({
      id: wishlistItems.id,
      addedAt: wishlistItems.addedAt,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      basePriceMinor: products.basePriceMinor,
      currencyCode: products.currencyCode,
      imagePublicUrl: files.publicUrl,
      isPrimary: productMedia.isPrimary,
      categoryName: categories.name,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .leftJoin(productMedia, eq(products.id, productMedia.productId))
    .leftJoin(files, eq(productMedia.fileId, files.id))
    .leftJoin(categories, eq(categories.id, products.primaryCategoryId))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.addedAt));

  return rows;
}

export type WishlistItemWithProduct = Awaited<ReturnType<typeof getWishlistItems>>[number];